# 快速启动指南

## 5分钟快速开始

### 步骤 1: 安装依赖
```bash
npm install
```

### 步骤 2: 配置环境变量
```bash
cp env.example .env
```

编辑 `.env` 文件，至少配置一个AI提供商：

```env
AI_PROVIDER=google
GOOGLE_API_KEY=你的Google_API密钥
PORT=3000
```

### 步骤 3: 获取API密钥（选择一个）

**选项A: Google Gemini（推荐，免费额度）**
1. 访问：https://makersuite.google.com/app/apikey
2. 登录Google账号
3. 点击"Create API Key"
4. 复制密钥到 `.env` 文件

**选项B: OpenAI**
1. 访问：https://platform.openai.com/api-keys
2. 登录并创建API密钥
3. 复制密钥到 `.env` 文件

### 步骤 4: 启动服务器
```bash
npm start
```

### 步骤 5: 访问网站
打开浏览器访问：http://localhost:3000

---

## 测试工具

1. 访问首页，点击任意工具
2. 填写表单并点击生成
3. 查看AI生成的结果

---

## 配置Google AdSense（后续步骤）

1. 访问 https://www.google.com/adsense/
2. 注册并等待审核（通常需要几天）
3. 审核通过后，获取你的发布商ID
4. 在以下文件中替换 `ca-pub-xxxxxxxxxxxxxxxx`：
   - `public/index.html`
   - `public/tools/*.html`

---

## 常见问题

**Q: API调用失败怎么办？**
A: 检查 `.env` 文件中的API密钥是否正确，确保有足够的API额度。

**Q: 端口被占用怎么办？**
A: 修改 `.env` 文件中的 `PORT` 值为其他端口（如3001）。

**Q: 如何查看日志？**
A: 服务器日志会在终端输出，错误信息会显示API调用失败的原因。

---

## 下一步

1. ✅ 测试所有10个工具
2. ✅ 优化UI/UX（根据你的品牌）
3. ✅ 配置域名和SSL
4. ✅ 申请Google AdSense
5. ✅ 开始买量测试

祝你成功！🎉

