# 环境变量配置说明

## 概述

本项目使用环境变量来管理配置信息，支持开发环境和生产环境的不同配置。

## 配置文件

### 1. env.example
环境变量模板文件，包含所有需要的配置项：

```bash
# 复制模板文件
cp env.example .env

# 编辑配置文件
# 填入实际的API密钥和配置信息
```

### 2. utils/env.js
环境变量工具文件，提供统一的配置获取接口。

### 3. utils/config.js
配置管理工具，提供便捷的配置访问方法。

## 配置项说明

### 基础配置
- `CLOUD_ENV_ID`: 云开发环境ID
- `NODE_ENV`: 运行环境 (development/production)
- `DEBUG`: 是否启用调试模式

### API配置
- `NEWS_API_KEY`: NewsAPI密钥
- `NEWS_API_BASE_URL`: NewsAPI基础URL
- `DEEPSEEK_API_KEY`: DeepSeek API密钥
- `DEEPSEEK_API_BASE_URL`: DeepSeek API基础URL

### 性能配置
- `REQUEST_TIMEOUT`: 请求超时时间（毫秒）
- `CACHE_TTL`: 缓存过期时间（秒）
- `MAX_CONCURRENT_REQUESTS`: 最大并发请求数

### 推送配置
- `PUSH_TEMPLATE_ID`: 推送模板ID
- `PUSH_ACCESS_TOKEN`: 推送访问令牌

## 使用方法

### 1. 在app.js中使用

```javascript
// 获取配置
const config = this.globalData.config;
const envId = config.cloudEnvId;

// 使用配置
wx.cloud.init({
  env: envId,
  traceUser: true
});
```

### 2. 在页面中使用

```javascript
const { getConfig, getApiConfig, isDevelopment } = require('../../utils/config.js');

Page({
  onLoad() {
    // 获取API配置
    const apiConfig = getApiConfig();

    // 检查环境
    if (isDevelopment()) {
      console.log('开发环境');
    }
  }
});
```

### 3. 在组件中使用

```javascript
const { getConfig } = require('../../utils/config.js');

Component({
  methods: {
    getApiKey() {
      return getConfig('newsApiKey');
    }
  }
});
```

## 环境区分

### 开发环境
- 使用开发配置
- 启用调试日志
- 显示配置警告

### 生产环境
- 使用生产配置
- 关闭调试日志
- 隐藏敏感信息

## 配置验证

系统会自动验证配置的完整性：

```javascript
const { validateConfig } = require('../../utils/config.js');

const validation = validateConfig();
if (!validation.isValid) {
  console.warn('配置不完整:', validation.missing);
}
```

## 安全注意事项

1. **不要提交敏感信息**
   - 确保 `.env` 文件已添加到 `.gitignore`
   - 使用 `env.example` 作为模板

2. **生产环境配置**
   - 使用云函数环境变量
   - 使用微信小程序配置管理
   - 定期轮换API密钥

3. **配置加密**
   - 敏感配置使用加密存储
   - 使用微信小程序安全存储

## 最佳实践

### 1. 配置分层
```javascript
// 基础配置
const baseConfig = {
  timeout: 10000,
  retries: 3
};

// 环境特定配置
const envConfig = isDevelopment() ? devConfig : prodConfig;

// 合并配置
const finalConfig = { ...baseConfig, ...envConfig };
```

### 2. 配置缓存
```javascript
// 缓存配置避免重复获取
let cachedConfig = null;

function getConfig() {
  if (!cachedConfig) {
    cachedConfig = getAllEnvConfig();
  }
  return cachedConfig;
}
```

### 3. 错误处理
```javascript
try {
  const config = getConfig('apiKey');
  if (!config || config.includes('your-')) {
    throw new Error('API密钥未配置');
  }
} catch (error) {
  console.error('配置错误:', error);
  // 使用默认配置或显示错误
}
```

## 故障排除

### 1. 配置未生效
- 检查环境变量名称是否正确
- 确认配置文件已正确加载
- 查看控制台错误信息

### 2. API调用失败
- 验证API密钥是否正确
- 检查网络连接
- 查看API服务状态

### 3. 云函数部署失败
- 检查云开发环境ID
- 验证云函数代码
- 查看云函数日志

## 更新日志

- v1.0.0: 初始版本，支持基础环境变量配置
- v1.1.0: 添加配置验证和错误处理
- v1.2.0: 支持多环境配置管理
