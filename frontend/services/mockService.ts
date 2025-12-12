import { ArticleAnalysis, Sentiment, Fact, Post, Platform, PostStatus } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAiService = {
  // Simulate parsing and analyzing an article
  analyzeArticle: async (url: string): Promise<ArticleAnalysis> => {
    await delay(2500); // Simulate processing time

    return {
      title: "Компания TechCorp запускает новый экологичный дата-центр",
      source: "TechDaily News",
      publishedAt: new Date().toLocaleDateString(),
      sentiment: Sentiment.POSITIVE,
      sentimentScore: 0.87,
      summary: "TechCorp объявила о запуске инновационного дата-центра, работающего на 100% возобновляемой энергии. Инвестиции составили 50 миллионов долларов. Ожидается снижение углеродного следа компании на 40% к 2026 году.",
      entities: [
        { name: "TechCorp", type: "ORG" },
        { name: "John Smith (CEO)", type: "PERSON" },
        { name: "Калифорния", type: "LOC" }
      ],
      facts: [
        { id: '1', text: "Инвестиции составили $50M", confidence: 0.98 },
        { id: '2', text: "100% возобновляемая энергия", confidence: 0.99 },
        { id: '3', text: "Снижение углеродного следа на 40%", confidence: 0.95 }
      ]
    };
  },

  // Simulate generating posts based on analysis
  generatePosts: async (analysis: ArticleAnalysis, platforms: Platform[]): Promise<Post[]> => {
    await delay(3000); // Simulate generation time

    return platforms.map(platform => {
      let content = "";
      const hashtags = ["#TechCorp", "#Innovation", "#GreenEnergy"];
      
      switch (platform) {
        case Platform.TELEGRAM:
          content = `⚡️ **TechCorp становится зеленее!**\n\nКомпания запустила новый дата-центр на возобновляемой энергии. Инвестиции — $50M. Это огромный шаг к устойчивому будущему!\n\n👇 Подробности в источнике.`;
          break;
        case Platform.VK:
          content = `TechCorp продолжает удивлять инновациями! 🌍\n\nМы рады сообщить об открытии нашего нового дата-центра, который полностью работает на зеленой энергии. Проект стоимостью $50 млн призван снизить наш углеродный след на 40% уже к следующему году.\n\nКак вы относитесь к "зеленым" инициативам в IT? Пишите в комментариях! 👇`;
          break;
        case Platform.LINKEDIN:
          content = `Рад поделиться важной новостью для IT-индустрии.\n\nTechCorp демонстрирует приверженность ESG-принципам, запуская новый дата-центр с нулевым уровнем выбросов. Стратегические инвестиции в размере $50M подтверждают лидерство компании в области устойчивого развития.\n\nОсновные показатели:\n✅ 100% возобновляемая энергия\n✅ -40% углеродного следа к 2026\n\n#Sustainability #TechLeadership #DataCenter`;
          break;
        case Platform.INSTAGRAM:
          content = `Будущее уже здесь! 🌱\n\nНовый эко-дата-центр TechCorp официально запущен.\n\n💰 $50M инвестиций\n📉 -40% выбросов\n⚡️ 100% чистая энергия\n\nСтавьте ❤️ если поддерживаете экологичные технологии!`;
          break;
        default:
          content = `Новость: ${analysis.title}`;
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        platform,
        content,
        hashtags,
        status: PostStatus.DRAFT,
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
        imageUrl: `https://picsum.photos/seed/${platform}/800/600`
      };
    });
  }
};
