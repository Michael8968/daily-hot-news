// utils/cloud.js
'use strict';

/**
 * 云开发工具函数
 */

/**
 * 初始化云开发
 * @param {string} envId 环境ID
 */
export function initCloud(envId) {
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    return false;
  }

  wx.cloud.init({
    env: envId,
    traceUser: true
  });

  return true;
}

/**
 * 调用云函数
 * @param {string} name 云函数名称
 * @param {Object} data 参数
 * @returns {Promise} 调用结果
 */
export function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result);
      },
      fail: (err) => {
        console.error(`调用云函数 ${name} 失败:`, err);
        reject(err);
      }
    });
  });
}

/**
 * 获取数据库引用
 * @param {string} collectionName 集合名称
 * @returns {Object} 数据库引用
 */
export function getDatabase(collectionName) {
  return wx.cloud.database().collection(collectionName);
}

/**
 * 查询数据
 * @param {string} collectionName 集合名称
 * @param {Object} where 查询条件
 * @param {Object} options 查询选项
 * @returns {Promise} 查询结果
 */
export async function queryData(collectionName, where = {}, options = {}) {
  try {
    const db = getDatabase(collectionName);
    let query = db.where(where);

    // 排序
    if (options.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'desc');
    }

    // 分页
    if (options.skip) {
      query = query.skip(options.skip);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const result = await query.get();
    return {
      success: true,
      data: result.data,
      total: result.data.length
    };
  } catch (error) {
    console.error(`查询数据失败 ${collectionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 添加数据
 * @param {string} collectionName 集合名称
 * @param {Object} data 数据
 * @returns {Promise} 添加结果
 */
export async function addData(collectionName, data) {
  try {
    const db = getDatabase(collectionName);
    const result = await db.add({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      id: result._id,
      data: result
    };
  } catch (error) {
    console.error(`添加数据失败 ${collectionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新数据
 * @param {string} collectionName 集合名称
 * @param {Object} where 查询条件
 * @param {Object} data 更新数据
 * @returns {Promise} 更新结果
 */
export async function updateData(collectionName, where, data) {
  try {
    const db = getDatabase(collectionName);
    const result = await db.where(where).update({
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      stats: result.stats
    };
  } catch (error) {
    console.error(`更新数据失败 ${collectionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 删除数据
 * @param {string} collectionName 集合名称
 * @param {Object} where 查询条件
 * @returns {Promise} 删除结果
 */
export async function deleteData(collectionName, where) {
  try {
    const db = getDatabase(collectionName);
    const result = await db.where(where).remove();

    return {
      success: true,
      stats: result.stats
    };
  } catch (error) {
    console.error(`删除数据失败 ${collectionName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 上传文件
 * @param {string} filePath 文件路径
 * @param {string} cloudPath 云存储路径
 * @returns {Promise} 上传结果
 */
export function uploadFile(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        resolve({
          success: true,
          fileID: res.fileID,
          data: res
        });
      },
      fail: (err) => {
        console.error('上传文件失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 下载文件
 * @param {string} fileID 文件ID
 * @returns {Promise} 下载结果
 */
export function downloadFile(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({
      fileID,
      success: (res) => {
        resolve({
          success: true,
          tempFilePath: res.tempFilePath,
          data: res
        });
      },
      fail: (err) => {
        console.error('下载文件失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 删除文件
 * @param {string} fileID 文件ID
 * @returns {Promise} 删除结果
 */
export function deleteFile(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList: [fileID],
      success: (res) => {
        resolve({
          success: true,
          data: res
        });
      },
      fail: (err) => {
        console.error('删除文件失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取临时链接
 * @param {string} fileID 文件ID
 * @returns {Promise} 临时链接
 */
export function getTempFileURL(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        if (res.fileList && res.fileList.length > 0) {
          resolve({
            success: true,
            tempFileURL: res.fileList[0].tempFileURL
          });
        } else {
          reject(new Error('获取临时链接失败'));
        }
      },
      fail: (err) => {
        console.error('获取临时链接失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 内容安全检查
 * @param {string} content 内容
 * @returns {Promise} 检查结果
 */
export function checkContentSafety(content) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'checkContentSafety',
      data: { content },
      success: (res) => {
        resolve({
          success: true,
          result: res.result
        });
      },
      fail: (err) => {
        console.error('内容安全检查失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取用户信息
 * @returns {Promise} 用户信息
 */
export function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve({
          success: true,
          userInfo: res.userInfo
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 登录
 * @returns {Promise} 登录结果
 */
export function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve({
            success: true,
            code: res.code
          });
        } else {
          reject(new Error('登录失败'));
        }
      },
      fail: (err) => {
        console.error('登录失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取OpenID
 * @returns {Promise} OpenID
 */
export function getOpenId() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: (res) => {
        resolve({
          success: true,
          openid: res.result.openid
        });
      },
      fail: (err) => {
        console.error('获取OpenID失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 请求推送权限
 * @param {Array} tmplIds 模板ID数组
 * @returns {Promise} 权限结果
 */
export function requestSubscribeMessage(tmplIds) {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        resolve({
          success: true,
          result: res
        });
      },
      fail: (err) => {
        console.error('请求推送权限失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取位置信息
 * @returns {Promise} 位置信息
 */
export function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        resolve({
          success: true,
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy
        });
      },
      fail: (err) => {
        console.error('获取位置信息失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 选择位置
 * @returns {Promise} 位置信息
 */
export function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        resolve({
          success: true,
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 扫码
 * @returns {Promise} 扫码结果
 */
export function scanCode() {
  return new Promise((resolve, reject) => {
    wx.scanCode({
      success: (res) => {
        resolve({
          success: true,
          result: res.result,
          scanType: res.scanType,
          charSet: res.charSet,
          path: res.path
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 选择图片
 * @param {Object} options 选项
 * @returns {Promise} 选择结果
 */
export function chooseImage(options = {}) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['original', 'compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success: (res) => {
        resolve({
          success: true,
          tempFilePaths: res.tempFilePaths
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 选择视频
 * @param {Object} options 选项
 * @returns {Promise} 选择结果
 */
export function chooseVideo(options = {}) {
  return new Promise((resolve, reject) => {
    wx.chooseVideo({
      sourceType: options.sourceType || ['album', 'camera'],
      maxDuration: options.maxDuration || 60,
      camera: options.camera || 'back',
      success: (res) => {
        resolve({
          success: true,
          tempFilePath: res.tempFilePath,
          duration: res.duration,
          size: res.size,
          height: res.height,
          width: res.width
        });
      },
      fail: (err) => {
        console.error('选择视频失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 录音
 * @param {Object} options 选项
 * @returns {Promise} 录音结果
 */
export function startRecord(options = {}) {
  return new Promise((resolve, reject) => {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
    });
    
    recorderManager.onStop((res) => {
      resolve({
        success: true,
        tempFilePath: res.tempFilePath,
        duration: res.duration,
        fileSize: res.fileSize
      });
    });
    
    recorderManager.onError((err) => {
      console.error('录音失败:', err);
      reject(err);
    });
    
    recorderManager.start({
      duration: options.duration || 60000,
      sampleRate: options.sampleRate || 16000,
      numberOfChannels: options.numberOfChannels || 1,
      encodeBitRate: options.encodeBitRate || 96000,
      format: options.format || 'mp3'
    });
  });
}

/**
 * 停止录音
 */
export function stopRecord() {
  const recorderManager = wx.getRecorderManager();
  recorderManager.stop();
}

/**
 * 播放音频
 * @param {string} src 音频源
 * @returns {Promise} 播放结果
 */
export function playAudio(src) {
  return new Promise((resolve, reject) => {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.src = src;
    audioContext.onPlay(() => {
      console.log('音频开始播放');
    });
    
    audioContext.onEnded(() => {
      resolve({
        success: true,
        message: '播放完成'
      });
    });
    
    audioContext.onError((err) => {
      console.error('音频播放失败:', err);
      reject(err);
    });
    
    audioContext.play();
  });
}

/**
 * 停止音频播放
 */
export function stopAudio() {
  const audioContext = wx.createInnerAudioContext();
  audioContext.stop();
}

/**
 * 震动
 * @param {string} type 震动类型
 */
export function vibrate(type = 'short') {
  if (type === 'short') {
    wx.vibrateShort();
  } else if (type === 'long') {
    wx.vibrateLong();
  }
}

/**
 * 设置剪贴板
 * @param {string} data 数据
 * @returns {Promise} 设置结果
 */
export function setClipboardData(data) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data,
      success: () => {
        resolve({
          success: true,
          message: '已复制到剪贴板'
        });
      },
      fail: (err) => {
        console.error('设置剪贴板失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取剪贴板数据
 * @returns {Promise} 剪贴板数据
 */
export function getClipboardData() {
  return new Promise((resolve, reject) => {
    wx.getClipboardData({
      success: (res) => {
        resolve({
          success: true,
          data: res.data
        });
      },
      fail: (err) => {
        console.error('获取剪贴板数据失败:', err);
        reject(err);
      }
    });
  });
}
