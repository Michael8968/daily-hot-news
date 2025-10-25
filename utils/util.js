// utils/util.js
'use strict';

/**
 * 通用工具函数
 */

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, format = 'relative') {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diff = now - targetDate;
  
  if (format === 'relative') {
    if (diff < 60 * 1000) {
      return '刚刚';
    } else if (diff < 60 * 60 * 1000) {
      return Math.floor(diff / (60 * 1000)) + '分钟前';
    } else if (diff < 24 * 60 * 60 * 1000) {
      return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
    } else {
      return targetDate.toLocaleDateString('zh-CN');
    }
  } else if (format === 'date') {
    return targetDate.toLocaleDateString('zh-CN');
  } else if (format === 'datetime') {
    return targetDate.toLocaleString('zh-CN');
  } else if (format === 'time') {
    return targetDate.toLocaleTimeString('zh-CN');
  }
  
  return targetDate.toLocaleString('zh-CN');
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * 生成唯一ID
 * @param {string} prefix 前缀
 * @returns {string} 唯一ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
export function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 截取字符串
 * @param {string} str 原字符串
 * @param {number} length 最大长度
 * @param {string} suffix 后缀
 * @returns {string} 截取后的字符串
 */
export function truncateString(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) {
    return str;
  }
  return str.substring(0, length) + suffix;
}

/**
 * 获取URL参数
 * @param {string} url URL字符串
 * @returns {Object} 参数对象
 */
export function getUrlParams(url) {
  const params = {};
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * 构建URL
 * @param {string} base 基础URL
 * @param {Object} params 参数对象
 * @returns {string} 完整URL
 */
export function buildUrl(base, params = {}) {
  const url = new URL(base);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.set(key, params[key]);
    }
  });
  return url.toString();
}

/**
 * 数组去重
 * @param {Array} arr 原数组
 * @param {string} key 去重键名
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr, key) {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数组分组
 * @param {Array} arr 原数组
 * @param {string|Function} key 分组键名或函数
 * @returns {Object} 分组后的对象
 */
export function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * 数组排序
 * @param {Array} arr 原数组
 * @param {string} key 排序键名
 * @param {string} order 排序方向
 * @returns {Array} 排序后的数组
 */
export function sortArray(arr, key, order = 'asc') {
  return arr.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });
}

/**
 * 随机打乱数组
 * @param {Array} arr 原数组
 * @returns {Array} 打乱后的数组
 */
export function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * 获取随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机数
 */
export function getRandomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取随机字符串
 * @param {number} length 长度
 * @returns {string} 随机字符串
 */
export function getRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export function isMobile() {
  const systemInfo = wx.getSystemInfoSync();
  return systemInfo.platform === 'ios' || systemInfo.platform === 'android';
}

/**
 * 获取设备信息
 * @returns {Object} 设备信息
 */
export function getDeviceInfo() {
  const systemInfo = wx.getSystemInfoSync();
  return {
    platform: systemInfo.platform,
    system: systemInfo.system,
    version: systemInfo.version,
    model: systemInfo.model,
    pixelRatio: systemInfo.pixelRatio,
    screenWidth: systemInfo.screenWidth,
    screenHeight: systemInfo.screenHeight,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    language: systemInfo.language,
    isMobile: isMobile()
  };
}

/**
 * 检查网络状态
 * @returns {Promise<Object>} 网络状态
 */
export function getNetworkStatus() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        resolve({
          networkType: res.networkType,
          isConnected: res.networkType !== 'none'
        });
      },
      fail: reject
    });
  });
}

/**
 * 显示加载提示
 * @param {string} title 提示文字
 */
export function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 * @param {string} title 提示文字
 * @param {number} duration 显示时长
 */
export function showSuccess(title = '操作成功', duration = 2000) {
  wx.showToast({
    title,
    icon: 'success',
    duration
  });
}

/**
 * 显示错误提示
 * @param {string} title 提示文字
 * @param {number} duration 显示时长
 */
export function showError(title = '操作失败', duration = 2000) {
  wx.showToast({
    title,
    icon: 'none',
    duration
  });
}

/**
 * 显示确认对话框
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns {Promise<boolean>} 用户选择结果
 */
export function showConfirm(title = '提示', content = '确定要执行此操作吗？') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export function copyToClipboard(text) {
  return new Promise((resolve) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        showSuccess('已复制到剪贴板');
        resolve(true);
      },
      fail: () => {
        showError('复制失败');
        resolve(false);
      }
    });
  });
}

/**
 * 保存图片到相册
 * @param {string} filePath 图片路径
 * @returns {Promise<boolean>} 是否成功
 */
export function saveImageToPhotosAlbum(filePath) {
  return new Promise((resolve) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        showSuccess('已保存到相册');
        resolve(true);
      },
      fail: () => {
        showError('保存失败');
        resolve(false);
      }
    });
  });
}

/**
 * 预览图片
 * @param {Array} urls 图片URL数组
 * @param {string} current 当前图片URL
 */
export function previewImage(urls, current) {
  wx.previewImage({
    urls,
    current: current || urls[0]
  });
}

/**
 * 页面跳转
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
export function navigateTo(url, params = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  wx.navigateTo({
    url: fullUrl
  });
}

/**
 * 页面重定向
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
export function redirectTo(url, params = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  wx.redirectTo({
    url: fullUrl
  });
}

/**
 * 返回上一页
 * @param {number} delta 返回层数
 */
export function navigateBack(delta = 1) {
  wx.navigateBack({
    delta
  });
}

/**
 * 切换Tab页面
 * @param {string} url Tab页面路径
 */
export function switchTab(url) {
  wx.switchTab({
    url
  });
}

/**
 * 重新加载页面
 * @param {string} url 页面路径
 */
export function reLaunch(url) {
  wx.reLaunch({
    url
  });
}
