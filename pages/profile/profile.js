// pages/profile/profile.js
'use strict';

const app = getApp();
const { formatDate } = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    isLogin: false,
    // 统计数据
    stats: {
      viewedCount: 0,
      likedCount: 0,
      commentedCount: 0,
      collectedCount: 0
    },
    // 浏览历史
    viewedNews: [],
    // 收藏列表
    collectedNews: [],
    // 设置选项
    settings: {
      isDarkMode: false,
      pushNotification: true,
      autoPlay: false,
      fontSize: 'normal'
    },
    // 加载状态
    loading: false,
    // 当前标签
    currentTab: 'history',
    tabs: [
      { id: 'history', name: '历史' },
      { id: 'collect', name: '收藏' },
      { id: 'settings', name: '设置' }
    ]
  },

  onLoad(options) {
    console.log('个人中心加载', options);
    this.initPage();
  },

  onShow() {
    console.log('个人中心显示');
    this.loadUserData();
  },

  onReady() {
    console.log('个人中心准备就绪');
  },

  onHide() {
    console.log('个人中心隐藏');
  },

  onUnload() {
    console.log('个人中心卸载');
  },

  onShareAppMessage() {
    return {
      title: '每日热点新闻 - 了解最新资讯',
      path: '/pages/index/index',
      imageUrl: '/images/share-profile.jpg'
    };
  },

  // 初始化页面
  async initPage() {
    try {
      this.setData({ loading: true });
      
      // 检查登录状态
      this.checkLoginStatus();
      
      // 加载用户数据
      await this.loadUserData();
      
      // 记录用户行为
      app.recordUserAction('view_profile');
      
    } catch (error) {
      console.error('初始化页面失败:', error);
      this.showError('加载失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo;
    const isLogin = !!userInfo;
    
    this.setData({
      userInfo,
      isLogin
    });
  },

  // 加载用户数据
  async loadUserData() {
    if (!this.data.isLogin) return;

    try {
      // 并行加载各种数据
      await Promise.all([
        this.loadUserStats(),
        this.loadViewedNews(),
        this.loadCollectedNews(),
        this.loadSettings()
      ]);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  // 加载用户统计
  async loadUserStats() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserStats',
        data: {}
      });

      if (result.result && result.result.success) {
        this.setData({ stats: result.result.data });
      }
    } catch (error) {
      console.error('加载用户统计失败:', error);
      // 使用本地数据
      this.loadLocalStats();
    }
  },

  // 加载本地统计
  loadLocalStats() {
    const viewedNews = wx.getStorageSync('viewedNews') || [];
    const likedNews = wx.getStorageSync('likedNews') || [];
    const commentedNews = wx.getStorageSync('commentedNews') || [];
    const collectedNews = wx.getStorageSync('collectedNews') || [];

    this.setData({
      stats: {
        viewedCount: viewedNews.length,
        likedCount: likedNews.length,
        commentedCount: commentedNews.length,
        collectedCount: collectedNews.length
      }
    });
  },

  // 加载浏览历史
  loadViewedNews() {
    const viewedNews = wx.getStorageSync('viewedNews') || [];
    this.setData({ viewedNews });
  },

  // 加载收藏列表
  loadCollectedNews() {
    const collectedNews = wx.getStorageSync('collectedNews') || [];
    this.setData({ collectedNews });
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('userSettings') || this.data.settings;
    this.setData({ settings });
  },

  // 用户登录
  async login() {
    try {
      wx.showLoading({ title: '登录中...' });

      // 获取用户信息
      const userInfo = await this.getUserInfo();
      
      if (userInfo) {
        // 保存用户信息
        app.globalData.userInfo = userInfo;
        this.setData({
          userInfo,
          isLogin: true
        });

        // 上传用户信息到云端
        await this.uploadUserInfo(userInfo);

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 重新加载数据
        this.loadUserData();
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 上传用户信息
  async uploadUserInfo(userInfo) {
    try {
      await wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: { userInfo }
      });
    } catch (error) {
      console.error('上传用户信息失败:', error);
    }
  },

  // 用户退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          app.globalData.userInfo = null;
          this.setData({
            userInfo: null,
            isLogin: false,
            stats: {
              viewedCount: 0,
              likedCount: 0,
              commentedCount: 0,
              collectedCount: 0
            },
            viewedNews: [],
            collectedNews: []
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 切换标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData({ currentTab: tab });
    
    // 记录用户行为
    app.recordUserAction('switch_profile_tab', { tab });
  },

  // 点击历史新闻
  onHistoryNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${newsId}`
    });
  },

  // 点击收藏新闻
  onCollectedNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${newsId}`
    });
  },

  // 清除浏览历史
  clearHistory() {
    wx.showModal({
      title: '清除历史',
      content: '确定要清除所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('viewedNews');
          this.setData({ viewedNews: [] });
          this.loadLocalStats();
          
          wx.showToast({
            title: '已清除历史',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清除收藏
  clearCollections() {
    wx.showModal({
      title: '清除收藏',
      content: '确定要清除所有收藏吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('collectedNews');
          this.setData({ collectedNews: [] });
          this.loadLocalStats();
          
          wx.showToast({
            title: '已清除收藏',
            icon: 'success'
          });
        }
      }
    });
  },

  // 切换暗黑模式
  toggleDarkMode() {
    const isDarkMode = !this.data.settings.isDarkMode;
    this.setData({
      'settings.isDarkMode': isDarkMode
    });
    
    // 保存设置
    wx.setStorageSync('userSettings', this.data.settings);
    
    // 更新全局状态
    app.globalData.isDarkMode = isDarkMode;
    app.toggleDarkMode();
    
    // 记录用户行为
    app.recordUserAction('toggle_dark_mode', { isDarkMode });
  },

  // 切换推送通知
  togglePushNotification() {
    const pushNotification = !this.data.settings.pushNotification;
    this.setData({
      'settings.pushNotification': pushNotification
    });
    
    // 保存设置
    wx.setStorageSync('userSettings', this.data.settings);
    
    // 请求推送权限
    if (pushNotification) {
      this.requestPushPermission();
    }
    
    // 记录用户行为
    app.recordUserAction('toggle_push_notification', { pushNotification });
  },

  // 请求推送权限
  requestPushPermission() {
    wx.requestSubscribeMessage({
      tmplIds: ['your-template-id'], // 替换为实际的模板ID
      success: (res) => {
        console.log('推送权限请求结果:', res);
      },
      fail: (err) => {
        console.error('推送权限请求失败:', err);
        wx.showToast({
          title: '推送权限获取失败',
          icon: 'none'
        });
      }
    });
  },

  // 切换自动播放
  toggleAutoPlay() {
    const autoPlay = !this.data.settings.autoPlay;
    this.setData({
      'settings.autoPlay': autoPlay
    });
    
    // 保存设置
    wx.setStorageSync('userSettings', this.data.settings);
    
    // 记录用户行为
    app.recordUserAction('toggle_auto_play', { autoPlay });
  },

  // 切换字体大小
  onFontSizeChange(e) {
    const fontSize = e.detail.value;
    this.setData({
      'settings.fontSize': fontSize
    });
    
    // 保存设置
    wx.setStorageSync('userSettings', this.data.settings);
    
    // 记录用户行为
    app.recordUserAction('change_font_size', { fontSize });
  },

  // 关于我们
  aboutUs() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  // 意见反馈
  feedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 隐私政策
  privacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },

  // 用户协议
  userAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
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
    const isDarkMode = app.globalData.isDarkMode;
    this.setData({
      'settings.isDarkMode': isDarkMode
    });
  }
});
