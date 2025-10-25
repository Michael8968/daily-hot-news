// pages/discover/discover.js
'use strict';

const app = getApp();
const { formatDate, throttle } = require('../../utils/util');

Page({
  data: {
    // 推荐新闻
    recommendedNews: [],
    // 热搜榜
    hotSearchList: [],
    // 专题推荐
    topics: [],
    // 加载状态
    loading: false,
    refreshing: false,
    // 当前标签
    currentTab: 'recommend',
    tabs: [
      { id: 'recommend', name: '推荐' },
      { id: 'hot', name: '热搜' },
      { id: 'topic', name: '专题' }
    ]
  },

  onLoad(options) {
    console.log('发现页加载', options);
    this.initPage();
  },

  onShow() {
    console.log('发现页显示');
  },

  onReady() {
    console.log('发现页准备就绪');
  },

  onHide() {
    console.log('发现页隐藏');
  },

  onUnload() {
    console.log('发现页卸载');
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData();
  },

  onShareAppMessage() {
    return {
      title: '每日热点新闻 - 发现更多精彩内容',
      path: '/pages/discover/discover',
      imageUrl: '/images/share-discover.jpg'
    };
  },

  // 初始化页面
  async initPage() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 并行加载所有数据
      await Promise.all([
        this.loadRecommendedNews(),
        this.loadHotSearchList(),
        this.loadTopics()
      ]);
      
      // 记录用户行为
      app.recordUserAction('view_discover');
      
    } catch (error) {
      console.error('初始化页面失败:', error);
      this.showError('加载失败，请重试');
    } finally {
      wx.hideLoading();
    }
  },

  // 加载推荐新闻
  async loadRecommendedNews() {
    try {
      // 检查缓存
      const cachedRecommend = wx.getStorageSync('recommendedNews');
      if (cachedRecommend && this.isDataFresh(cachedRecommend.timestamp)) {
        this.setData({ recommendedNews: cachedRecommend.data });
        return;
      }

      // 获取用户浏览历史
      const viewedNews = wx.getStorageSync('viewedNews') || [];
      const userPreferences = this.analyzeUserPreferences(viewedNews);

      // 调用云函数获取推荐新闻
      const result = await wx.cloud.callFunction({
        name: 'recommend',
        data: { 
          preferences: userPreferences,
          limit: 10
        }
      });

      if (result.result && result.result.success) {
        const newsData = result.result.data;
        this.setData({ recommendedNews: newsData });
        
        // 缓存数据
        wx.setStorageSync('recommendedNews', {
          data: newsData,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('加载推荐新闻失败:', error);
      // 使用默认推荐
      this.setData({
        recommendedNews: this.getDefaultRecommendations()
      });
    }
  },

  // 加载热搜榜
  async loadHotSearchList() {
    try {
      // 检查缓存
      const cachedHot = wx.getStorageSync('hotSearchList');
      if (cachedHot && this.isDataFresh(cachedHot.timestamp)) {
        this.setData({ hotSearchList: cachedHot.data });
        return;
      }

      // 调用云函数获取热搜榜
      const result = await wx.cloud.callFunction({
        name: 'getHotSearch',
        data: { limit: 20 }
      });

      if (result.result && result.result.success) {
        const hotData = result.result.data;
        this.setData({ hotSearchList: hotData });
        
        // 缓存数据
        wx.setStorageSync('hotSearchList', {
          data: hotData,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('加载热搜榜失败:', error);
      // 使用默认热搜
      this.setData({
        hotSearchList: this.getDefaultHotSearch()
      });
    }
  },

  // 加载专题
  async loadTopics() {
    try {
      // 检查缓存
      const cachedTopics = wx.getStorageSync('topics');
      if (cachedTopics && this.isDataFresh(cachedTopics.timestamp)) {
        this.setData({ topics: cachedTopics.data });
        return;
      }

      // 调用云函数获取专题
      const result = await wx.cloud.callFunction({
        name: 'getTopics',
        data: { limit: 6 }
      });

      if (result.result && result.result.success) {
        const topicsData = result.result.data;
        this.setData({ topics: topicsData });
        
        // 缓存数据
        wx.setStorageSync('topics', {
          data: topicsData,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('加载专题失败:', error);
      // 使用默认专题
      this.setData({
        topics: this.getDefaultTopics()
      });
    }
  },

  // 分析用户偏好
  analyzeUserPreferences(viewedNews) {
    const categoryCount = {};
    const sourceCount = {};
    
    viewedNews.forEach(news => {
      // 统计分类偏好
      if (categoryCount[news.category]) {
        categoryCount[news.category]++;
      } else {
        categoryCount[news.category] = 1;
      }
    });

    // 获取前3个偏好分类
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      categories: topCategories,
      totalViews: viewedNews.length
    };
  },

  // 切换标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData({ currentTab: tab });
    
    // 记录用户行为
    app.recordUserAction('switch_tab', { tab });
  },

  // 点击推荐新闻
  onRecommendNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${newsId}`
    });
  },

  // 点击热搜项
  onHotSearchTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    
    // 跳转到搜索页面或首页搜索
    wx.switchTab({
      url: '/pages/index/index'
    });
    
    // 记录搜索行为
    app.recordUserAction('search_hot', { keyword });
  },

  // 点击专题
  onTopicTap(e) {
    const topicId = e.currentTarget.dataset.id;
    const topic = this.data.topics.find(t => t.id === topicId);
    
    if (topic) {
      // 跳转到专题详情或相关新闻列表
      wx.navigateTo({
        url: `/pages/topic/topic?id=${topicId}`
      });
      
      // 记录用户行为
      app.recordUserAction('view_topic', { topicId });
    }
  },

  // 刷新数据
  async refreshData() {
    this.setData({ refreshing: true });
    
    try {
      await Promise.all([
        this.loadRecommendedNews(),
        this.loadHotSearchList(),
        this.loadTopics()
      ]);
    } catch (error) {
      console.error('刷新数据失败:', error);
      this.showError('刷新失败，请重试');
    } finally {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  // 获取默认推荐
  getDefaultRecommendations() {
    return [
      {
        id: 'rec1',
        title: '人工智能技术的最新发展',
        image: '/images/ai-news.jpg',
        category: '科技',
        source: '科技日报',
        publishTime: '2小时前'
      },
      {
        id: 'rec2',
        title: '全球经济形势分析',
        image: '/images/economy-news.jpg',
        category: '经济',
        source: '经济观察报',
        publishTime: '3小时前'
      }
    ];
  },

  // 获取默认热搜
  getDefaultHotSearch() {
    return [
      { id: 1, keyword: '人工智能', hot: true },
      { id: 2, keyword: '新能源汽车', hot: true },
      { id: 3, keyword: '疫情防控', hot: false },
      { id: 4, keyword: '教育改革', hot: false },
      { id: 5, keyword: '环保政策', hot: false }
    ];
  },

  // 获取默认专题
  getDefaultTopics() {
    return [
      {
        id: 'topic1',
        title: '科技创新',
        description: '最新科技动态',
        image: '/images/topic-tech.jpg',
        newsCount: 15
      },
      {
        id: 'topic2',
        title: '经济发展',
        description: '经济热点分析',
        image: '/images/topic-economy.jpg',
        newsCount: 12
      }
    ];
  },

  // 判断数据是否新鲜
  isDataFresh(timestamp) {
    return Date.now() - timestamp < 10 * 60 * 1000; // 10分钟
  },

  // 显示错误信息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
});
