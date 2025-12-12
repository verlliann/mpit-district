require('dotenv').config({ path: '../.env' });
const VKMetricsCollector = require('./vk-metrics-collector');

async function collectMetrics() {
    const userToken = process.env.VK_USER_TOKEN;
    const groupId = process.env.VK_GROUP_ID;

    if (!userToken) {
        console.error('❌ VK_USER_TOKEN не найден в .env');
        return;
    }

    console.log('🚀 Начинаю сбор метрик VK...\n');

    const collector = new VKMetricsCollector(userToken, groupId);

    // Собираем все данные
    const metrics = {};

    // 1. Информация о сообществе
    console.log('📱 Получаю информацию о сообществе...');
    metrics.community = await collector.getCommunityInfo();
    console.log(`   ✅ ${metrics.community.name}\n`);

    // 2. Статистика за последние 7 дней
    console.log('📊 Получаю статистику за 7 дней...');
    metrics.stats = await collector.getCommunityStats(7);
    console.log(`   ✅ Получено ${metrics.stats.length} записей\n`);

    // 3. Метрики последних 20 постов
    console.log('📝 Получаю метрики постов...');
    metrics.posts = await collector.getAllPostsMetrics(20, 0);
    console.log(`   ✅ Получено ${metrics.posts.posts.length} постов\n`);

    // Сохраняем в JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await collector.saveMetricsToFile(
        metrics, 
        `vk_metrics_${timestamp}.json`
    );

    // Сохраняем текстовый отчёт
    await collector.saveMetricsReport(
        metrics,
        `vk_report_${timestamp}.txt`
    );

    console.log('\n✅ Сбор метрик завершён!');
    console.log('\n📊 Краткая сводка:');
    console.log(`   Сообщество: ${metrics.community.name}`);
    console.log(`   Подписчиков: ${metrics.community.membersCount.toLocaleString('ru-RU')}`);
    console.log(`   Всего постов: ${metrics.posts.total}`);
    console.log(`   Собрано метрик: ${metrics.posts.posts.length} постов`);
    
    // Топ-3 поста по просмотрам
    const topPosts = metrics.posts.posts
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);
    
    console.log('\n🏆 Топ-3 постов по просмотрам:');
    topPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. Пост #${post.postId}: ${post.views} просмотров (${post.engagement}% engagement)`);
    });
}

collectMetrics();

