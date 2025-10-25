# 每日热点新闻小程序

一个专注于聚合每日国内外热点新闻的微信小程序，提供AI生成摘要、个性化推荐、推送通知、分享和用户交互功能。

## 项目特色

- 🚀 **AI智能摘要** - 使用DeepSeek API生成新闻摘要，避免信息过载
- 🎯 **个性化推荐** - 基于用户浏览历史智能推荐相关内容
- 📱 **现代化UI** - 支持暗黑模式，响应式设计
- 🔔 **推送通知** - 及时推送热点新闻
- 💬 **互动功能** - 评论、点赞、收藏、分享
- 🛡️ **内容安全** - 集成微信内容安全检查
- ⚡ **高性能** - 图片懒加载、分页加载、离线缓存

## 技术架构

### 前端技术栈
- **框架**: 微信小程序原生框架
- **语言**: JavaScript ES6+
- **样式**: WXSS + CSS变量
- **组件**: 自定义组件化开发
- **状态管理**: 全局数据管理

### 后端技术栈
- **云开发**: 腾讯云开发 (CloudBase)
- **云函数**: Node.js
- **数据库**: 云数据库 (MongoDB)
- **存储**: 云存储
- **AI服务**: DeepSeek API
- **新闻API**: NewsAPI.org

### 项目结构
```
daily-hot-news/
├── app.js                    # 全局逻辑
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── sitemap.json              # 站点地图
├── project.config.json       # 项目配置
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   ├── detail/              # 详情页
│   ├── discover/            # 发现页
│   └── profile/             # 个人中心
├── components/              # 组件目录
│   ├── news-card/           # 新闻卡片组件
│   └── comment-item/        # 评论组件
├── utils/                   # 工具函数
│   ├── api.js              # HTTP请求工具
│   ├── util.js              # 通用工具函数
│   ├── cloud.js             # 云开发工具
│   └── mock.js              # 模拟数据
├── cloudfunctions/          # 云函数
│   ├── fetchNews/           # 新闻抓取
│   ├── generateSummary/     # AI摘要生成
│   ├── addComment/          # 添加评论
│   ├── recommend/           # 个性化推荐
│   └── sendPush/            # 推送通知
├── tests/                   # 测试文件
│   ├── utils.test.js        # 工具函数测试
│   ├── components.test.js    # 组件测试
│   ├── setup.js             # 测试环境设置
│   └── package.json         # 测试依赖
└── README.md                # 项目文档
```

## 功能特性

### 1. 新闻聚合
- 多源新闻聚合（国内、国际、科技、经济等分类）
- 实时新闻更新
- 新闻分类筛选
- 搜索功能

### 2. AI智能摘要
- 使用DeepSeek API生成新闻摘要
- 摘要缓存机制
- 摘要质量优化

### 3. 个性化推荐
- 基于用户浏览历史推荐
- 用户偏好分析
- 推荐算法优化

### 4. 用户交互
- 评论系统
- 点赞功能
- 收藏功能
- 分享功能

### 5. 推送通知
- 订阅消息推送
- 定时推送
- 个性化推送

### 6. 用户体验
- 暗黑模式支持
- 响应式设计
- 图片懒加载
- 离线缓存

## 快速开始

### 环境要求
- 微信开发者工具 1.05.0+
- Node.js 14.0+
- 微信小程序账号

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/daily-hot-news.git
cd daily-hot-news
```

2. **配置云开发**
   - 在微信公众平台创建小程序
   - 开通云开发服务
   - 获取环境ID

3. **配置API密钥**
   - 在 `app.js` 中配置云开发环境ID
   - 在云函数中配置NewsAPI密钥
   - 在云函数中配置DeepSeek API密钥

4. **安装依赖**
```bash
# 安装云函数依赖
cd cloudfunctions/fetchNews && npm install
cd ../generateSummary && npm install
cd ../addComment && npm install
cd ../recommend && npm install
cd ../sendPush && npm install

