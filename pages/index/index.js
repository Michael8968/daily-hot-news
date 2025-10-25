// pages/index/index.js
'use strict';

const app = getApp();
const { formatDate, debounce } = require('../../utils/util');
const { fetchNews } = require('../../utils/api');

Page({
  data: {
    // 轮播图数据
    bannerList: [],
    // 新闻列表
    newsList: [],
    // 加载状态
    loading: false,
    refreshing: false,
    hasMore: true,
    // 分页参数
    page: 1,
    pageSize: 10,
    // 当前分类
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'domestic', name: '国内' },
      { id: 'international', name: '国际' },
      { id: 'technology', name: '科技' },
      { id: 'economy', name: '经济' }
    ],
    // 搜索关键词
    searchKeyword: '',
    // 是否显示搜索框
    showSearch: false
  },

  onLoad(options) {
    console.log('首页加载', options);
    this.initPage();
  },

  onShow() {
    console.log('首页显示');
    // 检查是否需要刷新数据
    this.checkDataFreshness();
  },

  onReady() {
    console.log('首页准备就绪');
  },

  onHide() {
    console.log('首页隐藏');
  },

  onUnload() {
    console.log('首页卸载');
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData();
  },

  onReachBottom() {
    console.log('上拉加载更多');
    this.loadMoreData();
  },

  onShareAppMessage() {
    return {
      title: '每日热点新闻 - 了解最新资讯',
      path: '/pages/index/index',
      imageUrl: '/images/share-banner.jpg'
    };
  },

  // 初始化页面
  async initPage() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 加载轮播图数据
      await this.loadBannerData();
      
      // 加载新闻数据
      await this.loadNewsData();
      
      // 记录用户行为
      app.recordUserAction('view_homepage');
      
    } catch (error) {
      console.error('初始化页面失败:', error);
      this.showError('加载失败，请重试');
    } finally {
      wx.hideLoading();
    }
  },

  // 加载轮播图数据
  async loadBannerData() {
    try {
      // 从缓存获取轮播图数据
      const cachedBanner = wx.getStorageSync('bannerList');
      if (cachedBanner && this.isDataFresh(cachedBanner.timestamp)) {
        this.setData({ bannerList: cachedBanner.data });
        return;
      }

      // 调用云函数获取轮播图数据
      const result = await wx.cloud.callFunction({
        name: 'fetchBanner',
        data: { limit: 5 }
      });

      if (result.result && result.result.success) {
        const bannerData = result.result.data;
        this.setData({ bannerList: bannerData });
        
        // 缓存数据
        wx.setStorageSync('bannerList', {
          data: bannerData,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('加载轮播图失败:', error);
      // 使用默认轮播图
      this.setData({
        bannerList: [
          {
            id: 1,
            title: '每日热点新闻',
            image: '/images/banner1.jpg',
            url: '/pages/index/index'
          }
        ]
      });
    }
  },

  // 加载新闻数据
  async loadNewsData(isRefresh = false) {
    if (this.data.loading) return;

    try {
      this.setData({ loading: true });

      const params = {
        category: this.data.currentCategory,
        page: isRefresh ? 1 : this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword
      };

      // 调用云函数获取新闻数据
      const result = await wx.cloud.callFunction({
        name: 'fetchNews',
        data: params
      });

      if (result.result && result.result.success) {
        const newsData = result.result.data;
        
        if (isRefresh) {
          this.setData({
            newsList: newsData.list,
            page: 1,
            hasMore: newsData.hasMore
          });
        } else {
          this.setData({
            newsList: [...this.data.newsList, ...newsData.list],
            page: this.data.page + 1,
            hasMore: newsData.hasMore
          });
        }

        // 缓存数据
        wx.setStorageSync('newsList', {
          data: this.data.newsList,
          timestamp: Date.now(),
          category: this.data.currentCategory
        });

        // 记录用户行为
        app.recordUserAction('load_news', {
          category: this.data.currentCategory,
          count: newsData.list.length
        });
      } else {
        throw new Error(result.result?.message || '获取新闻失败');
      }
    } catch (error) {
      console.error('加载新闻失败:', error);
      
      // 尝试使用缓存数据
      const cachedNews = wx.getStorageSync('newsList');
      if (cachedNews && this.isDataFresh(cachedNews.timestamp)) {
        this.setData({ newsList: cachedNews.data });
      } else {
        this.showError('加载失败，请检查网络连接');
      }
    } finally {
      this.setData({ loading: false, refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  // 刷新数据
  async refreshData() {
    this.setData({ refreshing: true });
    await this.loadNewsData(true);
  },

  // 加载更多数据
  async loadMoreData() {
    if (!this.data.hasMore || this.data.loading) return;
    await this.loadNewsData();
  },

  // 检查数据新鲜度
  checkDataFreshness() {
    const cachedNews = wx.getStorageSync('newsList');
    if (cachedNews && this.isDataFresh(cachedNews.timestamp)) {
      // 数据仍然新鲜，无需刷新
      return;
    }
    
    // 数据过期，刷新
    this.refreshData();
  },

  // 判断数据是否新鲜（5分钟内）
  isDataFresh(timestamp) {
    return Date.now() - timestamp < 5 * 60 * 1000;
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    if (category === this.data.currentCategory) return;

    this.setData({
      currentCategory: category,
      newsList: [],
      page: 1,
      hasMore: true
    });

    this.loadNewsData(true);
    
    // 记录用户行为
    app.recordUserAction('switch_category', { category });
  },

  // 搜索新闻
  onSearchInput: debounce(function(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    
    if (keyword) {
      this.setData({
        newsList: [],
        page: 1,
        hasMore: true
      });
      this.loadNewsData(true);
    }
  }, 500),

  // 切换搜索框显示
  toggleSearch() {
    this.setData({ showSearch: !this.data.showSearch });
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      showSearch: false,
      newsList: [],
      page: 1,
      hasMore: true
    });
    this.loadNewsData(true);
  },

  // 点击轮播图
  onBannerTap(e) {
    const index = e.detail.current;
    const banner = this.data.bannerList[index];
    
    if (banner && banner.url) {
      if (banner.url.startsWith('/pages/')) {
        wx.navigateTo({ url: banner.url });
      } else {
        // 外部链接，复制到剪贴板
        wx.setClipboardData({
          data: banner.url,
          success: () => {
            wx.showToast({ title: '链接已复制', icon: 'success' });
          }
        });
      }
    }
  },

  // 点击新闻卡片
  onNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    const news = this.data.newsList.find(item => item.id === newsId);
    
    if (news) {
      // 记录浏览历史
      this.recordViewHistory(news);
      
      // 跳转到详情页
      wx.navigateTo({
        url: `/pages/detail/detail?id=${newsId}`
      });
    }
  },

  // 记录浏览历史
  recordViewHistory(news) {
    const viewedNews = wx.getStorageSync('viewedNews') || [];
    const existingIndex = viewedNews.findIndex(item => item.id === news.id);
    
    if (existingIndex >= 0) {
      viewedNews.splice(existingIndex, 1);
    }
    
    viewedNews.unshift({
      id: news.id,
      title: news.title,
      image: news.image,
      category: news.category,
      timestamp: Date.now()
    });
    
    // 只保留最近50条记录
    if (viewedNews.length > 50) {
      viewedNews.splice(50);
    }
    
    wx.setStorageSync('viewedNews', viewedNews);
    
    // 记录用户行为
    app.recordUserAction('view_news', {
      newsId: news.id,
      category: news.category
    });
  },

  // 显示错误信息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 更新主题
  updateTheme() {
    // 更新页面主题样式
    const isDarkMode = app.globalData.isDarkMode;
    this.setData({ isDarkMode });
  }
});
