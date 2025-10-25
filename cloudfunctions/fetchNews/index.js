// cloudfunctions/fetchNews/index.js
'use strict';

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { category = 'all', page = 1, pageSize = 10, keyword = '' } = event;
  
  try {
    console.log('获取新闻参数:', { category, page, pageSize, keyword });
    
    // 构建API请求参数
    const apiParams = {
      country: 'cn',
      pageSize: pageSize,
      page: page
    };
    
    // 根据分类设置不同的API参数
    if (category !== 'all') {
      switch (category) {
        case 'domestic':
          apiParams.country = 'cn';
          break;
        case 'international':
          apiParams.country = 'us';
          break;
        case 'technology':
          apiParams.category = 'technology';
          break;
        case 'economy':
          apiParams.category = 'business';
          break;
      }
    }
    
    // 如果有搜索关键词，添加到参数中
    if (keyword) {
      apiParams.q = keyword;
    }
    
    // 调用外部新闻API
    const newsApiKey = process.env.NEWS_API_KEY || 'your-news-api-key';
    const apiUrl = 'https://newsapi.org/v2/top-headlines';
    
    const response = await axios.get(apiUrl, {
      params: {
        ...apiParams,
        apiKey: newsApiKey
      },
      timeout: 10000
    });
    
    if (response.data.status === 'ok') {
      const articles = response.data.articles || [];
      
      // 处理新闻数据
      const processedNews = articles.map((article, index) => ({
        id: `news_${Date.now()}_${index}`,
        title: article.title || '无标题',
        content: article.content || article.description || '',
        summary: '', // 将在后续生成
        image: article.urlToImage || '',
        source: article.source?.name || '未知来源',
        url: article.url || '',
        publishTime: article.publishedAt || new Date().toISOString(),
        category: category,
        author: article.author || '',
        description: article.description || ''
      }));
      
      // 检查是否有更多数据
      const hasMore = articles.length === pageSize;
      
      // 缓存新闻数据到数据库
      if (processedNews.length > 0) {
        try {
          await db.collection('news').add({
            data: processedNews.map(news => ({
              ...news,
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          });
        } catch (error) {
          console.error('缓存新闻数据失败:', error);
        }
      }
      
      return {
        success: true,
        data: {
          list: processedNews,
          hasMore,
          total: processedNews.length,
          page,
          pageSize
        }
      };
    } else {
      throw new Error(response.data.message || '获取新闻失败');
    }
    
  } catch (error) {
    console.error('获取新闻失败:', error);
    
    // 如果API调用失败，尝试从数据库获取缓存数据
    try {
      const cachedNews = await db.collection('news')
        .where({
          category: category === 'all' ? db.command.exists(true) : category
        })
        .orderBy('publishTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get();
      
      if (cachedNews.data.length > 0) {
        return {
          success: true,
          data: {
            list: cachedNews.data,
            hasMore: cachedNews.data.length === pageSize,
            total: cachedNews.data.length,
            page,
            pageSize,
            fromCache: true
          }
        };
      }
    } catch (dbError) {
      console.error('获取缓存数据失败:', dbError);
    }
    
    // 返回模拟数据
    return {
      success: true,
      data: {
        list: getMockNews(category, pageSize),
        hasMore: false,
        total: pageSize,
        page,
        pageSize,
        fromMock: true
      }
    };
  }
};

// 获取模拟新闻数据
function getMockNews(category, count) {
  const mockNews = [
    {
      id: 'mock_1',
      title: '人工智能技术取得重大突破',
      content: '最新的人工智能研究在自然语言处理领域取得了重大突破，为未来的AI应用奠定了坚实基础。',
      summary: 'AI技术在自然语言处理方面取得重大进展，为未来应用奠定基础。',
      image: 'https://via.placeholder.com/400x300/007bff/ffffff?text=AI+News',
      source: '科技日报',
      url: 'https://example.com/news/1',
      publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'technology',
      author: '科技记者',
      description: 'AI技术突破的详细报道'
    },
    {
      id: 'mock_2',
      title: '全球经济形势分析报告',
      content: '最新的全球经济形势分析显示，各国经济正在逐步复苏，但仍面临诸多挑战。',
      summary: '全球经济逐步复苏，但仍需应对各种挑战。',
      image: 'https://via.placeholder.com/400x300/28a745/ffffff?text=Economy',
      source: '经济观察报',
      url: 'https://example.com/news/2',
      publishTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      category: 'economy',
      author: '经济分析师',
      description: '全球经济形势的深度分析'
    },
    {
      id: 'mock_3',
      title: '环保政策新进展',
      content: '政府出台新的环保政策，旨在推动绿色发展和可持续发展。',
      summary: '新环保政策推动绿色发展，促进可持续发展。',
      image: 'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Environment',
      source: '环保时报',
      url: 'https://example.com/news/3',
      publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'domestic',
      author: '环保记者',
      description: '环保政策的最新进展'
    }
  ];
  
  return mockNews.slice(0, count);
}
