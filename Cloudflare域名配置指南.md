# 🌐 Cloudflare 域名配置 Vercel 完整指南

## 📋 概述

你已经通过 Cloudflare 申请了域名，现在需要将域名指向 Vercel 部署的网站。由于 Cloudflare 有自己的 DNS 和代理服务，配置需要特别处理。

---

## 🎯 快速配置步骤（推荐方案）

### 方案 1: 使用 Cloudflare DNS + 手动添加记录（推荐）⭐

这是最灵活且推荐的方式，你可以继续使用 Cloudflare 的 CDN 和安全功能。

#### 步骤 1: 在 Vercel 添加域名（5分钟）

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com/dashboard
   - 选择你的项目

2. **进入域名设置**
   - 点击顶部菜单 **Settings**（设置）
   - 在左侧菜单找到 **Domains**（域名）
   - 点击进入

3. **添加域名**
   - 点击 **Add Domain** 按钮
   - 输入你的域名（例如：`yourdomain.com`）
   - 点击 **Add**
   - **同时添加 www 子域名**（例如：`www.yourdomain.com`）

4. **查看 DNS 配置要求**
   - 添加域名后，Vercel 会显示需要配置的 DNS 记录
   - **保留这个页面**，下一步需要用到

#### 步骤 2: 在 Cloudflare 配置 DNS 记录（10分钟）

1. **登录 Cloudflare**
   - 访问 https://dash.cloudflare.com
   - 登录你的账号

2. **选择域名**
   - 在域名列表中，点击你刚申请的域名

3. **进入 DNS 设置**
   - 点击左侧菜单的 **DNS** → **Records**

4. **配置根域名（yourdomain.com）**

   有两种方式，选择其中一种：

   **方式 A: 使用 A 记录（推荐）**

   添加以下 A 记录：
   ```
   类型: A
   名称: @
   IPv4 地址: 76.76.21.21
   代理状态: DNS only (灰色云朵，不通过 Cloudflare 代理)
   TTL: Auto
   
   类型: A
   名称: @
   IPv4 地址: 76.223.126.88
   代理状态: DNS only (灰色云朵，不通过 Cloudflare 代理)
   TTL: Auto
   ```

   ⚠️ **重要**: 必须将代理状态设置为 **DNS only**（灰色云朵☁️），不要启用代理（橙色云朵☁️），否则 Vercel 的 SSL 证书可能无法正确签发。

   **方式 B: 使用 CNAME（如果支持）**
   ```
   类型: CNAME
   名称: @
   目标: cname.vercel-dns.com
   代理状态: DNS only (灰色云朵)
   TTL: Auto
   ```
   
   ⚠️ 注意：某些域名注册商不支持根域名使用 CNAME，建议使用方式 A。

5. **配置 www 子域名**
   ```
   类型: CNAME
   名称: www
   目标: cname.vercel-dns.com
   代理状态: DNS only (灰色云朵)
   TTL: Auto
   ```

6. **删除或检查冲突记录**
   - 检查是否有其他冲突的 A 记录或 CNAME 记录
   - 如果有，删除或修改它们

7. **保存**
   - 点击 **Save** 保存所有更改

#### 步骤 3: 验证配置（等待生效）

1. **等待 DNS 传播**
   - DNS 更改通常需要几分钟到几小时生效
   - Cloudflare 的 DNS 通常比较快，5-15 分钟即可

2. **在 Vercel 查看状态**
   - 回到 Vercel Dashboard → Settings → Domains
   - 查看域名状态：
     - ✅ **Valid Configuration**: DNS 配置正确，已生效
     - ⏳ **Pending**: 等待 DNS 生效
     - ❌ **Invalid Configuration**: 需要检查 DNS 配置

3. **检查 SSL 证书**
   - Vercel 会自动为你的域名申请 SSL 证书
   - 通常需要几分钟到几小时
   - 证书状态会显示在域名设置页面

#### 步骤 4: 测试访问

1. **访问根域名**
   ```
   https://yourdomain.com
   ```
   应该正常加载你的网站

2. **访问 www 子域名**
   ```
   https://www.yourdomain.com
   ```
   应该正常加载（Vercel 通常会自动重定向到根域名）

3. **检查 HTTPS**
   - 确认地址栏显示 🔒
   - 确认 URL 以 `https://` 开头

---

## 🔄 方案 2: 使用 Cloudflare 代理（不推荐，但可选）

如果你想使用 Cloudflare 的 CDN 和安全功能，可以这样配置：

1. **在 Cloudflare DNS 中启用代理**（橙色云朵☁️）
2. **配置 SSL/TLS 模式**
   - 进入 **SSL/TLS** → **Overview**
   - 设置为 **Full** 或 **Full (strict)**
   - 这会确保 Cloudflare 和 Vercel 之间的连接是加密的

⚠️ **注意**: 
- 使用 Cloudflare 代理可能会影响 Vercel 的自动 SSL 证书签发
- 可能需要额外配置 Cloudflare 的 SSL 设置
- 如果遇到问题，建议使用方案 1（DNS only）

---

## 🎨 代理状态说明

在 Cloudflare DNS 记录中，你会看到云朵图标：

