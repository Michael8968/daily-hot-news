// pages/detail/detail.js
'use strict';

const app = getApp();
const { formatDate, throttle } = require('../../utils/util');

Page({
  data: {
    newsId: null,
    news: null,
    summary: null,
    comments: [],
    commentText: '',
    loading: false,
    summaryLoading: false,
    commentLoading: false,
    hasMoreComments: true,
    commentPage: 1,
    commentPageSize: 10,
    isLiked: false,
    likeCount: 0,
    isCollected: false,
    shareCount: 0
  },

  onLoad(options) {
    console.log('详情页加载', options);
    const { id } = options;
    if (id) {
      this.setData({ newsId: id });
      this.loadNewsDetail();
    } else {
      wx.showToast({
        title: '新闻ID无效',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  onShow() {
    console.log('详情页显示');
  },

  onReady() {
    console.log('详情页准备就绪');
  },

  onHide() {
    console.log('详情页隐藏');
  },

  onUnload() {
    console.log('详情页卸载');
  },

  onShareAppMessage() {
    const { news } = this.data;
    if (news) {
      return {
        title: news.title,
        path: `/pages/detail/detail?id=${news.id}`,
        imageUrl: news.image
      };
    }
    return {
      title: '每日热点新闻',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    const { news } = this.data;
    if (news) {
      return {
        title: news.title,
        imageUrl: news.image
      };
    }
    return {
      title: '每日热点新闻'
    };
  },

  // 加载新闻详情
  async loadNewsDetail() {
    try {
      this.setData({ loading: true });

      // 调用云函数获取新闻详情
      const result = await wx.cloud.callFunction({
        name: 'getNewsDetail',
        data: { id: this.data.newsId }
      });

      if (result.result && result.result.success) {
        const newsData = result.result.data;
        this.setData({ news: newsData });
        
        // 加载相关数据
        this.loadRelatedData();
        
        // 记录用户行为
        app.recordUserAction('view_news_detail', {
          newsId: this.data.newsId,
          category: newsData.category
        });
      } else {
        throw new Error(result.result?.message || '获取新闻详情失败');
      }
    } catch (error) {
      console.error('加载新闻详情失败:', error);
      this.showError('加载失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载相关数据
  async loadRelatedData() {
    // 并行加载摘要、评论、点赞数据
    await Promise.all([
      this.loadSummary(),
      this.loadComments(),
      this.loadLikeData()
    ]);
  },

  // 加载AI摘要
  async loadSummary() {
    try {
      // 检查缓存
      const cachedSummary = wx.getStorageSync(`summary_${this.data.newsId}`);
      if (cachedSummary && this.isDataFresh(cachedSummary.timestamp)) {
        this.setData({ summary: cachedSummary.data });
        return;
      }

      this.setData({ summaryLoading: true });

      const result = await wx.cloud.callFunction({
        name: 'generateSummary',
        data: { 
          newsId: this.data.newsId,
          content: this.data.news.content 
        }
      });

      if (result.result && result.result.success) {
        const summary = result.result.data.summary;
        this.setData({ summary });
        
        // 缓存摘要
        wx.setStorageSync(`summary_${this.data.newsId}`, {
          data: summary,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('生成摘要失败:', error);
      wx.showToast({
        title: '摘要生成失败',
        icon: 'none'
      });
    } finally {
      this.setData({ summaryLoading: false });
    }
  },

  // 加载评论
  async loadComments(isRefresh = false) {
    if (this.data.commentLoading) return;

    try {
      this.setData({ commentLoading: true });

      const params = {
        newsId: this.data.newsId,
        page: isRefresh ? 1 : this.data.commentPage,
        pageSize: this.data.commentPageSize
      };

      const result = await wx.cloud.callFunction({
        name: 'getComments',
        data: params
      });

      if (result.result && result.result.success) {
        const commentData = result.result.data;
        
        if (isRefresh) {
          this.setData({
            comments: commentData.list,
            commentPage: 1,
            hasMoreComments: commentData.hasMore
          });
        } else {
          this.setData({
            comments: [...this.data.comments, ...commentData.list],
            commentPage: this.data.commentPage + 1,
            hasMoreComments: commentData.hasMore
          });
        }
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      this.setData({ commentLoading: false });
    }
  },

  // 加载点赞数据
  async loadLikeData() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getLikeData',
        data: { newsId: this.data.newsId }
      });

      if (result.result && result.result.success) {
        const likeData = result.result.data;
        this.setData({
          isLiked: likeData.isLiked,
          likeCount: likeData.likeCount,
          isCollected: likeData.isCollected
        });
      }
    } catch (error) {
      console.error('加载点赞数据失败:', error);
    }
  },

  // 提交评论
  async submitComment() {
    const { commentText } = this.data;
    if (!commentText.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    try {
      // 内容安全检查
      const safetyResult = await wx.checkContentSafety({
        content: commentText
      });

      if (!safetyResult.result) {
        wx.showToast({
          title: '评论内容包含敏感信息',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '提交中...' });

      const result = await wx.cloud.callFunction({
        name: 'addComment',
        data: {
          newsId: this.data.newsId,
          content: commentText.trim()
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });
        
        this.setData({ commentText: '' });
        this.loadComments(true);
        
        // 记录用户行为
        app.recordUserAction('add_comment', {
          newsId: this.data.newsId
        });
      } else {
        throw new Error(result.result?.message || '评论失败');
      }
    } catch (error) {
      console.error('提交评论失败:', error);
      wx.showToast({
        title: '评论失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 点赞/取消点赞
  async toggleLike() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'toggleLike',
        data: { newsId: this.data.newsId }
      });

      if (result.result && result.result.success) {
        const likeData = result.result.data;
        this.setData({
          isLiked: likeData.isLiked,
          likeCount: likeData.likeCount
        });
        
        // 记录用户行为
        app.recordUserAction('toggle_like', {
          newsId: this.data.newsId,
          isLiked: likeData.isLiked
        });
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 收藏/取消收藏
  async toggleCollect() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'toggleCollect',
        data: { newsId: this.data.newsId }
      });

      if (result.result && result.result.success) {
        const collectData = result.result.data;
        this.setData({ isCollected: collectData.isCollected });
        
        wx.showToast({
          title: collectData.isCollected ? '收藏成功' : '取消收藏',
          icon: 'success'
        });
        
        // 记录用户行为
        app.recordUserAction('toggle_collect', {
          newsId: this.data.newsId,
          isCollected: collectData.isCollected
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 加载更多评论
  async loadMoreComments() {
    if (!this.data.hasMoreComments || this.data.commentLoading) return;
    await this.loadComments();
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 判断数据是否新鲜
  isDataFresh(timestamp) {
    return Date.now() - timestamp < 30 * 60 * 1000; // 30分钟
  },

  // 显示错误信息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 复制链接
  copyLink() {
    const { news } = this.data;
    if (news && news.url) {
      wx.setClipboardData({
        data: news.url,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    }
  },

  // 举报内容
  reportContent() {
    wx.showModal({
      title: '举报内容',
      content: '确定要举报这条新闻吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用举报接口
          wx.cloud.callFunction({
            name: 'reportContent',
            data: { newsId: this.data.newsId }
          }).then(() => {
            wx.showToast({
              title: '举报成功',
              icon: 'success'
            });
          });
        }
      }
    });
  }
});
