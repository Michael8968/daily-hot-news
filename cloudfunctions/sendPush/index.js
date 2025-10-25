// cloudfunctions/sendPush/index.js
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { templateId, newsId, userIds } = event;
  
  try {
    console.log('发送推送参数:', { templateId, newsId, userIds });
    
    // 获取新闻信息
    let news = null;
    if (newsId) {
      const newsResult = await db.collection('news')
        .where({ id: newsId })
        .get();
      
      if (newsResult.data.length > 0) {
        news = newsResult.data[0];
      }
    }
    
    // 如果没有指定新闻，获取最新热门新闻
    if (!news) {
      const hotNewsResult = await db.collection('news')
        .orderBy('publishTime', 'desc')
        .limit(1)
        .get();
      
      if (hotNewsResult.data.length > 0) {
        news = hotNewsResult.data[0];
      }
    }
    
    if (!news) {
      throw new Error('没有可推送的新闻');
    }
    
    // 获取用户列表
    let targetUsers = [];
    if (userIds && userIds.length > 0) {
      // 推送给指定用户
      const usersResult = await db.collection('users')
        .where({
          openid: db.command.in(userIds)
        })
        .get();
      targetUsers = usersResult.data;
    } else {
      // 推送给所有订阅用户
      const usersResult = await db.collection('users')
        .where({
          pushNotification: true
        })
        .get();
      targetUsers = usersResult.data;
    }
    
    if (targetUsers.length === 0) {
      return {
        success: true,
        data: {
          message: '没有可推送的用户',
          sentCount: 0
        }
      };
    }
    
    // 构建推送消息
    const pushData = {
      thing1: {
        value: news.title.substring(0, 20) // 限制长度
      },
      thing2: {
        value: news.source || '每日热点新闻'
      },
      time3: {
        value: formatDate(news.publishTime)
      }
    };
    
    // 发送推送消息
    const sendResults = [];
    for (const user of targetUsers) {
      try {
        const sendResult = await cloud.openapi.subscribeMessage.send({
          touser: user.openid,
          template_id: templateId || 'your-template-id', // 替换为实际的模板ID
          page: `/pages/detail/detail?id=${news.id}`,
          data: pushData
        });
        
        sendResults.push({
          openid: user.openid,
          success: true,
          result: sendResult
        });
      } catch (error) {
        console.error(`发送推送失败 ${user.openid}:`, error);
        sendResults.push({
          openid: user.openid,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = sendResults.filter(r => r.success).length;
    
    return {
      success: true,
      data: {
        sentCount: successCount,
        totalCount: targetUsers.length,
        results: sendResults
      }
    };
    
  } catch (error) {
    console.error('发送推送失败:', error);
    
    return {
      success: false,
      error: error.message || '发送推送失败'
    };
  }
};

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60 * 1000) {
    return '刚刚';
  } else if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  } else if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}
