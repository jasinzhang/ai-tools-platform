# 🔄 Gemini API 模型自动回退机制

## ❌ 问题

```
Error: Gemini API error (404): {"code":404,"message":"models/gemini-1.5-flash is not found for API version v1, or is not supported for generateContent.","status":"NOT_FOUND"}
```

## ✅ 解决方案

已实现**自动模型回退机制**，代码会自动尝试多个模型，直到找到一个可用的。

### 工作原理

1. **按顺序尝试多个模型**：
   - 首先尝试用户指定的模型（如果设置了 `GEMINI_MODEL`）
   - 然后尝试 `gemini-1.5-flash-latest`
   - 然后尝试 `gemini-1.5-pro-latest`
   - 然后尝试 `gemini-1.5-flash`
   - 然后尝试 `gemini-1.5-pro`
   - 最后尝试 `gemini-pro`（原始模型）

2. **自动处理 404 错误**：
   - 如果某个模型返回 404（不存在），自动尝试下一个
   - 只有所有模型都失败时才抛出错误

3. **使用 v1beta API**：
   - 所有模型都使用 `/v1beta` API 版本
   - 这个版本更稳定，支持更多模型

## 🎯 优势

- ✅ **自动适配**：无需手动配置，自动找到可用的模型
- ✅ **容错性强**：即使某个模型不可用，也能正常工作
- ✅ **向后兼容**：支持旧模型名称
- ✅ **向前兼容**：支持新模型名称

## 📋 配置（可选）

### 在 Vercel 环境变量中

如果你想指定特定的模型，可以在 Vercel 中添加：

1. 打开 Vercel Dashboard → 项目 → Settings → Environment Variables
2. 添加环境变量：
   - **Name**: `GEMINI_MODEL`
   - **Value**: 选择以下之一：
     - `gemini-1.5-flash-latest`（推荐，快速）
     - `gemini-1.5-pro-latest`（更强能力）
     - `gemini-pro`（原始模型）
   - **Environment**: 所有环境

### 在本地 .env 文件中

```env
GEMINI_MODEL=gemini-1.5-flash-latest
```

**注意**：如果不配置，系统会自动尝试所有模型，通常第一个就会成功。

## 🔍 如何查看使用的模型

代码会在控制台输出使用的模型：

```
✅ Successfully used Gemini model: gemini-1.5-flash-latest
```

在 Vercel 函数日志中可以看到这个信息。

## 📝 模型说明

### gemini-1.5-flash-latest（推荐）

- ✅ 最快响应速度
- ✅ 最经济实惠
- ✅ 适合大多数内容生成任务
- ✅ 自动使用最新版本

### gemini-1.5-pro-latest

- ✅ 更强的能力
- ✅ 更准确的响应
- ✅ 适合复杂任务
- ✅ 自动使用最新版本

### gemini-pro（回退）

- ✅ 原始模型
- ✅ 向后兼容
- ✅ 如果新模型不可用时的备选

## 🚀 部署

代码已更新，包含自动回退机制。只需：

1. **提交并推送代码**（已完成）
2. **等待 Vercel 自动部署**
3. **测试工具功能**

无需额外配置！

## ✅ 验证

部署完成后，测试：

1. **访问工具页面**
   - 例如：`/tools/tiktok-title.html`

2. **提交请求**
   - 填写表单并提交

3. **检查功能**
   - 确认可以正常生成内容
   - 不再出现 404 错误

4. **查看日志**（可选）
   - 在 Vercel 函数日志中查看使用的模型

## 🎉 总结

- ✅ 自动尝试多个模型
- ✅ 自动处理 404 错误
- ✅ 无需手动配置
- ✅ 向后兼容
- ✅ 向前兼容

**修复已完成！系统现在会自动找到可用的模型。** 🚀