# 安装测试依赖
cd ../../tests && npm install
```

5. **部署云函数**
```bash
# 在微信开发者工具中右键云函数文件夹
# 选择"上传并部署：云端安装依赖"
```

6. **运行项目**
   - 在微信开发者工具中打开项目
   - 点击"编译"按钮
   - 在模拟器中预览

### 配置说明

#### 1. 云开发配置
在 `app.js` 中修改环境ID：
```javascript
globalData: {
  envId: 'your-env-id', // 替换为实际的云开发环境ID
  // ... 其他配置
}
```

#### 2. TabBar 图标配置
如果需要使用 TabBar 图标，请：

1. **准备图标文件**（81px * 81px，PNG格式）：
   - `images/home.png` - 首页图标（未选中）
   - `images/home-active.png` - 首页图标（选中）
   - `images/discover.png` - 发现页图标（未选中）
   - `images/discover-active.png` - 发现页图标（选中）
   - `images/profile.png` - 个人中心图标（未选中）
   - `images/profile-active.png` - 个人中心图标（选中）

2. **更新 app.json 配置**：
```json
{
  "pagePath": "pages/index/index",
  "iconPath": "images/home.png",
  "selectedIconPath": "images/home-active.png",
  "text": "首页"
}
```

**注意**：当前配置使用纯文本 TabBar，无需图标文件即可正常运行。

#### 3. API密钥配置
在云函数中配置API密钥：

**fetchNews/index.js**
```javascript
const newsApiKey = process.env.NEWS_API_KEY || 'your-news-api-key';
```

**generateSummary/index.js**
```javascript
const deepSeekApiKey = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key';
```

#### 4. 推送模板配置
在 `pages/profile/profile.js` 中配置推送模板ID：
```javascript
wx.requestSubscribeMessage({
  tmplIds: ['your-template-id'], // 替换为实际的模板ID
  // ...
});
```

## 开发指南

### 代码规范
- 使用ES6+语法
- 模块化开发（export/import）
- 中英文注释
- 严格模式

### 组件开发
```javascript
// 组件示例
Component({
  properties: {
    news: {
      type: Object,
      value: {}
    }
  },
  
  methods: {
    onTap() {
      this.triggerEvent('tap', this.data.news);
    }
  }
});
```

### 页面开发
```javascript
// 页面示例
Page({
  data: {
    newsList: []
  },
  
  onLoad() {
    this.loadNews();
  },
  
  async loadNews() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'fetchNews'
      });
      this.setData({
        newsList: result.result.data
      });
    } catch (error) {
      console.error('加载新闻失败:', error);
    }
  }
});
```

### 云函数开发
```javascript
// 云函数示例
exports.main = async (event, context) => {
  try {
    // 业务逻辑
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 测试覆盖
- 工具函数测试
- 组件测试
- 云函数测试
- 集成测试

## 部署

### 1. 云函数部署
在微信开发者工具中：
1. 右键云函数文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

### 2. 小程序发布
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 审核通过后发布

### 3. 数据库初始化
```javascript
// 创建数据库集合
const db = wx.cloud.database();

// 创建新闻集合
await db.createCollection('news');

// 创建评论集合
await db.createCollection('comments');

// 创建用户集合
await db.createCollection('users');
```

## API文档

### 云函数API

#### fetchNews
获取新闻列表
```javascript
wx.cloud.callFunction({
  name: 'fetchNews',
  data: {
    category: 'all', // 分类
    page: 1,         // 页码
    pageSize: 10     // 每页数量
  }
});
```

#### generateSummary
生成AI摘要
```javascript
wx.cloud.callFunction({
  name: 'generateSummary',
  data: {
    newsId: 'news_1',
    content: '新闻内容'
  }
});
```

#### addComment
添加评论
```javascript
wx.cloud.callFunction({
  name: 'addComment',
  data: {
    newsId: 'news_1',
    content: '评论内容'
  }
});
```

#### recommend
获取推荐新闻
```javascript
wx.cloud.callFunction({
  name: 'recommend',
  data: {
    preferences: {
      categories: ['technology', 'economy']
    }
  }
});
```

### 数据库结构

#### news集合
```javascript
{
  id: String,           // 新闻ID
  title: String,        // 标题
  content: String,       // 内容
  summary: String,       // 摘要
  image: String,         // 图片
  source: String,        // 来源
  url: String,          // 链接
  publishTime: Date,     // 发布时间
  category: String,      // 分类
  author: String,        // 作者
  viewCount: Number,     // 浏览次数
  likeCount: Number,     // 点赞数
  commentCount: Number,  // 评论数
  isHot: Boolean,       // 是否热门
  tags: Array,          // 标签
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

#### comments集合
```javascript
{
  id: String,            // 评论ID
  newsId: String,        // 新闻ID
  userId: String,        // 用户ID
  userInfo: Object,      // 用户信息
  content: String,       // 评论内容
  likeCount: Number,     // 点赞数
  replyCount: Number,    // 回复数
  isLiked: Boolean,      // 是否已点赞
  isDeleted: Boolean,    // 是否已删除
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

#### users集合
```javascript
{
  id: String,            // 用户ID
  openid: String,        // 微信openid
  nickName: String,      // 昵称
  avatarUrl: String,     // 头像
  gender: Number,        // 性别
  city: String,          // 城市
  province: String,      // 省份
  country: String,       // 国家
  language: String,      // 语言
  pushNotification: Boolean, // 推送通知
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

## 常见问题

### Q: 如何获取NewsAPI密钥？
A: 访问 [NewsAPI官网](https://newsapi.org/) 注册账号并获取API密钥。

### Q: 如何获取DeepSeek API密钥？
A: 访问 [DeepSeek官网](https://www.deepseek.com/) 注册账号并获取API密钥。

### Q: 如何配置推送模板？
A: 在微信公众平台的小程序后台，进入"功能" -> "订阅消息"，创建模板并获取模板ID。

### Q: 云函数部署失败怎么办？
A: 检查云函数代码是否有语法错误，确保所有依赖都已安装。

### Q: 如何调试云函数？
A: 在微信开发者工具的云开发控制台中查看云函数日志。

### Q: 如何优化小程序性能？
A: 使用图片懒加载、分页加载、缓存机制等优化策略。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/your-username/daily-hot-news](https://github.com/your-username/daily-hot-news)
- 问题反馈: [Issues](https://github.com/your-username/daily-hot-news/issues)

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础功能实现
- AI摘要功能
- 个性化推荐
- 用户交互功能

---

**注意**: 请确保在生产环境中替换所有占位符API密钥和配置信息。
