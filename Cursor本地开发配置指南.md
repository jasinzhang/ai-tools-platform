# 💻 Cursor 本地开发环境配置指南

## ❌ 问题说明

在 Cursor IDE 中运行项目时，无法使用 Gemini API，通常是因为：
1. **网络限制** - 无法直接访问 Google API 服务器
2. **未配置代理** - 本地开发环境需要配置代理
3. **环境变量未设置** - `.env` 文件中缺少代理配置

---

## ⚡ 快速解决方案（3步）

### 步骤 1: 配置代理到 .env 文件

在项目根目录的 `.env` 文件中添加代理配置：

```env
# 如果你使用 Clash（默认端口 7890）
HTTPS_PROXY=http://127.0.0.1:7890

# 如果你使用 V2Ray（通常是 10808 或 10809）
HTTPS_PROXY=http://127.0.0.1:10808

# 如果你使用其他代理，查看代理软件的HTTP端口
# HTTPS_PROXY=http://127.0.0.1:你的端口
```

### 步骤 2: 确认代理服务正在运行

确保你的代理软件（Clash、V2Ray等）正在运行，并且：
- ✅ 代理服务已启动
- ✅ HTTP 代理端口已开启
- ✅ 可以正常访问 Google 服务

### 步骤 3: 重启开发服务器

在 Cursor 的终端中：

```bash
# 停止当前服务器（如果正在运行）
# 按 Ctrl+C

# 重新启动
npm start
```

启动时，你应该看到：
```
✅ 代理已配置: http://***@127.0.0.1:7890
```

---

## 🔍 如何找到你的代理端口

### Clash
1. 打开 Clash 客户端
2. 查看 "端口" 或 "Port" 设置
3. **HTTP 端口**通常是：`7890`
4. 配置：`HTTPS_PROXY=http://127.0.0.1:7890`

### V2Ray
1. 打开 V2Ray 客户端
2. 查看 "HTTP 代理" 或 "HTTP Proxy" 设置
3. 端口通常是：`10808` 或 `10809`
4. 配置：`HTTPS_PROXY=http://127.0.0.1:10808`

### 其他代理软件
1. 打开代理软件设置
2. 找到 "HTTP 代理" 或 "HTTP Proxy" 配置
3. 查看端口号
4. 使用该端口配置

---

## 📝 完整 .env 文件示例

你的 `.env` 文件应该类似这样：

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# AI Provider
AI_PROVIDER=google
GOOGLE_API_KEY=你的API密钥

# Gemini Model (可选)
GEMINI_MODEL=gemini-2.5-flash

# 代理配置（重要！）
HTTPS_PROXY=http://127.0.0.1:7890
```

**注意**：
- 将 `你的API密钥` 替换为实际的 Google API 密钥
- 将 `7890` 替换为你的实际代理端口

---

## ✅ 验证配置

### 方法 1: 查看启动日志

启动服务器后，查看 Cursor 终端输出，应该看到：
```
✅ 代理已配置: http://***@127.0.0.1:7890
✅ GOOGLE_API_KEY is configured (format looks correct)
🚀 Server running on http://localhost:3000
```

### 方法 2: 测试 AI 功能

1. 在浏览器中访问：http://localhost:3000
2. 点击任意 AI 工具（如 TikTok 标题生成器）
3. 填写表单并点击生成
4. 如果成功生成内容，说明配置成功！

### 方法 3: 测试代理连接

在 Cursor 终端中运行：

```bash
curl -x http://127.0.0.1:7890 https://www.google.com
```

如果能返回内容，说明代理可用。

---

## ⚠️ 常见问题

### Q1: 配置后仍然无法连接？

**检查清单**：
- [ ] 代理服务是否正在运行？
- [ ] 代理端口是否正确？
- [ ] `.env` 文件是否在项目根目录？
- [ ] 是否重启了服务器？

**解决方案**：
1. 确认代理软件正在运行
2. 检查代理端口是否正确
3. 尝试在终端测试代理：
   ```bash
   curl -x http://127.0.0.1:7890 https://www.google.com
   ```
4. 如果测试失败，检查代理软件设置

### Q2: 如何确认代理端口？

**方法 1: 查看代理软件设置**
- 打开代理软件
- 查看 "HTTP 代理" 或 "HTTP Proxy" 设置
- 记录端口号

**方法 2: 查看系统代理设置**
- macOS: 系统设置 → 网络 → 高级 → 代理
- Windows: 设置 → 网络和 Internet → 代理
- 查看 HTTP 代理端口

### Q3: 代理需要用户名密码？

如果你的代理需要认证，使用以下格式：

```env
HTTPS_PROXY=http://username:password@127.0.0.1:7890
```

### Q4: 使用 SOCKS5 代理？

如果只有 SOCKS5 代理，需要转换为 HTTP 代理，或者使用代理转换工具。

---

## 🚀 快速测试脚本

创建一个测试脚本来验证配置：

```bash
# 在 Cursor 终端中运行
node -e "
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(proxyUrl);

axios.get('https://www.google.com', {
  httpsAgent: agent,
  timeout: 5000
}).then(() => {
  console.log('✅ 代理连接成功！');
}).catch(err => {
  console.log('❌ 代理连接失败:', err.message);
});
"
```

---

## 📋 完整配置检查清单

- [ ] 代理软件正在运行
- [ ] 找到代理的 HTTP 端口
- [ ] 在 `.env` 文件中添加 `HTTPS_PROXY`
- [ ] 确认 `.env` 文件中有 `GOOGLE_API_KEY`
- [ ] 重启开发服务器
- [ ] 查看启动日志确认代理已配置
- [ ] 测试 AI 工具功能
- [ ] 确认可以正常生成内容

---

## 💡 提示

1. **使用系统代理**
   - 如果 Cursor 可以访问系统代理，代码会自动使用
   - 但最好在 `.env` 中明确配置

2. **测试代理**
   - 先测试代理是否可用
   - 再配置到项目中

3. **多个代理**
   - 如果使用多个代理，选择最稳定的一个
   - 或者使用代理切换工具

---

## 🎯 下一步

配置完成后：
1. ✅ 重启服务器
2. ✅ 测试 AI 工具
3. ✅ 确认可以正常使用

**配置完成后，在 Cursor 中就可以正常使用 Gemini API 了！** 🎉

