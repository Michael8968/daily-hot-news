// cloudfunctions/addComment/index.js
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { newsId, content, userId } = event;
  
  try {
    console.log('添加评论参数:', { newsId, contentLength: content?.length, userId });
    
    if (!newsId || !content || content.trim().length === 0) {
      throw new Error('参数不完整');
    }
    
    // 获取用户信息
    const userInfo = await getUserInfo(context);
    const commentUserId = userId || userInfo.openid;
    
    // 内容安全检查
    const safetyResult = await cloud.openapi.security.msgSecCheck({
      content: content
    });
    
    if (safetyResult.errCode !== 0) {
      throw new Error('评论内容包含敏感信息，请修改后重试');
    }
    
    // 创建评论数据
    const commentData = {
      newsId,
      content: content.trim(),
      userId: commentUserId,
      userInfo: {
        nickName: userInfo.nickName || '匿名用户',
        avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png'
      },
      likeCount: 0,
      replyCount: 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存评论到数据库
    const result = await db.collection('comments').add({
      data: commentData
    });
    
    if (result._id) {
      // 更新新闻的评论数
      await db.collection('news').where({
        id: newsId
      }).update({
        data: {
          commentCount: db.command.inc(1),
          updatedAt: new Date()
        }
      });
      
      return {
        success: true,
        data: {
          commentId: result._id,
          comment: {
            ...commentData,
            id: result._id
          }
        }
      };
    } else {
      throw new Error('评论保存失败');
    }
    
  } catch (error) {
    console.error('添加评论失败:', error);
    
    return {
      success: false,
      error: error.message || '添加评论失败'
    };
  }
};

// 获取用户信息
async function getUserInfo(context) {
  try {
    // 从云函数上下文获取用户信息
    const { OPENID } = cloud.getWXContext();
    
    // 从数据库获取用户详细信息
    const userResult = await db.collection('users').where({
      openid: OPENID
    }).get();
    
    if (userResult.data.length > 0) {
      return userResult.data[0];
    } else {
      // 如果用户不存在，创建新用户
      const newUser = {
        openid: OPENID,
        nickName: '匿名用户',
        avatarUrl: '/images/default-avatar.png',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const createResult = await db.collection('users').add({
        data: newUser
      });
      
      return {
        ...newUser,
        _id: createResult._id
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      openid: 'anonymous',
      nickName: '匿名用户',
      avatarUrl: '/images/default-avatar.png'
    };
  }
}
