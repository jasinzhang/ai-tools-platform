# ⚡ 快速配置 Cursor 代理（3步完成）

## 🎯 最有效的方法

直接在 Cursor 的配置文件中设置代理，这是最可靠的方法。

---

## 📋 步骤（3分钟完成）

### 步骤 1: 打开 Cursor 设置文件

1. 打开 Cursor
2. 按 `Cmd + Shift + P` (macOS) 或 `Ctrl + Shift + P` (Windows)
3. 输入 `settings json`
4. 选择 `Preferences: Open User Settings (JSON)`

### 步骤 2: 添加代理配置

在打开的 JSON 文件中，添加以下内容：

```json
{
  "http.proxy": "http://127.0.0.1:7897",
  "http.proxySupport": "override",
  "cursor.general.disableHttp2": true
}
```

**注意**：`7897` 是你的 Clash 端口，如果不同请修改。

### 步骤 3: 保存并重启

1. 保存文件（`Cmd + S` 或 `Ctrl + S`）
2. **完全退出 Cursor**（Command+Q）
3. 重新启动 Cursor
4. 测试 AI 功能

---

## ✅ 完成！

配置完成后，Cursor 应该可以正常使用 AI 功能了！

如果还有问题，查看 `Cursor IDE地区限制完整解决方案.md` 了解更多方案。
