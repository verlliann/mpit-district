"""AI Engine gRPC Service implementation."""
import time
import json
from typing import List
import structlog

import grpc
from generated import ai_engine_pb2, ai_engine_pb2_grpc
from generated import common_pb2, storage_pb2

from config import settings
from llm_providers import get_llm_provider, LLMProvider
from prompts import (
    ANALYZE_CONTENT_PROMPT,
    EXTRACT_FACTS_PROMPT,
    EXTRACT_ENTITIES_PROMPT,
    EXTRACT_QUOTES_PROMPT,
    ANALYZE_SENTIMENT_PROMPT,
    SUMMARIZE_PROMPT,
    GENERATE_POST_PROMPT,
)

logger = structlog.get_logger(__name__)
SERVICE_START_TIME = time.time()


class AIEngineServicer(ai_engine_pb2_grpc.AIEngineServiceServicer):
    """AI Engine gRPC Service."""
    
    def __init__(self):
        self.logger = logger.bind(service="ai-engine")
        self.version = "1.0.0"
    
    def _get_provider(self, provider_enum: int = None) -> LLMProvider:
        provider_map = {
            ai_engine_pb2.LLM_PROVIDER_OPENAI: "openai",
            ai_engine_pb2.LLM_PROVIDER_ANTHROPIC: "anthropic",
            ai_engine_pb2.LLM_PROVIDER_YANDEX: "yandex",
        }
        name = provider_map.get(provider_enum, settings.DEFAULT_LLM_PROVIDER)
        return get_llm_provider(name)
    
    def _create_metadata(self, provider: str, model: str, total_tokens: int = 0,
                         prompt_tokens: int = 0, completion_tokens: int = 0,
                         cost_usd: float = 0.0, processing_time_ms: int = 0):
        provider_enum = {"openai": ai_engine_pb2.LLM_PROVIDER_OPENAI,
                         "anthropic": ai_engine_pb2.LLM_PROVIDER_ANTHROPIC,
                         "yandex": ai_engine_pb2.LLM_PROVIDER_YANDEX}.get(provider, 0)
        
        return ai_engine_pb2.AnalysisMetadata(
            provider=provider_enum, model=model, total_tokens=total_tokens,
            prompt_tokens=prompt_tokens, completion_tokens=completion_tokens,
            cost_usd=cost_usd, processing_time_ms=processing_time_ms
        )
    
    def _parse_entity_type(self, type_str: str) -> int:
        # EntityType: PERSON=1, ORGANIZATION=2, LOCATION=3, EVENT=4, PRODUCT=5, OTHER=6
        return {"person": common_pb2.ENTITY_TYPE_PERSON,
                "organization": common_pb2.ENTITY_TYPE_ORGANIZATION,
                "location": common_pb2.ENTITY_TYPE_LOCATION,
                "event": common_pb2.ENTITY_TYPE_EVENT,
                "product": common_pb2.ENTITY_TYPE_PRODUCT,
                "date": common_pb2.ENTITY_TYPE_OTHER,      # нет в proto -> OTHER
                "money": common_pb2.ENTITY_TYPE_OTHER,     # нет в proto -> OTHER
                "percent": common_pb2.ENTITY_TYPE_OTHER,   # нет в proto -> OTHER
                "other": common_pb2.ENTITY_TYPE_OTHER}.get(type_str.lower(), 0)
    
    def _parse_sentiment(self, s: str) -> int:
        return {"positive": common_pb2.SENTIMENT_POSITIVE,
                "negative": common_pb2.SENTIMENT_NEGATIVE,
                "neutral": common_pb2.SENTIMENT_NEUTRAL,
                "mixed": common_pb2.SENTIMENT_NEUTRAL}.get(s.lower(), 0)  # mixed -> neutral (нет в proto)
    
    def _platform_to_string(self, p: int) -> str:
        return {common_pb2.PLATFORM_TELEGRAM: "Telegram", common_pb2.PLATFORM_VK: "VK",
                common_pb2.PLATFORM_INSTAGRAM: "Instagram", common_pb2.PLATFORM_LINKEDIN: "LinkedIn",
                common_pb2.PLATFORM_TWITTER: "Twitter", common_pb2.PLATFORM_FACEBOOK: "Facebook"}.get(p, "Unknown")
    
    def _style_to_string(self, s: int) -> str:
        # POST_STYLE: NEUTRAL=1, FORMAL=2, ENGAGING=3, INFORMAL=4, BUSINESS=5, CREATIVE=6
        return {common_pb2.POST_STYLE_NEUTRAL: "нейтральный",
                common_pb2.POST_STYLE_FORMAL: "формальный",
                common_pb2.POST_STYLE_ENGAGING: "вовлекающий",
                common_pb2.POST_STYLE_INFORMAL: "неформальный",
                common_pb2.POST_STYLE_BUSINESS: "деловой",
                common_pb2.POST_STYLE_CREATIVE: "креативный"}.get(s, "нейтральный")
    
    # ============================================================
    # RPC METHODS
    # ============================================================
    
    async def HealthCheck(self, request, context):
        return common_pb2.HealthCheckResponse(
            status="serving",
            service="ai-engine",
            version=self.version
        )
    
    async def AnalyzeContent(self, request, context):
        start = time.time()
        self.logger.info("AnalyzeContent", article_id=request.article_id)
        
        try:
            provider = self._get_provider()
            opts = request.options
            
            prompt = ANALYZE_CONTENT_PROMPT.format(
                title=request.title, content=request.content[:settings.MAX_CONTENT_LENGTH],
                extract_facts=opts.extract_facts, extract_entities=opts.extract_entities,
                extract_quotes=opts.extract_quotes, analyze_sentiment=opts.analyze_sentiment,
                generate_summary=opts.generate_summary, max_facts=opts.max_facts or 10,
                min_importance=opts.min_fact_importance or 5
            )
            
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            facts = [storage_pb2.Fact(content=f.get("content", ""), importance=f.get("importance", 5),
                                       source_text=f.get("source_text", ""), confidence=f.get("confidence", 0.8))
                     for f in result.get("facts", [])] if opts.extract_facts else []
            
            entities = [storage_pb2.Entity(name=e.get("name", ""), type=self._parse_entity_type(e.get("type", "")),
                                           normalized_name=e.get("normalized_name", e.get("name", "")))
                        for e in result.get("entities", [])] if opts.extract_entities else []
            
            quotes = [storage_pb2.Quote(text=q.get("text", ""), author=q.get("author", ""),
                                        context=q.get("context", ""), is_direct=q.get("is_direct", True))
                      for q in result.get("quotes", [])] if opts.extract_quotes else []
            
            sentiment = None
            if opts.analyze_sentiment and "sentiment" in result:
                s = result["sentiment"]
                sentiment = ai_engine_pb2.SentimentResult(
                    sentiment=self._parse_sentiment(s.get("sentiment", "neutral")),
                    score=s.get("score", 0.0), confidence=s.get("confidence", 0.8)
                )
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.AnalyzeContentResponse(
                success=True, facts=facts, entities=entities, quotes=quotes,
                sentiment=sentiment, summary=result.get("summary", "") if opts.generate_summary else "",
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens,
                                               response.prompt_tokens, response.completion_tokens,
                                               response.cost, processing_time)
            )
        except Exception as e:
            self.logger.error("AnalyzeContent failed", error=str(e))
            return ai_engine_pb2.AnalyzeContentResponse(success=False, error=str(e))
    
    async def GeneratePosts(self, request, context):
        start = time.time()
        self.logger.info("GeneratePosts", article_id=request.article_id, platforms=list(request.platforms))
        
        try:
            provider = self._get_provider()
            posts = []
            
            for platform in request.platforms:
                post = await self._generate_single_post(provider, request.article_id, platform,
                                                        request.style, request.formality_level,
                                                        list(request.key_facts), request.custom_instructions)
                posts.append(post)
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.GeneratePostsResponse(
                success=True, posts=posts,
                metadata=self._create_metadata(provider.name, provider.model, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("GeneratePosts failed", error=str(e))
            return ai_engine_pb2.GeneratePostsResponse(success=False, error=str(e))
    
    async def GeneratePost(self, request, context):
        start = time.time()
        self.logger.info("GeneratePost", article_id=request.article_id, platform=request.platform)
        
        try:
            provider = self._get_provider()
            post = await self._generate_single_post(provider, request.article_id, request.platform,
                                                    request.style, request.formality_level,
                                                    list(request.key_facts), request.custom_instructions)
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.GeneratePostResponse(
                success=True, post=post,
                metadata=self._create_metadata(provider.name, provider.model, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("GeneratePost failed", error=str(e))
            return ai_engine_pb2.GeneratePostResponse(success=False, error=str(e))
    
    async def RegeneratePost(self, request, context):
        start = time.time()
        self.logger.info("RegeneratePost", post_id=request.post_id)
        
        try:
            provider = self._get_provider()
            custom = f"Предыдущая версия отклонена: {request.feedback}" if request.feedback else ""
            
            post = await self._generate_single_post(provider, request.article_id, request.platform,
                                                    request.new_style, request.formality_level, [], custom)
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.GeneratePostResponse(
                success=True, post=post,
                metadata=self._create_metadata(provider.name, provider.model, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("RegeneratePost failed", error=str(e))
            return ai_engine_pb2.GeneratePostResponse(success=False, error=str(e))
    
    async def ExtractFacts(self, request, context):
        start = time.time()
        self.logger.info("ExtractFacts")
        
        try:
            provider = self._get_provider()
            prompt = EXTRACT_FACTS_PROMPT.format(
                title=request.title, content=request.content[:settings.MAX_CONTENT_LENGTH],
                max_facts=request.max_facts or 10, min_importance=request.min_importance or 5
            )
            
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            facts = [storage_pb2.Fact(content=f.get("content", ""), importance=f.get("importance", 5),
                                       source_text=f.get("source_text", ""), confidence=f.get("confidence", 0.8))
                     for f in result.get("facts", [])]
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.ExtractFactsResponse(
                facts=facts,
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens,
                                               response.prompt_tokens, response.completion_tokens,
                                               response.cost, processing_time)
            )
        except Exception as e:
            self.logger.error("ExtractFacts failed", error=str(e))
            return ai_engine_pb2.ExtractFactsResponse()
    
    async def ExtractEntities(self, request, context):
        start = time.time()
        self.logger.info("ExtractEntities")
        
        try:
            provider = self._get_provider()
            filter_types = ", ".join([common_pb2.EntityType.Name(t) for t in request.filter_types]) or "all"
            
            prompt = EXTRACT_ENTITIES_PROMPT.format(content=request.content[:settings.MAX_CONTENT_LENGTH], filter_types=filter_types)
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            entities = [storage_pb2.Entity(name=e.get("name", ""), type=self._parse_entity_type(e.get("type", "")),
                                           normalized_name=e.get("normalized_name", e.get("name", "")))
                        for e in result.get("entities", [])]
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.ExtractEntitiesResponse(
                entities=entities,
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("ExtractEntities failed", error=str(e))
            return ai_engine_pb2.ExtractEntitiesResponse()
    
    async def ExtractQuotes(self, request, context):
        start = time.time()
        self.logger.info("ExtractQuotes")
        
        try:
            provider = self._get_provider()
            prompt = EXTRACT_QUOTES_PROMPT.format(content=request.content[:settings.MAX_CONTENT_LENGTH], max_quotes=request.max_quotes or 5)
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            quotes = [storage_pb2.Quote(text=q.get("text", ""), author=q.get("author", ""),
                                        context=q.get("context", ""), is_direct=q.get("is_direct", True))
                      for q in result.get("quotes", [])]
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.ExtractQuotesResponse(
                quotes=quotes,
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("ExtractQuotes failed", error=str(e))
            return ai_engine_pb2.ExtractQuotesResponse()
    
    async def AnalyzeSentiment(self, request, context):
        start = time.time()
        self.logger.info("AnalyzeSentiment")
        
        try:
            provider = self._get_provider()
            prompt = ANALYZE_SENTIMENT_PROMPT.format(content=request.content[:settings.MAX_CONTENT_LENGTH])
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            aspects = [ai_engine_pb2.AspectSentiment(aspect=a.get("aspect", ""), sentiment=self._parse_sentiment(a.get("sentiment", "neutral")), score=a.get("score", 0.0))
                       for a in result.get("aspects", [])]
            
            sentiment = ai_engine_pb2.SentimentResult(
                sentiment=self._parse_sentiment(result.get("sentiment", "neutral")),
                score=result.get("score", 0.0), confidence=result.get("confidence", 0.8), aspects=aspects
            )
            
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.AnalyzeSentimentResponse(
                sentiment=sentiment,
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("AnalyzeSentiment failed", error=str(e))
            return ai_engine_pb2.AnalyzeSentimentResponse()
    
    async def Summarize(self, request, context):
        start = time.time()
        self.logger.info("Summarize")
        
        try:
            provider = self._get_provider()
            style_map = {ai_engine_pb2.SUMMARY_STYLE_BRIEF: "brief", ai_engine_pb2.SUMMARY_STYLE_NORMAL: "normal",
                         ai_engine_pb2.SUMMARY_STYLE_DETAILED: "detailed", ai_engine_pb2.SUMMARY_STYLE_BULLET: "bullet"}
            
            prompt = SUMMARIZE_PROMPT.format(content=request.content[:settings.MAX_CONTENT_LENGTH],
                                             max_length=request.max_length or 100,
                                             style=style_map.get(request.style, "normal"))
            response = await provider.complete(prompt)
            result = json.loads(response.content)
            
            summary = result.get("summary", "")
            processing_time = int((time.time() - start) * 1000)
            
            return ai_engine_pb2.SummarizeResponse(
                summary=summary, word_count=len(summary.split()),
                metadata=self._create_metadata(provider.name, response.model, response.total_tokens, processing_time_ms=processing_time)
            )
        except Exception as e:
            self.logger.error("Summarize failed", error=str(e))
            return ai_engine_pb2.SummarizeResponse()
    
    # ============================================================
    # HELPER
    # ============================================================
    
    async def _generate_single_post(self, provider: LLMProvider, article_id: str, platform: int,
                                     style: int, formality_level: int, key_facts: List, custom_instructions: str):
        facts_text = "\n".join([f"- {f.content}" for f in key_facts]) if key_facts else "Нет фактов"
        
        prompt = GENERATE_POST_PROMPT.format(
            platform=self._platform_to_string(platform), style=self._style_to_string(style),
            formality_level=formality_level or 5, key_facts=facts_text,
            custom_instructions=custom_instructions or "Нет"
        )
        
        response = await provider.complete(prompt)
        result = json.loads(response.content)
        
        warnings = ai_engine_pb2.ContentWarnings(
            potentially_offensive=result.get("warnings", {}).get("potentially_offensive", False),
            factual_uncertainty=result.get("warnings", {}).get("factual_uncertainty", False),
            needs_review=result.get("warnings", {}).get("needs_review", False),
            messages=result.get("warnings", {}).get("messages", [])
        )
        
        return ai_engine_pb2.GeneratedPost(
            platform=platform, content=result.get("content", ""), style=style,
            estimated_reach=result.get("estimated_reach", 0), quality_score=result.get("quality_score", 0.7),
            hashtags=result.get("hashtags", []), warnings=warnings
        )
