// 云函数：更新环境变量配置
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { envType, config } = event;

    if (!envType || !config) {
      return {
        success: false,
        error: '缺少必要参数'
      };
    }

    // 解析配置
    const env = {};
    const lines = config.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;

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

    // 保存到数据库
    const docId = envType === 'development' ? 'development' : 'production';

    await db.collection('env_config').doc(docId).set({
      data: {
        ...env,
        updatedAt: new Date(),
        envType
      }
    });

    return {
      success: true,
      data: {
        envType,
        configCount: Object.keys(env).length,
        updatedAt: new Date()
      }
    };
  } catch (error) {
    console.error('更新环境配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