- **灰色云朵 ☁️ (DNS only)**: 
  - ✅ 推荐用于 Vercel
  - ✅ 直接解析到 Vercel 的 IP
  - ✅ Vercel 的 SSL 证书正常工作
  - ❌ 不使用 Cloudflare CDN

- **橙色云朵 ☁️ (Proxied)**:
  - ✅ 使用 Cloudflare CDN 和安全功能
  - ⚠️ 可能影响 Vercel SSL 证书
  - ⚠️ 需要配置 Cloudflare SSL 设置

---

## 📋 完整配置清单

### Vercel 配置
- [ ] 在 Vercel 添加根域名（yourdomain.com）
- [ ] 在 Vercel 添加 www 子域名（www.yourdomain.com）
- [ ] 记录 Vercel 提供的 DNS 配置要求

### Cloudflare DNS 配置
- [ ] 登录 Cloudflare Dashboard
- [ ] 选择域名
- [ ] 进入 DNS → Records
- [ ] 添加 A 记录（根域名）- 使用 DNS only
- [ ] 添加 CNAME 记录（www）- 使用 DNS only
- [ ] 保存更改

### 验证和测试
- [ ] 等待 DNS 生效（5-15 分钟）
- [ ] 在 Vercel 查看域名状态为 "Valid Configuration"
- [ ] 检查 SSL 证书状态
- [ ] 测试访问 https://yourdomain.com
- [ ] 测试访问 https://www.yourdomain.com
- [ ] 确认 HTTPS 正常工作
- [ ] 测试网站功能正常

---

## ⚠️ 常见问题

### 问题 1: DNS 配置后仍然无法访问

**解决方案**:
1. 确认 Cloudflare DNS 记录中的代理状态是 **DNS only**（灰色云朵）
2. 等待 15-30 分钟让 DNS 完全生效
3. 使用在线工具检查 DNS 解析：
   - https://dnschecker.org
   - https://www.whatsmydns.net
4. 清除本地 DNS 缓存：
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### 问题 2: SSL 证书错误或无法签发

**解决方案**:
1. 确认 Cloudflare DNS 记录设置为 **DNS only**（灰色云朵）
2. 等待 DNS 完全生效
3. 在 Vercel 中重新验证域名
4. 检查是否有冲突的 DNS 记录
5. 如果使用 Cloudflare 代理，设置 SSL/TLS 模式为 **Full**

### 问题 3: 网站访问慢

**解决方案**:
1. Vercel 本身提供全球 CDN，通常不需要 Cloudflare 代理
2. 如果确实需要 Cloudflare CDN，确保 SSL/TLS 模式正确设置
3. 检查 Cloudflare 缓存设置

### 问题 4: www 和根域名都要工作

**解决方案**:
1. 在 Vercel 中同时添加两个域名
2. Vercel 默认会处理重定向
3. 可以在 Vercel 域名设置中配置重定向规则

---

## 🔍 DNS 记录验证

配置完成后，可以使用以下命令验证 DNS 记录：

```bash
# 检查根域名 A 记录
dig yourdomain.com +short

# 应该返回类似：
# 76.76.21.21
# 76.223.126.88

# 检查 www CNAME 记录
dig www.yourdomain.com +short

# 应该返回类似：
# cname.vercel-dns.com.
```

---

## 💡 最佳实践建议

1. **使用 DNS only**: 对于 Vercel 部署，建议使用 Cloudflare 的 DNS only 模式，让 Vercel 处理 CDN 和 SSL

2. **同时配置根域名和 www**: 
   - 在 Vercel 中添加两个域名
   - 在 Cloudflare 中配置对应的 DNS 记录

3. **等待完全生效**: DNS 更改需要时间传播，给系统 15-30 分钟时间

4. **测试所有功能**: 配置完成后，全面测试网站功能，确保一切正常

---

## 🎯 快速参考：Cloudflare DNS 记录配置

### 根域名配置
```
类型: A
名称: @
IPv4: 76.76.21.21
代理: DNS only (灰色☁️)
TTL: Auto

类型: A
名称: @
IPv4: 76.223.126.88
代理: DNS only (灰色☁️)
TTL: Auto
```

### www 子域名配置
```
类型: CNAME
名称: www
目标: cname.vercel-dns.com
代理: DNS only (灰色☁️)
TTL: Auto
```

---

## 📞 需要帮助？

如果在配置过程中遇到问题：

1. **检查 Vercel 域名状态页面** - 通常会有具体的错误提示
2. **查看 Cloudflare DNS 日志** - 可以查看 DNS 查询情况
3. **使用在线 DNS 检查工具** - 验证 DNS 是否正确解析
4. **查看 Vercel 官方文档** - https://vercel.com/docs/concepts/projects/domains

---

## ✅ 配置完成检查表

配置完成后，确保以下项目都已完成：

- [x] Vercel 中添加了域名
- [x] Cloudflare 中配置了 DNS 记录
- [x] DNS 记录设置为 DNS only（灰色云朵）
- [x] 等待 DNS 生效（15-30 分钟）
- [x] Vercel 中域名状态显示 "Valid Configuration"
- [x] SSL 证书已签发
- [x] 可以通过 https://yourdomain.com 访问网站
- [x] 可以通过 https://www.yourdomain.com 访问网站
- [x] 网站功能测试正常

---

**配置完成后，你的网站就可以通过自定义域名访问了！** 🎉

