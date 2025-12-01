# AI Tools Platform - Free Content Creation Tools

一个专为买量变现优化的AI工具聚合平台，包含10个核心工具，适用于TikTok、Facebook等社交媒体平台的流量投放。

## 🎯 项目特点

- ✅ **10个核心工具**：覆盖社交媒体、文案处理、图片、创意、实用工具
- ✅ **AI驱动**：使用Google Gemini或OpenAI自动生成内容
- ✅ **Google AdSense集成**：已预留广告位，待审核通过后即可变现
- ✅ **移动端优化**：完美适配手机端，提高转化率
- ✅ **SEO友好**：优化了元标签和页面结构
- ✅ **现代化设计**：简洁美观的UI/UX

## 🛠️ 包含的工具

### 社交媒体工具 (3个)
1. **TikTok标题生成器** - 生成病毒式传播的视频标题
2. **Instagram文案生成器** - 创建带标签的Instagram帖子
3. **YouTube标题/描述生成器** - SEO友好的YouTube内容

### 文案处理工具 (2个)
4. **文案改写器** - 不同语气和风格的文本改写
5. **文章摘要生成器** - 长文本快速摘要

### 图片工具 (1个)
6. **二维码生成器** - 自定义QR码生成

### 创意工具 (2个)
7. **产品名称生成器** - AI生成产品名称创意
8. **用户名生成器** - 创建独特的用户名

### 实用工具 (2个)
9. **密码生成器** - 强密码生成
10. **配色方案生成器** - 设计配色方案

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置AI提供商：

```env
# 选择AI提供商 (google 或 openai)
AI_PROVIDER=google

# Google Gemini API (推荐 - 有免费额度)
GOOGLE_API_KEY=your_google_api_key_here

# 或使用 OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# 服务器端口
PORT=3000
```

### 3. 获取AI API密钥

#### Google Gemini (推荐)
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录Google账号
3. 创建API密钥
4. 将密钥填入 `.env` 文件的 `GOOGLE_API_KEY`

#### OpenAI (可选)
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册并创建API密钥
3. 将密钥填入 `.env` 文件的 `OPENAI_API_KEY`

### 4. 启动服务器

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

访问 `http://localhost:3000` 查看网站。

## 📁 项目结构

```
ai-tools-platform/
├── server.js                 # Express服务器主文件
├── package.json              # 项目配置和依赖
├── env.example               # 环境变量示例
├── public/                   # 静态文件目录
│   ├── index.html            # 首页
│   ├── css/
│   │   └── style.css         # 主样式文件
│   ├── js/
│   │   └── main.js           # 前端脚本
│   └── tools/                # 工具页面目录
│       ├── tiktok-title.html
│       ├── instagram-caption.html
│       ├── youtube-title.html
│       ├── text-rewriter.html
│       ├── text-summarizer.html
│       ├── qr-generator.html
│       ├── product-name.html
│       ├── username-generator.html
│       ├── password-generator.html
│       └── color-palette.html
└── src/                      # 源代码目录
    ├── routes/
    │   └── api.js            # API路由
    └── services/             # 服务层
        ├── aiService.js      # AI服务
        ├── qrService.js      # QR码服务
        └── colorService.js   # 配色服务
```

## 💰 配置Google AdSense

1. 访问 [Google AdSense](https://www.google.com/adsense/)
2. 申请并等待审核通过
3. 获取你的发布商ID（格式：`ca-pub-xxxxxxxxxxxxxxxx`）
4. 在以下文件中替换占位符：
   - `public/index.html`
   - `public/tools/*.html`
   
   将所有 `ca-pub-xxxxxxxxxxxxxxxx` 替换为你的实际发布商ID

## 🎨 自定义配置

### 修改工具
在 `src/routes/api.js` 中添加新的API端点，然后在 `public/tools/` 创建对应的HTML页面。

### 修改样式
编辑 `public/css/style.css` 自定义颜色、字体等。

### 添加新的AI提示词
在 `src/services/aiService.js` 中修改各工具的AI提示词模板。

## 📊 买量投放建议

### 测试阶段
1. 小预算测试（$50-100）
2. 测试不同工具页面的转化率
3. 找到ROI最高的工具

### 优化方向
- **落地页**：确保移动端体验流畅
- **加载速度**：优化图片和资源大小
- **用户引导**：清晰的工具使用说明

### 内容策略
- **TikTok投放**：重点推广TikTok标题生成器
- **Facebook投放**：推广Instagram文案生成器和YouTube工具
- **Instagram投放**：推广Instagram文案生成器

## ⚠️ 注意事项

1. **API限制**：注意AI API的使用限制和费用
2. **内容质量**：确保AI生成的内容质量
3. **用户体验**：广告不要过度影响使用体验
4. **合规性**：遵守Google AdSense政策

## 🔧 技术栈

- **后端**：Node.js + Express
- **前端**：原生HTML/CSS/JavaScript
- **AI**：Google Gemini / OpenAI
- **广告**：Google AdSense
- **图片处理**：qr-image, sharp

## 📈 后续扩展

- 扩展到20-30个工具
- 添加用户账户系统
- 实现高级功能付费解锁
- 添加数据分析仪表板
- 支持多语言

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**开始你的买量变现之旅！** 🚀