# 🚨 快速修复：所有 Gemini 模型失败

## ⚡ 5 分钟快速解决方案

### 步骤 1: 检查 Vercel 环境变量（2 分钟）

1. **打开 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 登录你的账号

2. **进入项目设置**
   - 找到你的项目（ai-tools-platform）
   - 点击项目进入详情页
   - 点击顶部 **Settings**（设置）

3. **检查环境变量**
   - 在左侧菜单点击 **Environment Variables**（环境变量）
   - 查找以下变量：

   **必需的环境变量**：
   - [ ] `GOOGLE_API_KEY` - 必须存在且有值
   - [ ] `AI_PROVIDER` - 应该设置为 `google`

   **检查项**：
   - [ ] `GOOGLE_API_KEY` 的值不是 `your_google_api_key_here` 或空
   - [ ] `GOOGLE_API_KEY` 的值以 `AIza` 开头（Google API 密钥的标准格式）
   - [ ] 环境变量已应用到所有环境（Production, Preview, Development）

### 步骤 2: 获取/验证 Google API 密钥（2 分钟）

#### 选项 A: 如果还没有 API 密钥

1. **访问 Google AI Studio**
   - 打开：https://makersuite.google.com/app/apikey
   - 使用 Google 账号登录

2. **创建 API 密钥**
   - 点击 **Create API Key**（创建 API 密钥）
   - 选择或创建一个 Google Cloud 项目
   - **复制生成的 API 密钥**（格式类似：`AIzaSy...`）

3. **在 Vercel 中添加**
   - 回到 Vercel Dashboard
   - 在 Environment Variables 页面
   - 点击 **Add New**（添加新变量）
   - **Name**: `GOOGLE_API_KEY`
   - **Value**: 粘贴刚才复制的 API 密钥
   - **Environment**: 选择所有（Production, Preview, Development）
   - 点击 **Save**

#### 选项 B: 如果已有 API 密钥但可能无效

1. **验证 API 密钥**
   - 访问：https://makersuite.google.com/app/apikey
   - 检查你的 API 密钥是否在列表中
   - 检查是否被禁用

2. **如果无效，创建新的**
   - 点击 **Create API Key**
   - 复制新密钥
   - 在 Vercel 中更新 `GOOGLE_API_KEY`

### 步骤 3: 添加其他必需的环境变量（1 分钟）

确保以下环境变量都已设置：

1. **AI_PROVIDER**
   - **Name**: `AI_PROVIDER`
   - **Value**: `google`
   - **Environment**: 所有环境

2. **NODE_ENV**（推荐）
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production

### 步骤 4: 重新部署（1 分钟）

1. **触发重新部署**
   - 在 Vercel Dashboard 中
   - 进入 **Deployments**（部署）
   - 找到最新的部署
   - 点击右侧 **⋯**（三个点）
   - 选择 **Redeploy**（重新部署）
   - 或者等待自动重新部署

2. **等待部署完成**
   - 通常需要 1-3 分钟
   - 查看部署状态变为 "Ready"

### 步骤 5: 验证修复（1 分钟）

1. **查看部署日志**
   - 在部署详情页
   - 点击 **Functions** 标签
   - 查看日志，寻找：
     - `📋 Found X available models` - ✅ 成功！
     - `❌ Authentication error` - ❌ API 密钥仍然无效

2. **测试工具功能**
   - 访问你的网站
   - 打开任意工具页面（如 `/tools/tiktok-title.html`）
   - 填写表单并提交
   - 如果成功生成内容，说明修复成功！

## 🔍 常见问题

### 问题 1: 环境变量已添加但仍然失败

**可能原因**：
- 环境变量没有应用到正确的环境
- 需要重新部署才能生效

**解决方案**：
1. 检查环境变量是否选择了所有环境
2. 手动触发重新部署
3. 等待部署完成后再测试

### 问题 2: API 密钥格式不正确

**正确的格式**：
- 以 `AIza` 开头
- 长度约 39 个字符
- 示例：`AIzaSyCbb54UXn-upfvq33UlavlZO18u1LhMxSM`

**检查方法**：
- 在 Vercel 环境变量中查看 `GOOGLE_API_KEY` 的值
- 确认格式正确

### 问题 3: API 密钥被禁用

**检查方法**：
1. 访问 https://makersuite.google.com/app/apikey
2. 查看 API 密钥状态
3. 如果显示 "Disabled"（已禁用），需要启用或创建新的

### 问题 4: 网络问题

**如果在中国大陆**：
- 可能需要配置代理
- 在 Vercel 环境变量中添加：
  ```
  HTTPS_PROXY=http://your-proxy:port
  ```

## ✅ 验证清单

完成以下所有项：

- [ ] `GOOGLE_API_KEY` 在 Vercel 环境变量中存在
- [ ] `GOOGLE_API_KEY` 的值以 `AIza` 开头
- [ ] `GOOGLE_API_KEY` 不是示例值（如 `your_google_api_key_here`）
- [ ] `AI_PROVIDER` = `google` 已设置
- [ ] 环境变量已应用到所有环境
- [ ] 已重新部署项目
- [ ] 部署日志显示 `📋 Found X available models` 或成功消息
- [ ] 工具功能测试成功

## 🎯 快速测试 API 密钥

如果你想快速测试 API 密钥是否有效，可以使用以下方法：

### 方法 1: 使用 Google AI Studio

1. 访问 https://makersuite.google.com/app/apikey
2. 使用你的 API 密钥
3. 在测试界面尝试生成内容
4. 如果成功，说明 API 密钥有效

### 方法 2: 使用 curl（命令行）

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'
```

**替换 `YOUR_API_KEY` 为你的实际 API 密钥**

如果返回 JSON 响应，说明 API 密钥有效。

## 📞 仍然无法解决？

如果按照以上步骤操作后仍然失败：

1. **检查 Vercel 日志**
   - 查看详细的错误信息
   - 确认是认证错误还是其他错误

2. **验证 API 密钥**
   - 使用上面的测试方法
   - 确认 API 密钥本身是有效的

3. **检查 Google Cloud Console**
   - 访问 https://console.cloud.google.com
   - 确认 Generative Language API 已启用

4. **联系支持**
   - [Google AI Studio 支持](https://makersuite.google.com)
   - [Vercel 支持](https://vercel.com/support)

---

## 🎉 修复成功标志

如果修复成功，你会看到：

- ✅ Vercel 日志显示：`📋 Found X available models`
- ✅ 工具页面可以正常生成内容
- ✅ 没有错误消息

**按照以上步骤操作，通常 5 分钟内就能解决问题！** 🚀

