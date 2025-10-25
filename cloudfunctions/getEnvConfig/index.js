// 云函数：获取环境变量配置
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 获取环境信息
    const { envVersion } = cloud.getWXContext();

    // 根据环境版本选择配置
    const isDev = envVersion === 'develop';

    // 从数据库获取配置（生产环境）
    let config = null;
    if (!isDev) {
      try {
        const result = await db.collection('env_config').doc('production').get();
        if (result.data) {
          config = result.data;
        }
      } catch (error) {
        console.warn('从数据库获取配置失败:', error);
      }
    }

    // 如果没有配置，使用默认配置
    if (!config) {
      config = {
        CLOUD_ENV_ID: isDev ? 'your-env-id' : 'prod-env-id',
        NEWS_API_KEY: isDev ? 'your-news-api-key' : 'prod-news-api-key',
        DEEPSEEK_API_KEY: isDev ? 'your-deepseek-api-key' : 'prod-deepseek-api-key',
        NEWS_API_BASE_URL: 'https://newsapi.org/v2',
        DEEPSEEK_API_BASE_URL: 'https://api.deepseek.com',
        PUSH_TEMPLATE_ID: isDev ? 'your-push-template-id' : 'prod-push-template-id',
        REQUEST_TIMEOUT: '10000',
        CACHE_TTL: '3600',
        LOG_LEVEL: isDev ? 'info' : 'error',
        NODE_ENV: isDev ? 'development' : 'production',
        DEBUG: isDev ? 'true' : 'false'
      };
    }

    return {
      success: true,
      data: config,
      envVersion
    };
  } catch (error) {
    console.error('获取环境配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
