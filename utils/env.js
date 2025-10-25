// 环境变量工具
'use strict';

// 缓存环境变量配置
let envCache = null;

/**
 * 解析 .env 文件内容
 * @param {string} content - .env 文件内容
 * @returns {Object} 解析后的环境变量对象
 */
function parseEnvContent(content) {
  const env = {};
  const lines = content.split('\n');

  lines.forEach(line => {
    // 去除首尾空白
    line = line.trim();

    // 跳过空行和注释
    if (!line || line.startsWith('#')) {
      return;
    }

    // 解析键值对
    const equalIndex = line.indexOf('=');
    if (equalIndex > 0) {
      const key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();

      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

/**
 * 从本地存储加载环境变量
 * @returns {Object} 环境变量对象
 */
function loadEnvFromStorage() {
  try {
    const envData = wx.getStorageSync('env_config');
    if (envData) {
      return JSON.parse(envData);
    }
  } catch (error) {
    console.warn('从本地存储加载环境变量失败:', error);
  }
  return null;
}

/**
 * 保存环境变量到本地存储
 * @param {Object} env - 环境变量对象
 */
function saveEnvToStorage(env) {
  try {
    wx.setStorageSync('env_config', JSON.stringify(env));
  } catch (error) {
    console.warn('保存环境变量到本地存储失败:', error);
  }
}

/**
 * 从云函数获取环境变量
 * @returns {Promise<Object>} 环境变量对象
 */
async function loadEnvFromCloud() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'getEnvConfig',
      data: {}
    });

    if (result.result && result.result.success) {
      return result.result.data;
    }
  } catch (error) {
    console.warn('从云函数获取环境变量失败:', error);
  }
  return null;
}

/**
 * 初始化环境变量
 * @returns {Promise<Object>} 环境变量对象
 */
async function initEnv() {
  if (envCache) {
    return envCache;
  }

  // 1. 尝试从本地存储加载
  let env = loadEnvFromStorage();

  // 2. 如果本地没有，尝试从云函数获取
  if (!env) {
    env = await loadEnvFromCloud();
    if (env) {
      saveEnvToStorage(env);
    }
  }

  // 3. 如果都没有，使用默认配置
  if (!env) {
    env = getDefaultConfig();
    saveEnvToStorage(env);
  }

  envCache = env;
  return env;
}

/**
 * 获取默认配置
 * @returns {Object} 默认配置对象
 */
function getDefaultConfig() {
  const isDev = wx.getAccountInfoSync().miniProgram.envVersion === 'develop';

  if (isDev) {
    return {
      CLOUD_ENV_ID: 'your-env-id',
      NEWS_API_KEY: 'your-news-api-key',
      DEEPSEEK_API_KEY: 'your-deepseek-api-key',
      NEWS_API_BASE_URL: 'https://newsapi.org/v2',
      DEEPSEEK_API_BASE_URL: 'https://api.deepseek.com',
      PUSH_TEMPLATE_ID: 'your-push-template-id',
      REQUEST_TIMEOUT: '10000',
      CACHE_TTL: '3600',
      LOG_LEVEL: 'info',
      NODE_ENV: 'development',
      DEBUG: 'true'
    };
  } else {
    return {
      CLOUD_ENV_ID: 'prod-env-id',
      NEWS_API_KEY: 'prod-news-api-key',
      DEEPSEEK_API_KEY: 'prod-deepseek-api-key',
      NEWS_API_BASE_URL: 'https://newsapi.org/v2',
      DEEPSEEK_API_BASE_URL: 'https://api.deepseek.com',
      PUSH_TEMPLATE_ID: 'prod-push-template-id',
      REQUEST_TIMEOUT: '10000',
      CACHE_TTL: '3600',
      LOG_LEVEL: 'error',
      NODE_ENV: 'production',
      DEBUG: 'false'
    };
  }
}

/**
 * 获取环境变量值
 * @param {string} key - 环境变量键名
 * @param {string} defaultValue - 默认值
 * @returns {string} 环境变量值
 */
function getEnv(key, defaultValue = '') {
  if (!envCache) {
    console.warn('环境变量未初始化，请先调用 initEnv()');
    return defaultValue;
  }

  return envCache[key] || defaultValue;
}

/**
 * 获取布尔类型的环境变量
 * @param {string} key - 环境变量键名
 * @param {boolean} defaultValue - 默认值
 * @returns {boolean} 布尔值
 */
function getEnvBoolean(key, defaultValue = false) {
  const value = getEnv(key, defaultValue.toString());
  return value === 'true' || value === '1';
}

/**
 * 获取数字类型的环境变量
 * @param {string} key - 环境变量键名
 * @param {number} defaultValue - 默认值
 * @returns {number} 数字值
 */
function getEnvNumber(key, defaultValue = 0) {
  const value = getEnv(key, defaultValue.toString());
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 获取所有环境配置
 * @returns {Object} 环境配置对象
 */
function getAllEnvConfig() {
  return {
    // 云开发配置
    cloudEnvId: getEnv('CLOUD_ENV_ID'),

    // API 配置
    newsApiKey: getEnv('NEWS_API_KEY'),
    newsApiBaseUrl: getEnv('NEWS_API_BASE_URL'),
    deepSeekApiKey: getEnv('DEEPSEEK_API_KEY'),
    deepSeekApiBaseUrl: getEnv('DEEPSEEK_API_BASE_URL'),

    // 推送配置
    pushTemplateId: getEnv('PUSH_TEMPLATE_ID'),

    // 性能配置
    requestTimeout: getEnvNumber('REQUEST_TIMEOUT', 10000),
    cacheTtl: getEnvNumber('CACHE_TTL', 3600),

    // 日志配置
    logLevel: getEnv('LOG_LEVEL', 'info'),

    // 环境信息
    nodeEnv: getEnv('NODE_ENV', 'development'),
    isDebug: getEnvBoolean('DEBUG', true),
    isDev: wx.getAccountInfoSync().miniProgram.envVersion === 'develop'
  };
}

/**
 * 异步获取所有环境配置
 * @returns {Promise<Object>} 环境配置对象
 */
async function getAllEnvConfigAsync() {
  await initEnv();
  return getAllEnvConfig();
}

/**
 * 验证必需的环境变量
 * @returns {Object} 验证结果
 */
function validateEnvConfig() {
  const config = getAllEnvConfig();
  const required = ['cloudEnvId', 'newsApiKey', 'deepSeekApiKey'];
  const missing = [];

  required.forEach(key => {
    if (!config[key] || config[key].includes('your-')) {
      missing.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    config
  };
}

module.exports = {
  getEnv,
  getEnvBoolean,
  getEnvNumber,
  getAllEnvConfig,
  getAllEnvConfigAsync,
  validateEnvConfig,
  initEnv,
  parseEnvContent,
  loadEnvFromStorage,
  saveEnvToStorage,
  loadEnvFromCloud,
  getDefaultConfig
};
