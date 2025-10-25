// pages/index/index.js
'use strict';

const { getConfig, getApiConfig, isDevelopment, debug, info } = require('../../utils/config.js');

Page({
  data: {
    newsList: [],
    loading: false,
    config: null
  },

  onLoad() {
    console.log('首页加载');

    // 获取配置信息
    this.loadConfig();

    // 加载新闻数据
    this.loadNews();
  },

  onShow() {
    console.log('首页显示');
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadNews();
  },

  onReachBottom() {
    console.log('上拉加载更多');
    this.loadMoreNews();
  },

  // 加载配置信息
  loadConfig() {
    try {
      const config = {
        isDev: isDevelopment(),
        apiConfig: getApiConfig(),
        cloudEnvId: getConfig('cloudEnvId'),
        logLevel: getConfig('logLevel')
      };

      this.setData({ config });

      debug('配置信息已加载', config);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  },

  // 加载新闻数据
  async loadNews() {
    this.setData({ loading: true });

    try {
      // 获取API配置
      const apiConfig = getApiConfig();
      debug('使用API配置:', apiConfig);

      // 调用云函数获取新闻
      const result = await wx.cloud.callFunction({
        name: 'fetchNews',
        data: {
          apiKey: apiConfig.newsApiKey,
          baseUrl: apiConfig.newsApiBaseUrl,
          timeout: apiConfig.requestTimeout
        }
      });

      if (result.result.success) {
        this.setData({
          newsList: result.result.data,
          loading: false
        });

        info('新闻加载成功', { count: result.result.data.length });
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('加载新闻失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 加载更多新闻
  async loadMoreNews() {
    // 实现分页加载逻辑
    console.log('加载更多新闻');
  },

  // 新闻点击事件
  onNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    const news = this.data.newsList.find(item => item.id === newsId);

    if (news) {
      // 记录用户行为
      const app = getApp();
      app.recordUserAction('view_news', {
        newsId,
        title: news.title,
        source: news.source
      });

      // 跳转到详情页
      wx.navigateTo({
        url: `/pages/detail/detail?id=${newsId}`
      });
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '每日热点新闻',
      path: '/pages/index/index'
    };
  }
});
