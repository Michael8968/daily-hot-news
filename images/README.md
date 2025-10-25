# 图标文件说明

## TabBar 图标

由于微信小程序需要实际的图片文件作为 TabBar 图标，您需要准备以下图标文件：

### 需要的图标文件：
- `home.png` - 首页图标（未选中状态）
- `home-active.png` - 首页图标（选中状态）
- `discover.png` - 发现页图标（未选中状态）
- `discover-active.png` - 发现页图标（选中状态）
- `profile.png` - 个人中心图标（未选中状态）
- `profile-active.png` - 个人中心图标（选中状态）

### 图标规格要求：
- 尺寸：81px * 81px
- 格式：PNG
- 背景：透明
- 颜色：未选中状态使用灰色，选中状态使用主题色

### 如何添加图标：

1. **准备图标文件**：
   - 使用设计工具（如 Figma、Sketch、Photoshop）创建图标
   - 或者从图标库（如 iconfont、iconpark）下载合适的图标

2. **图标建议**：
   - 首页：🏠 或 📰 图标
   - 发现：🔍 或 📈 图标  
   - 我的：👤 或 ⚙️ 图标

3. **放置图标**：
   - 将图标文件放在 `images/` 目录下
   - 确保文件名与 `app.json` 中的配置一致

4. **更新配置**：
   - 在 `app.json` 的 `tabBar.list` 中添加 `iconPath` 和 `selectedIconPath` 字段

### 临时解决方案：

如果您暂时没有图标文件，可以：
1. 使用纯文本 TabBar（当前配置）
2. 或者使用微信小程序内置的图标字体
3. 或者使用在线图标生成工具创建简单图标

### 示例配置（有图标时）：

```json
{
  "pagePath": "pages/index/index",
  "iconPath": "images/home.png",
  "selectedIconPath": "images/home-active.png",
  "text": "首页"
}
```
