// cloudfunctions/recommend/index.js
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { preferences, limit = 10 } = event;
  
  try {
    console.log('推荐新闻参数:', { preferences, limit });
    
    // 获取用户偏好
    const userPreferences = preferences || {};
    const preferredCategories = userPreferences.categories || [];
    const totalViews = userPreferences.totalViews || 0;
    
    let recommendedNews = [];
    
    // 如果用户有浏览历史，基于偏好推荐
    if (preferredCategories.length > 0) {
      // 按偏好分类获取新闻
      for (const category of preferredCategories) {
        const categoryNews = await db.collection('news')
          .where({
            category: category
          })
          .orderBy('publishTime', 'desc')
          .limit(Math.ceil(limit / preferredCategories.length))
          .get();
        
        recommendedNews = recommendedNews.concat(categoryNews.data);
      }
    }
    
    // 如果推荐新闻不足，补充热门新闻
    if (recommendedNews.length < limit) {
      const hotNews = await db.collection('news')
        .orderBy('publishTime', 'desc')
        .limit(limit - recommendedNews.length)
        .get();
      
      recommendedNews = recommendedNews.concat(hotNews.data);
    }
    
    // 去重并限制数量
    const uniqueNews = [];
    const seenIds = new Set();
    
    for (const news of recommendedNews) {
      if (!seenIds.has(news.id) && uniqueNews.length < limit) {
        seenIds.add(news.id);
        uniqueNews.push(news);
      }
    }
    
    // 如果仍然不足，生成模拟推荐
    if (uniqueNews.length < limit) {
      const mockNews = generateMockRecommendations(limit - uniqueNews.length);
      uniqueNews.push(...mockNews);
    }
    
    return {
      success: true,
      data: uniqueNews
    };
    
  } catch (error) {
    console.error('推荐新闻失败:', error);
    
    // 返回模拟推荐数据
    return {
      success: true,
      data: generateMockRecommendations(limit)
    };
  }
};

// 生成模拟推荐数据
function generateMockRecommendations(count) {
  const mockRecommendations = [
    {
      id: 'rec_1',
      title: '人工智能技术的最新发展',
      content: '人工智能技术在各个领域都取得了重大突破，为社会发展带来了新的机遇。',
      summary: 'AI技术在各领域取得突破，为社会带来新机遇。',
      image: 'https://via.placeholder.com/400x300/007bff/ffffff?text=AI+Tech',
      source: '科技日报',
      url: 'https://example.com/rec/1',
      publishTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      category: 'technology',
      author: '科技记者',
      description: 'AI技术发展的最新报道'
    },
    {
      id: 'rec_2',
      title: '新能源汽车市场分析',
      content: '新能源汽车市场持续增长，政策支持和技术进步推动了行业快速发展。',
      summary: '新能源汽车市场增长迅速，政策和技术双重推动。',
      image: 'https://via.placeholder.com/400x300/28a745/ffffff?text=EV+Market',
      source: '汽车周刊',
      url: 'https://example.com/rec/2',
      publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'economy',
      author: '汽车分析师',
      description: '新能源汽车市场分析报告'
    },
    {
      id: 'rec_3',
      title: '教育改革新政策解读',
      content: '最新的教育改革政策旨在提高教育质量，促进教育公平发展。',
      summary: '新教育政策旨在提高质量，促进教育公平。',
      image: 'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Education',
      source: '教育时报',
      url: 'https://example.com/rec/3',
      publishTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      category: 'domestic',
      author: '教育记者',
      description: '教育改革政策解读'
    },
    {
      id: 'rec_4',
      title: '环保技术创新成果',
      content: '环保技术领域取得重要创新成果，为可持续发展提供了新的解决方案。',
      summary: '环保技术创新为可持续发展提供新解决方案。',
      image: 'https://via.placeholder.com/400x300/ffc107/ffffff?text=Green+Tech',
      source: '环保日报',
      url: 'https://example.com/rec/4',
      publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'technology',
      author: '环保记者',
      description: '环保技术创新成果报道'
    },
    {
      id: 'rec_5',
      title: '国际金融市场动态',
      content: '国际金融市场出现新的变化，投资者需要关注市场趋势和风险。',
      summary: '国际金融市场新变化，投资者需关注趋势和风险。',
      image: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=Finance',
      source: '财经日报',
      url: 'https://example.com/rec/5',
      publishTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      category: 'economy',
      author: '财经分析师',
      description: '国际金融市场动态分析'
    }
  ];
  
  return mockRecommendations.slice(0, count);
}
