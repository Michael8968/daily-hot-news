// cloudfunctions/generateSummary/index.js
'use strict';

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { newsId, content } = event;
  
  try {
    console.log('生成摘要参数:', { newsId, contentLength: content?.length });
    
    if (!content || content.trim().length === 0) {
      throw new Error('新闻内容不能为空');
    }
    
    // 检查是否已有缓存的摘要
    if (newsId) {
      try {
        const cachedSummary = await db.collection('summaries')
          .where({ newsId })
          .get();
        
        if (cachedSummary.data.length > 0) {
          const summary = cachedSummary.data[0];
          return {
            success: true,
            data: {
              summary: summary.content,
              fromCache: true,
              createdAt: summary.createdAt
            }
          };
        }
      } catch (error) {
        console.error('获取缓存摘要失败:', error);
      }
    }
    
    // 调用DeepSeek API生成摘要
    const deepSeekApiKey = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key';
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    const prompt = `请为以下新闻生成100-150字的简洁中立摘要，突出关键事实和影响：

${content}

要求：
1. 保持客观中立的立场
2. 突出关键事实和重要信息
3. 语言简洁明了
4. 字数控制在100-150字之间
5. 避免主观判断和推测`;

    const response = await axios.post(apiUrl, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${deepSeekApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.data.choices && response.data.choices.length > 0) {
      const summary = response.data.choices[0].message.content.trim();
      
      // 缓存摘要到数据库
      if (newsId) {
        try {
          await db.collection('summaries').add({
            data: {
              newsId,
              content: summary,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        } catch (error) {
          console.error('缓存摘要失败:', error);
        }
      }
      
      return {
        success: true,
        data: {
          summary,
          fromCache: false,
          createdAt: new Date()
        }
      };
    } else {
      throw new Error('AI摘要生成失败');
    }
    
  } catch (error) {
    console.error('生成摘要失败:', error);
    
    // 如果AI生成失败，返回基于规则的简单摘要
    const fallbackSummary = generateFallbackSummary(content);
    
    return {
      success: true,
      data: {
        summary: fallbackSummary,
        fromCache: false,
        fromFallback: true,
        createdAt: new Date()
      }
    };
  }
};

// 生成备用摘要（基于规则）
function generateFallbackSummary(content) {
  if (!content || content.trim().length === 0) {
    return '暂无摘要内容';
  }
  
  // 简单的文本处理
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return content.substring(0, 100) + '...';
  }
  
  // 取前两句作为摘要
  const summary = sentences.slice(0, 2).join('。');
  
  // 如果摘要太长，截取前100个字符
  if (summary.length > 100) {
    return summary.substring(0, 100) + '...';
  }
  
  return summary;
}
