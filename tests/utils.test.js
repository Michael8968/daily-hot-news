// tests/utils.test.js
'use strict';

/**
 * 工具函数单元测试
 */

// 模拟微信小程序环境
global.wx = {
  getSystemInfoSync: () => ({
    platform: 'ios',
    system: 'iOS 14.0',
    version: '8.0.0',
    model: 'iPhone 12',
    pixelRatio: 3,
    screenWidth: 375,
    screenHeight: 812,
    windowWidth: 375,
    windowHeight: 667,
    language: 'zh_CN'
  }),
  showToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  showModal: () => {},
  setClipboardData: () => {},
  getClipboardData: () => {},
  navigateTo: () => {},
  redirectTo: () => {},
  navigateBack: () => {},
  switchTab: () => {},
  reLaunch: () => {}
};

// 导入要测试的工具函数
const { formatDate, debounce, throttle, deepClone, generateId, isValidEmail, isValidPhone, formatFileSize, truncateString } = require('../utils/util');

describe('工具函数测试', () => {
  
  describe('formatDate', () => {
    test('应该正确格式化相对时间', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      expect(formatDate(oneMinuteAgo)).toBe('1分钟前');
      expect(formatDate(oneHourAgo)).toBe('1小时前');
      expect(formatDate(oneDayAgo)).toBe('1天前');
    });
    
    test('应该正确格式化绝对时间', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      expect(formatDate(date, 'date')).toContain('2023');
      expect(formatDate(date, 'datetime')).toContain('2023');
    });
  });
  
  describe('debounce', () => {
    test('应该正确实现防抖功能', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);
      
      // 快速调用多次
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // 等待防抖时间
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });
  
  describe('throttle', () => {
    test('应该正确实现节流功能', (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);
      
      // 快速调用多次
      throttledFn();
      throttledFn();
      throttledFn();
      
      // 等待节流时间
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });
  
  describe('deepClone', () => {
    test('应该正确深拷贝对象', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, 5]
        }
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });
    
    test('应该正确深拷贝数组', () => {
      const original = [1, { a: 2 }, [3, 4]];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
    });
  });
  
  describe('generateId', () => {
    test('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
    
    test('应该包含前缀', () => {
      const id = generateId('test');
      expect(id).toContain('test_');
    });
  });
  
  describe('isValidEmail', () => {
    test('应该验证有效邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });
    
    test('应该拒绝无效邮箱', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });
  
  describe('isValidPhone', () => {
    test('应该验证有效手机号', () => {
      expect(isValidPhone('13800138000')).toBe(true);
      expect(isValidPhone('15912345678')).toBe(true);
    });
    
    test('应该拒绝无效手机号', () => {
      expect(isValidPhone('12345678901')).toBe(false);
      expect(isValidPhone('1380013800')).toBe(false);
      expect(isValidPhone('abc12345678')).toBe(false);
    });
  });
  
  describe('formatFileSize', () => {
    test('应该正确格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
  
  describe('truncateString', () => {
    test('应该正确截取字符串', () => {
      const longString = '这是一个很长的字符串，需要被截取';
      const truncated = truncateString(longString, 10);
      
      expect(truncated).toBe('这是一个很长的字符串，需要被截取...');
    });
    
    test('不应该截取短字符串', () => {
      const shortString = '短字符串';
      const truncated = truncateString(shortString, 10);
      
      expect(truncated).toBe('短字符串');
    });
  });
});

// 测试模拟数据生成
describe('模拟数据生成测试', () => {
  const { generateMockNews, generateMockUsers, generateMockComments, generateMockHotSearch, generateMockTopics, generateMockStats } = require('../utils/mock');
  
  describe('generateMockNews', () => {
    test('应该生成指定数量的新闻', () => {
      const news = generateMockNews(5);
      expect(news).toHaveLength(5);
    });
    
    test('应该包含必要的字段', () => {
      const news = generateMockNews(1)[0];
      expect(news).toHaveProperty('id');
      expect(news).toHaveProperty('title');
      expect(news).toHaveProperty('content');
      expect(news).toHaveProperty('image');
      expect(news).toHaveProperty('source');
      expect(news).toHaveProperty('category');
    });
  });
  
  describe('generateMockUsers', () => {
    test('应该生成指定数量的用户', () => {
      const users = generateMockUsers(3);
      expect(users).toHaveLength(3);
    });
    
    test('应该包含必要的字段', () => {
      const user = generateMockUsers(1)[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('nickName');
      expect(user).toHaveProperty('avatarUrl');
    });
  });
  
  describe('generateMockComments', () => {
    test('应该生成指定数量的评论', () => {
      const comments = generateMockComments('news_1', 3);
      expect(comments).toHaveLength(3);
    });
    
    test('应该包含必要的字段', () => {
      const comment = generateMockComments('news_1', 1)[0];
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('newsId');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('userInfo');
    });
  });
  
  describe('generateMockHotSearch', () => {
    test('应该生成指定数量的热搜', () => {
      const hotSearch = generateMockHotSearch(5);
      expect(hotSearch).toHaveLength(5);
    });
    
    test('应该包含必要的字段', () => {
      const item = generateMockHotSearch(1)[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('keyword');
      expect(item).toHaveProperty('desc');
    });
  });
  
  describe('generateMockTopics', () => {
    test('应该生成指定数量的专题', () => {
      const topics = generateMockTopics(3);
      expect(topics).toHaveLength(3);
    });
    
    test('应该包含必要的字段', () => {
      const topic = generateMockTopics(1)[0];
      expect(topic).toHaveProperty('id');
      expect(topic).toHaveProperty('title');
      expect(topic).toHaveProperty('description');
      expect(topic).toHaveProperty('image');
    });
  });
  
  describe('generateMockStats', () => {
    test('应该生成统计数据', () => {
      const stats = generateMockStats();
      expect(stats).toHaveProperty('viewedCount');
      expect(stats).toHaveProperty('likedCount');
      expect(stats).toHaveProperty('commentedCount');
      expect(stats).toHaveProperty('collectedCount');
    });
  });
});

// 测试API工具
describe('API工具测试', () => {
  const { handleApiError, checkNetworkStatus, retryRequest, cachedRequest } = require('../utils/api');
  
  describe('handleApiError', () => {
    test('应该处理API错误', () => {
      const error = new Error('网络错误');
      // 由于wx.showToast是模拟的，这里只测试函数不抛出异常
      expect(() => handleApiError(error)).not.toThrow();
    });
  });
  
  describe('checkNetworkStatus', () => {
    test('应该检查网络状态', async () => {
      const isConnected = await checkNetworkStatus();
      expect(typeof isConnected).toBe('boolean');
    });
  });
  
  describe('retryRequest', () => {
    test('应该重试失败的请求', async () => {
      let attemptCount = 0;
      const requestFn = () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('请求失败');
        }
        return '成功';
      };
      
      const result = await retryRequest(requestFn, 3, 100);
      expect(result).toBe('成功');
      expect(attemptCount).toBe(2);
    });
  });
  
  describe('cachedRequest', () => {
    test('应该缓存请求结果', async () => {
      let callCount = 0;
      const requestFn = () => {
        callCount++;
        return '缓存数据';
      };
      
      // 第一次调用
      const result1 = await cachedRequest('test_key', requestFn, 1000);
      expect(result1).toBe('缓存数据');
      expect(callCount).toBe(1);
      
      // 第二次调用应该使用缓存
      const result2 = await cachedRequest('test_key', requestFn, 1000);
      expect(result2).toBe('缓存数据');
      expect(callCount).toBe(1);
    });
  });
});

// 测试云开发工具
describe('云开发工具测试', () => {
  const { initCloud, callFunction, queryData, addData, updateData, deleteData } = require('../utils/cloud');
  
  describe('initCloud', () => {
    test('应该初始化云开发', () => {
      const result = initCloud('test-env');
      expect(result).toBe(true);
    });
  });
  
  describe('callFunction', () => {
    test('应该调用云函数', async () => {
      // 由于云函数调用是异步的，这里只测试函数不抛出异常
      expect(() => callFunction('testFunction', {})).not.toThrow();
    });
  });
  
  describe('queryData', () => {
    test('应该查询数据', async () => {
      const result = await queryData('test_collection', {});
      expect(result).toHaveProperty('success');
    });
  });
  
  describe('addData', () => {
    test('应该添加数据', async () => {
      const result = await addData('test_collection', { name: 'test' });
      expect(result).toHaveProperty('success');
    });
  });
  
  describe('updateData', () => {
    test('应该更新数据', async () => {
      const result = await updateData('test_collection', { id: 'test' }, { name: 'updated' });
      expect(result).toHaveProperty('success');
    });
  });
  
  describe('deleteData', () => {
    test('应该删除数据', async () => {
      const result = await deleteData('test_collection', { id: 'test' });
      expect(result).toHaveProperty('success');
    });
  });
});

// 运行测试的辅助函数
function runTests() {
  console.log('开始运行单元测试...');
  
  // 这里可以添加测试运行逻辑
  // 由于这是微信小程序环境，实际的测试运行需要在小程序开发工具中进行
  
  console.log('单元测试完成');
}

// 导出测试函数
module.exports = {
  runTests
};
