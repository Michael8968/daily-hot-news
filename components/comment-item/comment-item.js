// components/comment-item/comment-item.js
'use strict';

const { formatDate } = require('../../utils/util');

Component({
  properties: {
    comment: {
      type: Object,
      value: {}
    },
    showAvatar: {
      type: Boolean,
      value: true
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },

  data: {
    formattedTime: '',
    isLiked: false,
    likeCount: 0
  },

  lifetimes: {
    attached() {
      this.formatTime();
      this.loadLikeData();
    }
  },

  observers: {
    'comment.timestamp': function(timestamp) {
      if (timestamp) {
        this.formatTime();
      }
    }
  },

  methods: {
    // 格式化时间
    formatTime() {
      const { comment } = this.properties;
      if (comment && comment.timestamp) {
        const formattedTime = formatDate(comment.timestamp);
        this.setData({ formattedTime });
      }
    },

    // 加载点赞数据
    loadLikeData() {
      const { comment } = this.properties;
      if (comment) {
        this.setData({
          isLiked: comment.isLiked || false,
          likeCount: comment.likeCount || 0
        });
      }
    },

    // 点击评论
    onCommentTap() {
      const { comment } = this.properties;
      if (comment) {
        this.triggerEvent('tap', {
          comment: comment,
          id: comment.id
        });
      }
    },

    // 点赞评论
    async onLikeTap() {
      const { comment } = this.properties;
      if (!comment || !comment.id) return;

      try {
        const result = await wx.cloud.callFunction({
          name: 'toggleCommentLike',
          data: { commentId: comment.id }
        });

        if (result.result && result.result.success) {
          const likeData = result.result.data;
          this.setData({
            isLiked: likeData.isLiked,
            likeCount: likeData.likeCount
          });
          
          // 触发点赞事件
          this.triggerEvent('like', {
            comment: comment,
            isLiked: likeData.isLiked,
            likeCount: likeData.likeCount
          });
        }
      } catch (error) {
        console.error('点赞失败:', error);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },

    // 回复评论
    onReplyTap() {
      const { comment } = this.properties;
      if (comment) {
        this.triggerEvent('reply', {
          comment: comment,
          id: comment.id
        });
      }
    },

    // 长按评论
    onCommentLongPress() {
      const { comment } = this.properties;
      if (comment) {
        wx.showActionSheet({
          itemList: ['复制', '举报', '删除'],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                this.copyComment();
                break;
              case 1:
                this.reportComment();
                break;
              case 2:
                this.deleteComment();
                break;
            }
          }
        });
      }
    },

    // 复制评论
    copyComment() {
      const { comment } = this.properties;
      if (comment && comment.content) {
        wx.setClipboardData({
          data: comment.content,
          success: () => {
            wx.showToast({
              title: '已复制',
              icon: 'success'
            });
          }
        });
      }
    },

    // 举报评论
    reportComment() {
      const { comment } = this.properties;
      if (comment) {
        wx.showModal({
          title: '举报评论',
          content: '确定要举报这条评论吗？',
          success: (res) => {
            if (res.confirm) {
              wx.cloud.callFunction({
                name: 'reportComment',
                data: { commentId: comment.id }
              }).then(() => {
                wx.showToast({
                  title: '举报成功',
                  icon: 'success'
                });
              }).catch(() => {
                wx.showToast({
                  title: '举报失败',
                  icon: 'none'
                });
              });
            }
          }
        });
      }
    },

    // 删除评论
    deleteComment() {
      const { comment } = this.properties;
      if (comment) {
        wx.showModal({
          title: '删除评论',
          content: '确定要删除这条评论吗？',
          success: (res) => {
            if (res.confirm) {
              wx.cloud.callFunction({
                name: 'deleteComment',
                data: { commentId: comment.id }
              }).then(() => {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                // 触发删除事件
                this.triggerEvent('delete', {
                  comment: comment,
                  id: comment.id
                });
              }).catch(() => {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              });
            }
          }
        });
      }
    },

    // 点击用户头像
    onAvatarTap() {
      const { comment } = this.properties;
      if (comment && comment.userInfo) {
        this.triggerEvent('avatar', {
          userInfo: comment.userInfo,
          userId: comment.userId
        });
      }
    }
  }
});
