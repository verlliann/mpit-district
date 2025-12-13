import React, { useState } from 'react';
import { Card, Button, Input, Badge, ProgressBar } from '../components/ui';
import { useMutation } from '@apollo/client';
import { PARSE_ARTICLE, GENERATE_POSTS, PUBLISH_POST } from '../services/graphql/mutations';
import { ArticleAnalysis, Platform, Post, Sentiment } from '../types';
import { ArrowRight, Link, FileText, Check, AlertTriangle, RefreshCw, Calendar, Copy, Edit2, Send } from 'lucide-react';

const STEPS = ['Источник', 'Анализ', 'Настройки', 'Результат'];

export const CreateContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.TELEGRAM, Platform.VK, Platform.LINKEDIN]);
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [articleId, setArticleId] = useState<string | null>(null);

  const [parseArticle, { loading: parsingLoading }] = useMutation(PARSE_ARTICLE);
  const [generatePosts, { loading: generatingLoading }] = useMutation(GENERATE_POSTS);
  const [publishPost, { loading: publishingLoading }] = useMutation(PUBLISH_POST);
  const [publishedPosts, setPublishedPosts] = useState<Record<string, boolean>>({});

  const isLoading = parsingLoading || generatingLoading;

  const handlePublish = async (postId: string, platform: string) => {
    try {
      const { data } = await publishPost({ variables: { id: postId } });
      if (data?.publishPost?.success) {
        setPublishedPosts(prev => ({ ...prev, [postId]: true }));
        alert(`✅ Пост успешно опубликован в ${platform}!`);
      } else {
        alert(`❌ Ошибка: ${data?.publishPost?.error || 'Не удалось опубликовать'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`❌ Ошибка публикации: ${e.message}`);
    }
  };

  const handleAnalyze = async () => {
    if (!url) return;
    try {
      const { data } = await parseArticle({ 
        variables: { url } 
      });
      
      if (data?.parseArticle?.article) {
        const article = data.parseArticle.article;
        setArticleId(article.id);
        
        // Преобразуем данные из GraphQL в формат компонента
        setAnalysis({
          title: article.title,
          summary: article.excerpt || article.content?.substring(0, 200) + '...',
          source: article.source,
          publishedAt: new Date(article.publishedAt).toLocaleDateString('ru-RU'),
          sentiment: article.sentiment || 'NEUTRAL',
          sentimentScore: article.sentimentScore || 0.7,
          facts: article.facts?.map((f: any) => ({
            id: f.id,
            text: f.text,
            confidence: f.importance / 10 || 0.8
          })) || [],
          entities: article.entities?.map((e: any) => ({
            name: e.name,
            type: e.type
          })) || []
        });
        setCurrentStep(2);
      } else if (data?.parseArticle?.error) {
        alert('Ошибка парсинга: ' + data.parseArticle.error);
      }
    } catch (e: any) {
      console.error(e);
      alert('Ошибка: ' + (e.message || 'Не удалось распарсить статью'));
    }
  };

  const handleGenerate = async () => {
    if (!articleId) return;
    try {
      const { data } = await generatePosts({ 
        variables: { 
          input: {
            articleId,
            platforms: selectedPlatforms,
            style: 'ENGAGING',
            formalityLevel: 7
          }
        } 
      });
      
      if (data?.generatePosts) {
        const posts = data.generatePosts.map((p: any) => ({
          id: p.id,
          platform: p.platform,
          content: p.content,
          hashtags: p.content.match(/#\w+/g) || [],
          imageUrl: p.images?.[0]?.url || 'https://via.placeholder.com/400'
        }));
        setGeneratedPosts(posts);
        setCurrentStep(4);
      }
    } catch (e: any) {
      console.error(e);
      alert('Ошибка: ' + (e.message || 'Не удалось сгенерировать посты'));
    }
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter(pl => pl !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // --- Step 1: Input ---
  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Что будем публиковать?</h2>
        <p className="text-slate-600 mt-1 text-sm">Вставьте ссылку на новость или пресс-релиз</p>
      </div>
      
      <Card className="p-6 shadow-2xl shadow-blue-900/10">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-4 w-4 text-slate-400" />
            </div>
            <Input 
              placeholder="https://example.com/news/article-123" 
              className="pl-9 h-11 text-base bg-white/60 focus:bg-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Поддерживаются: .ru, .com домены</span>
            <span>PDF файлы также поддерживаются</span>
          </div>
          <Button 
            size="lg" 
            className="w-full h-11 text-base shadow-blue-500/25" 
            onClick={handleAnalyze} 
            disabled={!url}
            isLoading={isLoading}
          >
            Анализировать статью <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs text-slate-600">
        <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm shadow-sm hover:bg-white/60 transition-colors">
          <div className="font-bold text-slate-800 mb-1 text-sm">🔍 Парсинг</div>
          Очистка от рекламы и мусора
        </div>
        <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm shadow-sm hover:bg-white/60 transition-colors">
          <div className="font-bold text-slate-800 mb-1 text-sm">🧠 AI Анализ</div>
          Выделение фактов и тональности
        </div>
        <div className="p-4 bg-white/40 rounded-xl border border-white/50 backdrop-blur-sm shadow-sm hover:bg-white/60 transition-colors">
          <div className="font-bold text-slate-800 mb-1 text-sm">✍️ Генерация</div>
          Адаптация под 5+ платформ
        </div>
      </div>
    </div>
  );

  // --- Step 2: Analysis Review ---
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Результаты анализа</h2>
        <Button variant="secondary" size="sm" onClick={() => setCurrentStep(1)}>Назад</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{analysis?.title}</h3>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span className="bg-slate-100/50 px-1.5 py-0.5 rounded-md">{analysis?.source}</span>
                  <span>•</span>
                  <span>{analysis?.publishedAt}</span>
                </div>
              </div>
              <Badge variant="success">Parsed</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed mb-6 text-sm">
              {analysis?.summary}
            </p>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-green-600" /> Ключевые факты
              </h4>
              <ul className="space-y-2">
                {analysis?.facts.map(fact => (
                  <li key={fact.id} className="flex items-start text-xs text-slate-700 font-medium">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2.5 flex-shrink-0 shadow-sm shadow-blue-500/50"></span>
                    <span className="flex-1">{fact.text}</span>
                    <span className="ml-2 text-[10px] text-slate-500 bg-white/60 px-1.5 py-0.5 rounded border border-white/50 shadow-sm">
                      {Math.round(fact.confidence * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">Тональность</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-green-600">Позитивная</span>
              <span className="text-xs font-bold text-slate-700">{Math.round((analysis?.sentimentScore || 0) * 100)}%</span>
            </div>
            <ProgressBar progress={(analysis?.sentimentScore || 0) * 100} colorClass="bg-green-500" />
            
            <div className="mt-6">
              <h4 className="font-bold text-slate-800 mb-2 text-sm">Сущности</h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis?.entities.map((ent, i) => (
                  <Badge key={i} variant="neutral">{ent.name}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Button className="w-full h-10 text-sm" onClick={() => setCurrentStep(3)}>
            Перейти к настройкам
          </Button>
        </div>
      </div>
    </div>
  );

  // --- Step 3: Settings ---
  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Настройка генерации</h2>
        <Button variant="secondary" size="sm" onClick={() => setCurrentStep(2)}>Назад</Button>
      </div>

      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">Выберите платформы</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(Platform).map((p) => {
            const isSelected = selectedPlatforms.includes(p);
            return (
              <div 
                key={p}
                onClick={() => togglePlatform(p)}
                className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-center font-bold text-xs shadow-sm ${
                  isSelected 
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 shadow-blue-500/10' 
                    : 'border-slate-200/50 bg-white/40 hover:bg-white/70 text-slate-600'
                }`}
              >
                {p}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">Стиль и Тон (Tone of Voice)</h3>
        <div className="space-y-4">
           <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Стиль повествования</label>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-blue-50/50 border-blue-200/50 text-blue-700 text-xs">Информационный</Button>
              <Button variant="glass" size="sm" className="text-xs">Вовлекающий</Button>
              <Button variant="glass" size="sm" className="text-xs">Вирусный</Button>
            </div>
           </div>
           <div>
             <label className="text-xs font-semibold text-slate-700 mb-2 block">Уровень формальности</label>
             <input type="range" className="w-full h-1.5 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-blue-600" />
             <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-1">
               <span>Casual</span>
               <span>Official</span>
             </div>
           </div>
        </div>
      </Card>

      <Button 
        size="lg" 
        className="w-full h-11 text-base" 
        onClick={handleGenerate} 
        isLoading={isLoading}
      >
        Сгенерировать посты
      </Button>
    </div>
  );

  // --- Step 4: Result ---
  const renderStep4 = () => {
    const activePost = generatedPosts[activePostIndex];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Готовые публикации</h2>
          <div className="flex gap-2">
             <Button variant="secondary" size="sm" onClick={() => setCurrentStep(3)}>Настройки</Button>
             <Button size="sm">Сохранить все</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* List */}
          <div className="lg:col-span-3 space-y-3">
             {generatedPosts.map((post, idx) => (
               <div 
                key={post.id}
                onClick={() => setActivePostIndex(idx)}
                className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                  idx === activePostIndex 
                    ? 'bg-white/80 border-blue-400/50 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                    : 'bg-white/40 border-transparent hover:bg-white/60 hover:border-white/50'
                }`}
               >
                 <div className="flex items-center justify-between mb-1.5">
                   <Badge variant="blue">{post.platform}</Badge>
                   <span className="text-[10px] text-slate-400 font-medium">Draft</span>
                 </div>
                 <p className="text-xs text-slate-600 line-clamp-2 leading-snug">{post.content}</p>
               </div>
             ))}
          </div>

          {/* Editor */}
          <div className="lg:col-span-6">
            <Card className="h-full flex flex-col shadow-2xl shadow-blue-900/5">
              <div className="p-3 border-b border-slate-200/50 flex justify-between items-center bg-white/20">
                <span className="font-bold text-slate-700 text-sm">Редактор</span>
                <div className="flex gap-1">
                   <button className="p-1.5 hover:bg-white/50 rounded-lg text-slate-500 transition-colors"><RefreshCw size={14} /></button>
                   <button className="p-1.5 hover:bg-white/50 rounded-lg text-slate-500 transition-colors"><Copy size={14} /></button>
                </div>
              </div>
              <div className="flex-1 p-0">
                <textarea 
                  className="w-full h-full p-6 resize-none focus:outline-none text-slate-800 leading-relaxed min-h-[350px] bg-transparent text-sm font-light"
                  value={activePost?.content}
                  onChange={(e) => {
                    const newPosts = [...generatedPosts];
                    newPosts[activePostIndex].content = e.target.value;
                    setGeneratedPosts(newPosts);
                  }}
                />
              </div>
              <div className="p-3 border-t border-slate-200/50 bg-slate-50/30 rounded-b-xl flex gap-2 flex-wrap backdrop-blur-sm">
                {activePost?.hashtags.map(tag => (
                  <span key={tag} className="text-blue-600 text-xs font-medium cursor-pointer hover:underline hover:text-blue-700">{tag}</span>
                ))}
              </div>
            </Card>
          </div>

          {/* Preview / Tools */}
          <div className="lg:col-span-3 space-y-3">
             <Card className="overflow-hidden border-0">
               <div className="aspect-square bg-slate-100 relative group">
                 <img src={activePost?.imageUrl} alt="Post visual" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                   <Button variant="glass" size="sm" className="text-white border-white/50 hover:bg-white/20">
                      <Edit2 className="mr-2" size={14} /> Изменить
                   </Button>
                 </div>
               </div>
               <div className="p-2 text-[10px] text-center text-slate-500 font-medium bg-white/50 backdrop-blur-md">
                 Изображение 1080x1080 (1:1)
               </div>
             </Card>
             
             <Card className="p-4">
               <h4 className="font-bold mb-3 text-xs text-slate-800">🚀 Публикация</h4>
               <Button 
                 className="w-full text-sm h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                 onClick={() => handlePublish(activePost?.id || '', activePost?.platform || '')}
                 disabled={publishingLoading || publishedPosts[activePost?.id || '']}
               >
                 <Send size={16} className="mr-2" />
                 {publishingLoading ? 'Отправка...' : publishedPosts[activePost?.id || ''] ? '✓ Отправлено' : 'Отправить'}
               </Button>
             </Card>
             
             <Card className="p-4">
               <h4 className="font-bold mb-2 text-xs text-slate-800">Планирование</h4>
               <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 bg-white/40 p-2 rounded-lg border border-white/40">
                 <Calendar size={14} className="text-blue-500" />
                 <span className="font-medium">Завтра, 10:00</span>
               </div>
               <Button variant="secondary" className="w-full text-xs h-8">Изменить время</Button>
             </Card>

             {!publishedPosts[activePost?.id || ''] && (
               <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100/50 backdrop-blur-md">
                 <div className="flex items-start gap-2">
                    <Send className="text-blue-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-blue-900 leading-relaxed font-medium">
                      Нажмите кнопку выше чтобы опубликовать пост в социальную сеть
                    </p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight">Создание контента</h1>
        {/* Progress Stepper */}
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/50 -z-10 rounded-full"></div>
           {STEPS.map((step, index) => {
             const stepNum = index + 1;
             const isActive = stepNum === currentStep;
             const isCompleted = stepNum < currentStep;
             
             return (
               <div key={step} className="flex flex-col items-center">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-300 shadow-sm ${
                   isActive ? 'border-blue-500/50 bg-blue-600 text-white scale-110 shadow-blue-500/30' : 
                   isCompleted ? 'border-green-500/50 bg-green-500 text-white shadow-green-500/30' : 
                   'border-white/60 bg-white/40 text-slate-400 backdrop-blur-md'
                 }`}>
                   {isCompleted ? <Check size={14} /> : stepNum}
                 </div>
                 <span className={`text-[10px] mt-2 font-semibold px-1.5 py-0.5 rounded-md ${isActive ? 'text-blue-700 bg-blue-50/50 backdrop-blur-sm' : 'text-slate-500'}`}>
                   {step}
                 </span>
               </div>
             )
           })}
        </div>
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
};