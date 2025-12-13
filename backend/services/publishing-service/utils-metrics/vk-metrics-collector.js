require('dotenv').config();
const { VK } = require('vk-io');
const fs = require('fs');
const path = require('path');

class VKMetricsCollector {
    constructor(userToken, groupId) {
        this.vk = new VK({ token: userToken });
        this.groupId = Math.abs(parseInt(groupId));
    }

    /**
     * Получить метрики конкретного поста
     */
    async getPostMetrics(postId) {
        try {
            const [post] = await this.vk.api.wall.getById({
                posts: `${-this.groupId}_${postId}`
            });

            return {
                postId: post.id,
                date: new Date(post.date * 1000).toISOString(),
                text: post.text.substring(0, 100) + '...',
                views: post.views?.count || 0,
                likes: post.likes?.count || 0,
                comments: post.comments?.count || 0,
                reposts: post.reposts?.count || 0,
                engagement: this.calculateEngagement(post)
            };
        } catch (error) {
            console.error(`Ошибка получения поста ${postId}:`, error.message);
            return null;
        }
    }

    /**
     * Получить метрики всех постов за период
     */
    async getAllPostsMetrics(count = 100, offset = 0) {
        try {
            const response = await this.vk.api.wall.get({
                owner_id: -this.groupId,
                count: count,
                offset: offset
            });

            const posts = response.items.map(post => ({
                postId: post.id,
                date: new Date(post.date * 1000).toISOString(),
                text: post.text.substring(0, 100) + '...',
                views: post.views?.count || 0,
                likes: post.likes?.count || 0,
                comments: post.comments?.count || 0,
                reposts: post.reposts?.count || 0,
                engagement: this.calculateEngagement(post),
                url: `https://vk.com/wall-${this.groupId}_${post.id}`
            }));

            return {
                total: response.count,
                posts: posts
            };
        } catch (error) {
            console.error('Ошибка получения постов:', error.message);
            return null;
        }
    }

    /**
     * Получить статистику сообщества за период
     */
    async getCommunityStats(daysBack = 7) {
        try {
            const timestampFrom = Math.floor(Date.now() / 1000) - (daysBack * 86400);
            const timestampTo = Math.floor(Date.now() / 1000);

            const stats = await this.vk.api.stats.get({
                group_id: this.groupId,
                timestamp_from: timestampFrom,
                timestamp_to: timestampTo
            });

            return stats.map(day => ({
                date: day.period_from ? new Date(day.period_from * 1000).toISOString().split('T')[0] : 'N/A',
                reach: day.reach?.reach || 0,
                reachSubscribers: day.reach?.reach_subscribers || 0,
                visitors: day.visitors?.views || 0,
                views: day.reach?.reach || 0,
                likes: day.likes || 0,
                comments: day.comments || 0,
                shares: day.copies || 0,
                subscribed: day.members?.members || 0,
                unsubscribed: day.members?.members_minus || 0
            }));
        } catch (error) {
            console.error('Ошибка получения статистики:', error.message);
            return [];
        }
    }

    /**
     * Получить информацию о сообществе
     */
    async getCommunityInfo() {
        try {
            const [group] = await this.vk.api.groups.getById({
                group_id: this.groupId.toString(),
                fields: 'members_count,activity,description'
            });

            return {
                id: group.id,
                name: group.name || 'Без названия',
                screenName: group.screen_name || `club${group.id}`,
                membersCount: group.members_count || 0,
                description: group.description || '',
                url: `https://vk.com/${group.screen_name || 'club' + group.id}`
            };
        } catch (error) {
            console.error('Ошибка получения информации о группе:', error.message);
            return {
                id: this.groupId,
                name: 'Неизвестно',
                screenName: `club${this.groupId}`,
                membersCount: 0,
                description: '',
                url: `https://vk.com/club${this.groupId}`
            };
        }
    }

    /**
     * Расчёт engagement rate
     */
    calculateEngagement(post) {
        const views = post.views?.count || 0;
        if (views === 0) return 0;

        const interactions = 
            (post.likes?.count || 0) + 
            (post.comments?.count || 0) + 
            (post.reposts?.count || 0);

        return ((interactions / views) * 100).toFixed(2);
    }

    /**
     * Сохранить метрики в файл
     */
    async saveMetricsToFile(metrics, filename) {
        const dir = path.join(__dirname, '..', 'metrics');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2), 'utf-8');
        console.log(`✅ Метрики сохранены: ${filepath}`);
        return filepath;
    }

    /**
     * Сохранить метрики в текстовый отчёт
     */
    async saveMetricsReport(metrics, filename) {
        const dir = path.join(__dirname, '..', 'metrics');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let report = '========================================\n';
        report += 'ОТЧЁТ ПО МЕТРИКАМ VK СООБЩЕСТВА\n';
        report += '========================================\n\n';
        report += `Дата создания: ${new Date().toLocaleString('ru-RU')}\n\n`;

        if (metrics.community) {
            report += '--- ИНФОРМАЦИЯ О СООБЩЕСТВЕ ---\n';
            report += `Название: ${metrics.community.name}\n`;
            report += `Ссылка: ${metrics.community.url}\n`;
            report += `Подписчиков: ${metrics.community.membersCount.toLocaleString('ru-RU')}\n\n`;
        }

        if (metrics.stats && metrics.stats.length > 0) {
            report += '--- СТАТИСТИКА ЗА ПЕРИОД ---\n';
            metrics.stats.forEach(day => {
                report += `\n📅 ${day.date}\n`;
                report += `  Охват: ${day.reach}\n`;
                report += `  Посетители: ${day.visitors}\n`;
                report += `  Просмотры: ${day.views}\n`;
                report += `  Лайки: ${day.likes}\n`;
                report += `  Комментарии: ${day.comments}\n`;
                report += `  Репосты: ${day.shares}\n`;
            });
            report += '\n';
        }

        if (metrics.posts) {
            report += '--- МЕТРИКИ ПОСТОВ ---\n';
            report += `Всего постов: ${metrics.posts.total}\n\n`;
            
            metrics.posts.posts.forEach((post, index) => {
                report += `${index + 1}. Пост #${post.postId}\n`;
                report += `   Дата: ${new Date(post.date).toLocaleString('ru-RU')}\n`;
                report += `   Просмотры: ${post.views}\n`;
                report += `   Лайки: ${post.likes}\n`;
                report += `   Комментарии: ${post.comments}\n`;
                report += `   Репосты: ${post.reposts}\n`;
                report += `   Engagement: ${post.engagement}%\n`;
                report += `   Ссылка: ${post.url}\n\n`;
            });
        }

        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, report, 'utf-8');
        console.log(`✅ Отчёт сохранён: ${filepath}`);
        return filepath;
    }
}

module.exports = VKMetricsCollector;

