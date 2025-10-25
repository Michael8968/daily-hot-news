// app.js
'use strict';

const { getAllEnvConfigAsync, validateEnvConfig, initEnv } = require('./utils/env.js');

App({
  globalData: {
    userInfo: null,
    openid: null,
    isDarkMode: false,
    viewedNews: [], // 用户浏览历史
    config: null // 环境配置
  },

  onLaunch() {
    console.log('小程序启动');

    // 初始化环境配置
    this.initConfig();

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

  // 初始化环境配置
  async initConfig() {
    try {
      // 初始化环境变量
      await initEnv();

      // 获取环境配置
      this.globalData.config = await getAllEnvConfigAsync();

      // 验证配置
      const validation = validateEnvConfig();
      if (!validation.isValid) {
        console.warn('环境配置不完整，缺少:', validation.missing);

        // 在开发环境下显示警告
        if (this.globalData.config.isDev) {
          wx.showModal({
            title: '配置警告',
            content: `缺少以下配置: ${validation.missing.join(', ')}`,
            showCancel: false
          });
        }
      }

      console.log('环境配置已加载:', this.globalData.config);
    } catch (error) {
      console.error('初始化环境配置失败:', error);
      // 使用默认配置
      this.globalData.config = {
        cloudEnvId: 'your-env-id',
        newsApiKey: 'your-news-api-key',
        deepSeekApiKey: 'your-deepseek-api-key',
        isDev: true,
        isDebug: true
      };
    }
  },

  // 初始化云开发
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    const envId = this.globalData.config?.cloudEnvId || 'your-env-id';
    wx.cloud.init({
      env: envId,
      traceUser: true
    });

    console.log('云开发已初始化，环境ID:', envId);
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
  },

  // 获取配置值
  getConfig(key, defaultValue = null) {
    return this.globalData.config?.[key] || defaultValue;
  },

  // 获取API配置
  getApiConfig() {
    return {
      newsApiKey: this.getConfig('newsApiKey'),
      newsApiBaseUrl: this.getConfig('newsApiBaseUrl'),
      deepSeekApiKey: this.getConfig('deepSeekApiKey'),
      deepSeekApiBaseUrl: this.getConfig('deepSeekApiBaseUrl'),
      requestTimeout: this.getConfig('requestTimeout', 10000)
    };
  },

  // 检查是否为开发环境
  isDevelopment() {
    return this.getConfig('isDev', false);
  },

  // 检查是否启用调试
  isDebugEnabled() {
    return this.getConfig('isDebug', false);
  },

  // 获取日志级别
  getLogLevel() {
    return this.getConfig('logLevel', 'info');
  }
});
