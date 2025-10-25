// 环境变量上传工具
'use strict';

/**
 * 上传 .env 文件到云函数
 * @param {string} envContent - .env 文件内容
 * @param {string} envType - 环境类型 (development/production)
 * @returns {Promise<Object>} 上传结果
 */
async function uploadEnvToCloud(envContent, envType = 'development') {
  try {
    const result = await wx.cloud.callFunction({
      name: 'updateEnvConfig',
      data: {
        envType,
        config: envContent
      }
    });

    if (result.result && result.result.success) {
      console.log('环境变量上传成功');
      return { success: true, data: result.result.data };
    } else {
      throw new Error(result.result.error || '上传失败');
    }
  } catch (error) {
    console.error('上传环境变量失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 从本地文件读取 .env 内容
 * @returns {Promise<string>} .env 文件内容
 */
async function readEnvFile() {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['env'],
      success: (res) => {
        const file = res.tempFiles[0];
        const fs = wx.getFileSystemManager();

        fs.readFile({
          filePath: file.path,
          encoding: 'utf8',
          success: (readRes) => {
            resolve(readRes.data);
          },
          fail: (readErr) => {
            reject(new Error('读取文件失败: ' + readErr.errMsg));
          }
        });
      },
      fail: (err) => {
        reject(new Error('选择文件失败: ' + err.errMsg));
      }
    });
  });
}

/**
 * 解析并验证 .env 文件内容
 * @param {string} content - .env 文件内容
 * @returns {Object} 解析结果
 */
function parseAndValidateEnv(content) {
  const lines = content.split('\n');
  const env = {};
  const errors = [];

  lines.forEach((line, index) => {
    line = line.trim();

    // 跳过空行和注释
    if (!line || line.startsWith('#')) {
      return;
    }

    const equalIndex = line.indexOf('=');
    if (equalIndex <= 0) {
      errors.push(`第 ${index + 1} 行格式错误: ${line}`);
      return;
    }

    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();

    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!key) {
      errors.push(`第 ${index + 1} 行键名不能为空`);
      return;
    }

    env[key] = value;
  });

  return {
    env,
    errors,
    isValid: errors.length === 0
  };
}

/**
 * 显示环境变量配置界面
 */
function showEnvConfigDialog() {
  wx.showModal({
    title: '环境变量配置',
    content: '请选择配置方式：\n1. 上传 .env 文件\n2. 手动输入配置',
    confirmText: '上传文件',
    cancelText: '手动输入',
    success: (res) => {
      if (res.confirm) {
        uploadEnvFromFile();
      } else {
        showManualConfigDialog();
      }
    }
  });
}

/**
 * 从文件上传环境变量
 */
async function uploadEnvFromFile() {
  try {
    const envContent = await readEnvFile();
    const parseResult = parseAndValidateEnv(envContent);

    if (!parseResult.isValid) {
      wx.showModal({
        title: '文件格式错误',
        content: parseResult.errors.join('\n'),
        showCancel: false
      });
      return;
    }

    // 选择环境类型
    wx.showActionSheet({
      itemList: ['开发环境', '生产环境'],
      success: async (res) => {
        const envType = res.tapIndex === 0 ? 'development' : 'production';

        wx.showLoading({
          title: '上传中...'
        });

        const result = await uploadEnvToCloud(envContent, envType);

        wx.hideLoading();

        if (result.success) {
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        } else {
          wx.showModal({
            title: '上传失败',
            content: result.error,
            showCancel: false
          });
        }
      }
    });
  } catch (error) {
    wx.showModal({
      title: '操作失败',
      content: error.message,
      showCancel: false
    });
  }
}

/**
 * 显示手动配置对话框
 */
function showManualConfigDialog() {
  wx.showModal({
    title: '手动配置',
    content: '请在小程序后台的云开发控制台中手动配置环境变量，或联系开发人员。',
    showCancel: false
  });
}

/**
 * 清除本地环境变量缓存
 */
function clearEnvCache() {
  try {
    wx.removeStorageSync('env_config');
    wx.showToast({
      title: '缓存已清除',
      icon: 'success'
    });
  } catch (error) {
    console.error('清除缓存失败:', error);
    wx.showToast({
      title: '清除失败',
      icon: 'none'
    });
  }
}

module.exports = {
  uploadEnvToCloud,
  readEnvFile,
  parseAndValidateEnv,
  showEnvConfigDialog,
  uploadEnvFromFile,
  showManualConfigDialog,
  clearEnvCache
};
