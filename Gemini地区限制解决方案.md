# 🌍 Gemini API 地区限制解决方案

## ❌ 问题说明

如果你无法使用 Gemini 3 Pro（或其他 Gemini 模型），很可能是因为：

1. **账号地区限制** - Google 账号标注的地址在中国大陆
2. **网络访问限制** - 无法直接访问 Google API 服务器
3. **API 服务限制** - 某些地区可能无法使用某些模型

---

## 🔍 如何确认问题

### 检查 1: 测试 API 连接

在终端运行：

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-3-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

如果返回：
- **403 Forbidden** 或 **404 Not Found** → 可能是地区限制
- **Network Error** → 网络连接问题
- **401 Unauthorized** → API 密钥问题

### 检查 2: 查看错误日志

在 Vercel 日志中查看具体错误：
- `403 Forbidden` → 地区限制
- `404 Not Found` → 模型不可用或地区限制
- `Network Error` → 网络连接问题

---

## ✅ 解决方案

### 方案 1: 使用代理（推荐）⭐

代码已经支持代理配置，只需要设置环境变量即可。

#### 在 Vercel 中配置代理

1. **打开 Vercel Dashboard**
   - 进入你的项目
   - 点击 "Settings" → "Environment Variables"

2. **添加代理环境变量**
   - **Name**: `HTTPS_PROXY`
   - **Value**: `http://your-proxy-server:port`
   - 如果有认证：`http://username:password@proxy-server:port`
   - **Environment**: 选择 "Production" 和 "Preview"

3. **保存并重新部署**
   - 点击 "Save"
   - 重新部署项目

#### 代理服务器选择

**选项 A: 使用云代理服务**
- Cloudflare Workers（推荐）
- AWS Lambda + API Gateway
- 自建 VPS 代理

**选项 B: 使用代理服务商**
- 购买代理服务（如 Bright Data, Smartproxy）
- 使用企业代理

**选项 C: 使用 VPN 服务**
- 如果 Vercel 支持，可以配置 VPN 连接

---

### 方案 2: 更换 Google 账号地区

如果可能，尝试：

1. **创建新的 Google 账号**
   - 使用非中国大陆地址注册
   - 或使用 VPN 注册，选择其他地区

2. **更新现有账号地区**
   - 访问 Google Account Settings
   - 更改账号地区（如果允许）

**注意**: 这种方法可能不总是有效，因为 Google 可能根据 IP 地址判断。

---

### 方案 3: 使用 Vercel Edge Functions（实验性）

Vercel Edge Functions 运行在全球边缘节点，可能可以绕过某些限制。

需要修改代码使用 Edge Functions，这需要一些开发工作。

---

### 方案 4: 使用其他 AI 服务

如果 Gemini 完全无法使用，可以考虑：

1. **OpenAI API**
   - 通常没有地区限制
   - 需要付费，但稳定

2. **Claude API (Anthropic)**
   - 质量高
   - 可能有地区限制

3. **国内 AI 服务**
   - 文心一言
   - 通义千问
   - 需要适配代码

---

## 🛠️ 快速配置代理（详细步骤）

### 步骤 1: 获取代理服务器

如果你有代理服务器，记录：
- 代理地址：`proxy.example.com`
- 端口：`8080`
- 用户名和密码（如果有）

### 步骤 2: 在 Vercel 配置

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 "Settings" → "Environment Variables"
4. 添加以下变量：

```
Name: HTTPS_PROXY
Value: http://proxy.example.com:8080
Environment: Production, Preview, Development
```

如果有认证：
```
Name: HTTPS_PROXY
Value: http://username:password@proxy.example.com:8080
Environment: Production, Preview, Development
```

### 步骤 3: 验证配置

代码会自动检测 `HTTPS_PROXY` 环境变量并使用代理。查看日志应该看到：

```
✅ 代理已配置: http://***@proxy.example.com:8080
```

### 步骤 4: 重新部署

1. 在 Vercel Dashboard 中
2. 点击 "Deployments"
3. 点击最新的部署
4. 点击 "Redeploy"

---

## 📋 代码已支持的功能

你的代码已经支持：

✅ **自动代理检测**
- 自动读取 `HTTPS_PROXY` 或 `HTTP_PROXY` 环境变量
- 自动配置代理 Agent

✅ **多模型回退**
- 如果某个模型不可用，自动尝试其他模型
- 支持多个 API 版本（v1, v1beta）

✅ **详细错误日志**
- 记录所有尝试的模型
- 显示具体错误信息

---

## 🔍 诊断步骤

### 1. 检查当前配置

查看 Vercel 环境变量：
- `GOOGLE_API_KEY` - 是否已设置
- `HTTPS_PROXY` - 是否已配置代理
- `GEMINI_MODEL` - 指定的模型名称

### 2. 查看日志

在 Vercel Dashboard → Deployments → 选择部署 → Functions → 查看日志

查找：
- `✅ 代理已配置` - 确认代理已启用
- `🔄 Trying: gemini-3-pro` - 确认尝试了该模型
- `❌` 或 `⚠️` - 查看具体错误

### 3. 测试 API

使用 curl 测试（需要代理）：

```bash
export HTTPS_PROXY=http://your-proxy:port
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-3-pro:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

---

## 💡 推荐方案

### 最佳方案：配置代理

1. **使用 Cloudflare Workers 作为代理**
   - 免费额度充足
   - 全球边缘节点
   - 配置简单

2. **或使用企业代理服务**
   - 稳定可靠
   - 需要付费

### 临时方案：使用其他模型

如果 gemini-3-pro 不可用，代码会自动尝试：
- gemini-2.5-flash
- gemini-2.5-pro
- gemini-1.5-flash
- 等等

这些模型通常更容易访问。

---

## 📞 需要帮助？

如果仍然无法解决：

1. **检查 Vercel 日志**
   - 查看具体错误信息
   - 确认代理是否生效

2. **测试代理连接**
   - 确认代理服务器可访问
   - 测试代理是否正常工作

3. **联系支持**
   - Vercel 支持
   - 或 Google Cloud 支持

---

## ✅ 完成检查清单

- [ ] 确认错误类型（403/404/Network Error）
- [ ] 检查 Vercel 环境变量配置
- [ ] 配置代理（如果需要）
- [ ] 重新部署项目
- [ ] 查看日志确认代理已启用
- [ ] 测试 API 调用
- [ ] 确认模型可用性

---

**配置代理后，应该可以正常使用 Gemini API 了！** 🚀

