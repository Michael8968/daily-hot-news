// utils/api.js
'use strict';

/**
 * HTTP请求工具类
 * 封装wx.request，提供统一的API调用接口
 */

class ApiClient {
  constructor() {
    this.baseURL = 'https://api.example.com'; // 替换为实际的API地址
    this.timeout = 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * 发送HTTP请求
   * @param {Object} options 请求配置
   * @returns {Promise} 请求结果
   */
  request(options) {
    return new Promise((resolve, reject) => {
      const {
        url,
        method = 'GET',
        data = {},
        headers = {},
        timeout = this.timeout
      } = options;

      // 构建完整URL
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      // 合并请求头
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers
      };

      // 发送请求
      wx.request({
        url: fullUrl,
        method: method.toUpperCase(),
        data: data,
        header: requestHeaders,
        timeout: timeout,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * GET请求
   * @param {string} url 请求URL
   * @param {Object} params 查询参数
   * @param {Object} options 其他选项
   * @returns {Promise} 请求结果
   */
  get(url, params = {}, options = {}) {
    // 构建查询字符串
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request({
      url: fullUrl,
      method: 'GET',
      ...options
    });
  }

  /**
   * POST请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   * @returns {Promise} 请求结果
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }

  /**
   * PUT请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   * @returns {Promise} 请求结果
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }

  /**
   * DELETE请求
   * @param {string} url 请求URL
   * @param {Object} options 其他选项
   * @returns {Promise} 请求结果
   */
  delete(url, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...options
    });
  }
}

// 创建API客户端实例
const apiClient = new ApiClient();

/**
 * 新闻相关API
 */
export const newsApi = {
  /**
   * 获取新闻列表
   * @param {Object} params 查询参数
   * @returns {Promise} 新闻列表
   */
  getNewsList(params = {}) {
    return apiClient.get('/news', params);
  },

  /**
   * 获取新闻详情
   * @param {string} id 新闻ID
   * @returns {Promise} 新闻详情
   */
  getNewsDetail(id) {
    return apiClient.get(`/news/${id}`);
  },

  /**
   * 搜索新闻
   * @param {string} keyword 搜索关键词
   * @param {Object} params 其他参数
   * @returns {Promise} 搜索结果
   */
  searchNews(keyword, params = {}) {
    return apiClient.get('/news/search', {
      q: keyword,
      ...params
    });
  }
};

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  getUserInfo() {
    return apiClient.get('/user/info');
  },

  /**
   * 更新用户信息
   * @param {Object} userInfo 用户信息
   * @returns {Promise} 更新结果
   */
  updateUserInfo(userInfo) {
    return apiClient.put('/user/info', userInfo);
  },

  /**
   * 获取用户统计
   * @returns {Promise} 用户统计
   */
  getUserStats() {
    return apiClient.get('/user/stats');
  }
};

/**
 * 评论相关API
 */
export const commentApi = {
  /**
   * 获取评论列表
   * @param {string} newsId 新闻ID
   * @param {Object} params 查询参数
   * @returns {Promise} 评论列表
   */
  getComments(newsId, params = {}) {
    return apiClient.get(`/comments/${newsId}`, params);
  },

  /**
   * 添加评论
   * @param {Object} comment 评论数据
   * @returns {Promise} 添加结果
   */
  addComment(comment) {
    return apiClient.post('/comments', comment);
  },

  /**
   * 删除评论
   * @param {string} commentId 评论ID
   * @returns {Promise} 删除结果
   */
  deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}`);
  }
};

/**
 * 推荐相关API
 */
export const recommendApi = {
  /**
   * 获取推荐新闻
   * @param {Object} preferences 用户偏好
   * @returns {Promise} 推荐新闻
   */
  getRecommendations(preferences = {}) {
    return apiClient.post('/recommend', preferences);
  },

  /**
   * 获取热搜榜
   * @param {Object} params 查询参数
   * @returns {Promise} 热搜榜
   */
  getHotSearch(params = {}) {
    return apiClient.get('/hot-search', params);
  }
};

/**
 * 工具函数
 */

/**
 * 处理API错误
 * @param {Error} error 错误对象
 * @param {string} defaultMessage 默认错误消息
 */
export function handleApiError(error, defaultMessage = '请求失败') {
  console.error('API错误:', error);
  
  let message = defaultMessage;
  
  if (error.message) {
    message = error.message;
  } else if (error.errMsg) {
    message = error.errMsg;
  }
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 检查网络状态
 * @returns {Promise<boolean>} 是否有网络连接
 */
export function checkNetworkStatus() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none');
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 重试请求
 * @param {Function} requestFn 请求函数
 * @param {number} maxRetries 最大重试次数
 * @param {number} delay 重试延迟（毫秒）
 * @returns {Promise} 请求结果
 */
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        console.log(`请求失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }
  }
  
  throw lastError;
}

/**
 * 缓存请求结果
 * @param {string} key 缓存键
 * @param {Function} requestFn 请求函数
 * @param {number} ttl 缓存时间（毫秒）
 * @returns {Promise} 请求结果
 */
export async function cachedRequest(key, requestFn, ttl = 5 * 60 * 1000) {
  try {
    // 尝试从缓存获取
    const cached = wx.getStorageSync(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
  } catch (error) {
    console.error('读取缓存失败:', error);
  }
  
  try {
    // 执行请求
    const result = await requestFn();
    
    // 缓存结果
    wx.setStorageSync(key, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    // 如果请求失败，尝试返回缓存数据
    try {
      const cached = wx.getStorageSync(key);
      if (cached) {
        console.log('使用缓存数据');
        return cached.data;
      }
    } catch (cacheError) {
      console.error('读取缓存失败:', cacheError);
    }
    
    throw error;
  }
}

// 默认导出API客户端
export default apiClient;
