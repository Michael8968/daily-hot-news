// app.js
'use strict';

App({
  globalData: {
    userInfo: null,
    openid: null,
    envId: 'your-env-id', // 替换为实际的云开发环境ID
    newsApiKey: 'your-news-api-key', // 替换为实际的NewsAPI密钥
    deepSeekApiKey: 'your-deepseek-api-key', // 替换为实际的DeepSeek API密钥
    isDarkMode: false,
    viewedNews: [] // 用户浏览历史
  },

  onLaunch() {
    console.log('小程序启动');
    
    // 初始化云开发
    this.initCloud();
    
    // 获取用户信息
    this.getUserInfo();
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 获取系统信息
    this.getSystemInfo();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(error) {
    console.error('小程序错误:', error);
    wx.showToast({
      title: '系统错误，请重试',
      icon: 'none'
    });
  },

  // 初始化云开发
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: this.globalData.envId,
      traceUser: true
    });
  },

  // 获取用户信息
  getUserInfo() {
    // 检查是否已授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已授权，获取用户信息
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo;
              console.log('用户信息:', res.userInfo);
            },
            fail: (err) => {
              console.error('获取用户信息失败:', err);
            }
          });
        }
      }
    });

    // 获取openid
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用云函数获取openid
          wx.cloud.callFunction({
            name: 'getOpenId',
            success: (result) => {
              this.globalData.openid = result.result.openid;
              console.log('OpenID:', result.result.openid);
            },
            fail: (err) => {
              console.error('获取OpenID失败:', err);
            }
          });
        }
      }
    });
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        console.log('网络类型:', res.networkType);
        if (res.networkType === 'none') {
          wx.showToast({
            title: '网络连接异常',
            icon: 'none'
          });
        }
      }
    });
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        console.log('系统信息:', res);
        // 检查是否支持暗黑模式
        if (res.theme) {
          this.globalData.isDarkMode = res.theme === 'dark';
        }
      }
    });
  },

  // 切换暗黑模式
  toggleDarkMode() {
    this.globalData.isDarkMode = !this.globalData.isDarkMode;
    wx.setStorageSync('isDarkMode', this.globalData.isDarkMode);
    
    // 触发页面更新
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.updateTheme) {
      currentPage.updateTheme();
    }
  },

  // 记录用户行为
  recordUserAction(action, data = {}) {
    const userAction = {
      action,
      data,
      timestamp: Date.now(),
      openid: this.globalData.openid
    };
    
    // 本地存储
    const actions = wx.getStorageSync('userActions') || [];
    actions.push(userAction);
    wx.setStorageSync('userActions', actions);
    
    // 上报分析数据
    wx.reportAnalytics(action, data);
  }
});
