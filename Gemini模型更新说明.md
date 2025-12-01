# 🔧 Gemini API 模型更新说明

## ❌ 错误信息

```
Error: Gemini API error (404): {"code":404,"message":"models/gemini-pro is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.","status":"NOT_FOUND"}
```

## 🔍 问题原因

1. **模型已弃用**: `gemini-pro` 模型在 v1beta API 版本中已不再可用
2. **API 版本过旧**: 使用了 `/v1beta` 而不是 `/v1`
3. **模型名称变更**: Google 更新了模型命名规范

## ✅ 修复内容

### 1. 更新 API 版本和模型名称

**之前**:
```javascript
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.googleApiKey}`;
```

**现在**:
```javascript
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.googleApiKey}`;
```

### 2. 支持的模型

现在支持以下 Gemini 模型：

- **gemini-1.5-flash** (默认)
  - 更快响应速度
  - 更经济实惠
  - 适合大多数用例

- **gemini-1.5-pro**
  - 更强的能力
  - 更准确的响应
  - 适合复杂任务

### 3. 配置模型

#### 在 Vercel 环境变量中配置

1. 打开 Vercel Dashboard → 项目 → Settings → Environment Variables
2. 添加环境变量：
   - **Name**: `GEMINI_MODEL`
   - **Value**: `gemini-1.5-flash` 或 `gemini-1.5-pro`
   - **Environment**: 所有环境

#### 在本地 .env 文件中配置

```env
GEMINI_MODEL=gemini-1.5-flash
```

如果不配置，默认使用 `gemini-1.5-flash`。

## 📋 更新后的环境变量清单

### 必需的环境变量

- [ ] `AI_PROVIDER` = `google`
- [ ] `GOOGLE_API_KEY` = 你的 API 密钥

### 可选的环境变量

- [ ] `GEMINI_MODEL` = `gemini-1.5-flash` (默认) 或 `gemini-1.5-pro`
- [ ] `NODE_ENV` = `production`

## 🚀 部署步骤

### 1. 提交代码更改

代码已经更新，使用最新的 Gemini API。

### 2. 更新 Vercel 环境变量（可选）

如果你想使用 `gemini-1.5-pro` 而不是默认的 `gemini-1.5-flash`：

1. 打开 Vercel Dashboard
2. 进入项目 Settings → Environment Variables
3. 添加 `GEMINI_MODEL` = `gemini-1.5-pro`（如果需要）
4. 重新部署

### 3. 测试

部署完成后，测试工具功能：
- 访问任意工具页面
- 提交一个请求
- 确认功能正常工作

## 🔄 模型选择建议

### 使用 gemini-1.5-flash（默认，推荐）

**适合**:
- 大多数内容生成任务
- 需要快速响应
- 成本敏感的场景
- 社交媒体内容生成（标题、描述等）

### 使用 gemini-1.5-pro

**适合**:
- 复杂的文本处理
- 需要更高准确性的任务
- 长文本生成
- 专业内容创作

## 📝 技术细节

### API 版本变更

- **旧版本**: `/v1beta/models/gemini-pro`
- **新版本**: `/v1/models/gemini-1.5-flash` 或 `/v1/models/gemini-1.5-pro`

### 模型对比

| 特性 | gemini-1.5-flash | gemini-1.5-pro |
|------|------------------|----------------|
| 速度 | 快 | 较慢 |
| 成本 | 低 | 较高 |
| 能力 | 良好 | 优秀 |
| 推荐场景 | 大多数用例 | 复杂任务 |

## ✅ 验证修复

部署后，测试以下内容：

1. **API 健康检查**
   ```
   GET /api/health
   ```
   应该返回正常状态

2. **工具功能测试**
   - 访问 `/tools/tiktok-title.html`
   - 填写表单并提交
   - 确认可以正常生成内容

3. **检查日志**
   - 查看 Vercel 函数日志
   - 确认没有 404 错误
   - 确认 API 调用成功

## 🎯 总结

- ✅ 已更新到最新的 Gemini API (v1)
- ✅ 使用最新的模型名称 (gemini-1.5-flash)
- ✅ 支持通过环境变量配置模型
- ✅ 向后兼容，默认使用推荐的模型

**修复已完成！重新部署后即可使用。** 🚀

