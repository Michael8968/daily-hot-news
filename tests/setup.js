// tests/setup.js
'use strict';

/**
 * 测试环境设置
 */

// 设置测试超时时间
jest.setTimeout(10000);

// 模拟微信小程序全局对象
global.wx = {
  // 基础API
  getSystemInfoSync: jest.fn(() => ({
    platform: 'ios',
    system: 'iOS 14.0',
    version: '8.0.0',
    model: 'iPhone 12',
    pixelRatio: 3,
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 667,
    language: 'zh_CN',
    theme: 'light'
  })),
  
  getSystemInfo: jest.fn((options) => {
    const systemInfo = {
      platform: 'ios',
      system: 'iOS 14.0',
      version: '8.0.0',
      model: 'iPhone 12',
      pixelRatio: 3,
      screenWidth: 375,
      screenHeight: 812,
      windowWidth: 375,
      windowHeight: 667,
      language: 'zh_CN',
      theme: 'light'
    };
    
    if (options && options.success) {
      options.success(systemInfo);
    }
  }),
  
  // 网络相关
  getNetworkType: jest.fn((options) => {
    if (options && options.success) {
      options.success({ networkType: 'wifi' });
    }
  }),
  
  // 存储相关
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(() => null),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  
  setStorage: jest.fn((options) => {
    if (options && options.success) {
      options.success();
    }
  }),
  
  getStorage: jest.fn((options) => {
    if (options && options.success) {
      options.success({ data: null });
    }
  }),
  
  // 界面相关
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn((options) => {
    if (options && options.success) {
      options.success({ confirm: true, cancel: false });
    }
  }),
  showActionSheet: jest.fn((options) => {
    if (options && options.success) {
      options.success({ tapIndex: 0 });
    }
  }),
  
  // 导航相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  navigateBack: jest.fn(),
  switchTab: jest.fn(),
  reLaunch: jest.fn(),
  
  // 用户相关
  login: jest.fn((options) => {
    if (options && options.success) {
      options.success({ code: 'test_code' });
    }
  }),
  
  getUserProfile: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        userInfo: {
          nickName: '测试用户',
          avatarUrl: 'https://example.com/avatar.jpg',
          gender: 1,
          city: '北京',
          province: '北京',
          country: '中国',
          language: 'zh_CN'
        }
      });
    }
  }),
  
  getUserInfo: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        userInfo: {
          nickName: '测试用户',
          avatarUrl: 'https://example.com/avatar.jpg',
          gender: 1,
          city: '北京',
          province: '北京',
          country: '中国',
          language: 'zh_CN'
        }
      });
    }
  }),
  
  // 剪贴板相关
  setClipboardData: jest.fn((options) => {
    if (options && options.success) {
      options.success();
    }
  }),
  
  getClipboardData: jest.fn((options) => {
    if (options && options.success) {
      options.success({ data: 'test_data' });
    }
  }),
  
  // 媒体相关
  chooseImage: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        tempFilePaths: ['https://example.com/image.jpg']
      });
    }
  }),
  
  chooseVideo: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        tempFilePath: 'https://example.com/video.mp4',
        duration: 60,
        size: 1024000,
        height: 720,
        width: 1280
      });
    }
  }),
  
  previewImage: jest.fn(),
  saveImageToPhotosAlbum: jest.fn((options) => {
    if (options && options.success) {
      options.success();
    }
  }),
  
  // 位置相关
  getLocation: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 65,
        altitude: 0,
        speed: 0,
        course: 0
      });
    }
  }),
  
  chooseLocation: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        name: '测试地点',
        address: '测试地址',
        latitude: 39.9042,
        longitude: 116.4074
      });
    }
  }),
  
  // 扫码相关
  scanCode: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        result: 'test_result',
        scanType: 'QR_CODE',
        charSet: 'utf8',
        path: 'test_path'
      });
    }
  }),
  
  // 震动相关
  vibrateShort: jest.fn(),
  vibrateLong: jest.fn(),
  
  // 分享相关
  showShareMenu: jest.fn(),
  hideShareMenu: jest.fn(),
  updateShareMenu: jest.fn(),
  
  // 推送相关
  requestSubscribeMessage: jest.fn((options) => {
    if (options && options.success) {
      options.success({
        'test_template_id': 'accept'
      });
    }
  }),
  
  // 云开发相关
  cloud: {
    init: jest.fn(),
    callFunction: jest.fn((options) => {
      if (options && options.success) {
        options.success({
          result: { success: true, data: 'test_data' }
        });
      }
    }),
    database: jest.fn(() => ({
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ data: [] })),
          add: jest.fn(() => Promise.resolve({ _id: 'test_id' })),
          update: jest.fn(() => Promise.resolve({ stats: { updated: 1 } })),
          remove: jest.fn(() => Promise.resolve({ stats: { removed: 1 } }))
        })),
        orderBy: jest.fn(() => ({
          skip: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn(() => Promise.resolve({ data: [] }))
            }))
          }))
        }))
      }))
    })),
    uploadFile: jest.fn((options) => {
      if (options && options.success) {
        options.success({
          fileID: 'test_file_id'
        });
      }
    }),
    downloadFile: jest.fn((options) => {
      if (options && options.success) {
        options.success({
          tempFilePath: 'test_temp_path'
        });
      }
    }),
    deleteFile: jest.fn((options) => {
      if (options && options.success) {
        options.success();
      }
    }),
    getTempFileURL: jest.fn((options) => {
      if (options && options.success) {
        options.success({
          fileList: [{
            fileID: 'test_file_id',
            tempFileURL: 'https://example.com/temp_url'
          }]
        });
      }
    })
  },
  
  // 内容安全相关
  checkContentSafety: jest.fn((options) => {
    if (options && options.success) {
      options.success({ result: true });
    }
  }),
  
  // 分析相关
  reportAnalytics: jest.fn(),
  
  // 其他
  getWXContext: jest.fn(() => ({
    OPENID: 'test_openid',
    APPID: 'test_appid',
    UNIONID: 'test_unionid'
  }))
};

// 模拟小程序页面和组件
global.Page = jest.fn();
global.Component = jest.fn();
global.App = jest.fn();
global.getApp = jest.fn(() => ({
  globalData: {
    userInfo: null,
    openid: null,
    envId: 'test-env',
    isDarkMode: false
  }
}));

// 模拟小程序路由
global.getCurrentPages = jest.fn(() => []);

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 清理模拟函数
beforeEach(() => {
  jest.clearAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 导出测试工具
module.exports = {
  // 可以在这里添加测试工具函数
};
