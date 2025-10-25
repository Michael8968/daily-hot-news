// components/news-card/news-card.js
'use strict';

const { formatDate } = require('../../utils/util');

Component({
  properties: {
    news: {
      type: Object,
      value: {}
    },
    showCategory: {
      type: Boolean,
      value: true
    },
    showSource: {
      type: Boolean,
      value: true
    },
    showTime: {
      type: Boolean,
      value: true
    },
    layout: {
      type: String,
      value: 'horizontal' // horizontal, vertical
    }
  },

  data: {
    formattedTime: ''
  },

  lifetimes: {
    attached() {
      this.formatTime();
    }
  },

  observers: {
    'news.publishTime': function(publishTime) {
      if (publishTime) {
        this.formatTime();
      }
    }
  },

  methods: {
    // 格式化时间
    formatTime() {
      const { news } = this.properties;
      if (news && news.publishTime) {
        const formattedTime = formatDate(news.publishTime);
        this.setData({ formattedTime });
      }
    },

    // 点击新闻卡片
    onCardTap() {
      const { news } = this.properties;
      if (news && news.id) {
        // 触发父组件事件
        this.triggerEvent('tap', {
          news: news,
          id: news.id
        });
      }
    },

    // 点击图片
    onImageTap(e) {
      e.stopPropagation();
      const { news } = this.properties;
      if (news && news.image) {
        // 预览图片
        wx.previewImage({
          urls: [news.image],
          current: news.image
        });
      }
    },

    // 长按新闻卡片
    onCardLongPress() {
      const { news } = this.properties;
      if (news) {
        wx.showActionSheet({
          itemList: ['收藏', '分享', '举报'],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                this.collectNews();
                break;
              case 1:
                this.shareNews();
                break;
              case 2:
                this.reportNews();
                break;
            }
          }
        });
      }
    },

    // 收藏新闻
    collectNews() {
      const { news } = this.properties;
      if (news) {
        // 获取收藏列表
        const collectedNews = wx.getStorageSync('collectedNews') || [];
        const existingIndex = collectedNews.findIndex(item => item.id === news.id);
        
        if (existingIndex >= 0) {
          // 已收藏，取消收藏
          collectedNews.splice(existingIndex, 1);
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        } else {
          // 未收藏，添加收藏
          collectedNews.unshift({
            id: news.id,
            title: news.title,
            image: news.image,
            source: news.source,
            publishTime: news.publishTime,
            category: news.category,
            timestamp: Date.now()
          });
          wx.showToast({
            title: '已收藏',
            icon: 'success'
          });
        }
        
        // 保存收藏列表
        wx.setStorageSync('collectedNews', collectedNews);
        
        // 触发收藏事件
        this.triggerEvent('collect', {
          news: news,
          isCollected: existingIndex < 0
        });
      }
    },

    // 分享新闻
    shareNews() {
      const { news } = this.properties;
      if (news) {
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        });
      }
    },

    // 举报新闻
    reportNews() {
      const { news } = this.properties;
      if (news) {
        wx.showModal({
          title: '举报内容',
          content: '确定要举报这条新闻吗？',
          success: (res) => {
            if (res.confirm) {
              // 调用举报接口
              wx.cloud.callFunction({
                name: 'reportContent',
                data: { newsId: news.id }
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
    }
  }
});
