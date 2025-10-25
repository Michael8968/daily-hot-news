# 环境变量使用说明

## 概述

本项目支持通过 `.env` 文件管理环境变量，支持开发环境和生产环境的不同配置。

## 配置方式

### 1. 本地 .env 文件（推荐开发环境）

创建 `.env` 文件：

```bash
# 复制模板文件
cp env.example .env

# 编辑配置文件
# 填入实际的API密钥和配置信息
```

### 2. 云函数配置（推荐生产环境）

通过云函数管理环境变量，支持动态更新。

### 3. 本地存储配置

配置会缓存到本地存储，提高访问速度。

## 使用方法

### 1. 基础使用

```javascript
const { getConfig, initEnv } = require('./utils/env.js');

// 初始化环境变量
await initEnv();

// 获取配置
const apiKey = getConfig('NEWS_API_KEY');
```

### 2. 在页面中使用

```javascript
const { getConfig, getApiConfig } = require('../../utils/config.js');

Page({
  async onLoad() {
    // 获取API配置
    const apiConfig = getApiConfig();
    console.log('API配置:', apiConfig);
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

## 配置上传

### 1. 通过小程序界面

```javascript
const { showEnvConfigDialog } = require('../../utils/env-uploader.js');

// 显示配置对话框
showEnvConfigDialog();
```

### 2. 手动上传文件

```javascript
const { uploadEnvFromFile } = require('../../utils/env-uploader.js');

// 上传 .env 文件
await uploadEnvFromFile();
```

### 3. 直接上传配置

```javascript
const { uploadEnvToCloud } = require('../../utils/env-uploader.js');

const envContent = `
NEWS_API_KEY=your-actual-api-key
DEEPSEEK_API_KEY=your-actual-deepseek-key
`;

await uploadEnvToCloud(envContent, 'production');
```

## 配置验证

### 1. 自动验证

系统会在启动时自动验证配置：

```javascript
// app.js 中的自动验证
const validation = validateEnvConfig();
if (!validation.isValid) {
  console.warn('配置不完整:', validation.missing);
}
```

### 2. 手动验证

```javascript
const { validateConfig } = require('../../utils/config.js');

const validation = validateConfig();
if (!validation.isValid) {
  console.error('配置验证失败:', validation.missing);
}
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

## 缓存管理

### 1. 清除缓存

```javascript
const { clearEnvCache } = require('../../utils/env-uploader.js');

// 清除本地缓存
clearEnvCache();
```

### 2. 强制刷新

```javascript
const { initEnv } = require('../../utils/env.js');

// 重新初始化环境变量
await initEnv();
```

## 云函数配置

### 1. 获取配置云函数

```javascript
// 调用云函数获取配置
const result = await wx.cloud.callFunction({
  name: 'getEnvConfig',
  data: {}
});
```

### 2. 更新配置云函数

```javascript
// 更新配置
const result = await wx.cloud.callFunction({
  name: 'updateEnvConfig',
  data: {
    envType: 'production',
    config: envContent
  }
});
```

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

### 2. 错误处理

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

### 3. 配置缓存

```javascript
// 缓存配置避免重复获取
let cachedConfig = null;

async function getConfig() {
  if (!cachedConfig) {
    cachedConfig = await getAllEnvConfigAsync();
  }
  return cachedConfig;
}
```

## 故障排除

### 1. 配置未生效

- 检查环境变量名称是否正确
- 确认配置文件已正确加载
- 查看控制台错误信息
- 尝试清除缓存后重新加载

### 2. 云函数调用失败

- 检查云函数是否已部署
- 验证云开发环境ID
- 查看云函数日志

### 3. 配置上传失败

- 检查 .env 文件格式
- 验证云函数权限
- 查看网络连接状态

## 安全注意事项

1. **不要提交敏感信息**
   - 确保 `.env` 文件已添加到 `.gitignore`
   - 使用 `env.example` 作为模板

2. **生产环境配置**
   - 使用云函数环境变量
   - 定期轮换API密钥
   - 监控配置访问日志

3. **配置加密**
   - 敏感配置使用加密存储
   - 使用微信小程序安全存储

## 更新日志

- v1.0.0: 初始版本，支持基础环境变量配置
- v1.1.0: 添加 .env 文件支持
- v1.2.0: 支持云函数配置管理
- v1.3.0: 添加配置上传和验证功能
