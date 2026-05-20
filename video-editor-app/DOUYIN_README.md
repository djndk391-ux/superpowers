# 抖音视频解析功能说明

## 🎉 功能概述

已成功实现抖音短视频无水印解析功能！支持以下两种使用方式：

1. **Python脚本** - 独立的抖音解析工具
2. **TypeScript集成** - 与现有视频编辑项目无缝集成

---

## 📁 新增文件

### 1. Python版本
- `scripts/douyin_parser.py` - 完整的抖音解析Python脚本
- `requirements.txt` - Python依赖包列表

### 2. TypeScript版本（项目集成）
- `api/parsers/douyin-parser.ts` - 抖音解析器
- (已更新) `api/parsers/parser-manager.ts` - 解析器管理器
- (已更新) `api/services/video-parser.ts` - 解析服务
- (已更新) `api/utils/platform-detector.ts` - 平台检测器

---

## 🚀 使用方法

### 方法一：独立Python脚本（推荐快速测试）

#### 1. 安装依赖
```bash
cd /workspace/video-editor-app
pip install -r requirements.txt
```

#### 2. 使用脚本
编辑 `scripts/douyin_parser.py`，修改 `INPUT_URL` 变量：
```python
INPUT_URL = "https://v.douyin.com/你的视频链接/"
```

#### 3. 运行脚本
```bash
python scripts/douyin_parser.py
```

#### 4. 查看结果
- 控制台会输出详细的解析过程和结果
- 解析结果会自动保存为 `douyin_result_xxxxx.json`

---

### 方法二：与现有项目集成（已完成）

抖音解析器已完全集成到你的视频编辑项目中，使用方式和B站解析一样：

1. 确保后端服务运行在端口3002
2. 在前端页面或通过API调用 `/api/download/parse`
3. 输入抖音分享链接（支持短链接）
4. 系统会自动解析并下载无水印视频

---

## 🔧 功能特性

### 已实现的核心功能
1. **✓ 短链还原** - 自动处理 `https://v.douyin.com/xxxxxx/` 短链接
2. **✓ 数据获取** - 通过抖音官方API获取视频详情
3. **✓ 去水印处理** - 自动替换playwm为play，wm=1为wm=0
4. **✓ 信息提取** - 提取标题、封面、背景音乐、作者
5. **✓ 重试机制** - 网络波动自动重试3次
6. **✓ 超时控制** - 请求超时10秒自动中断
7. **✓ 日志输出** - 清晰的INFO/SUCCESS/ERROR日志

### 提取的信息
| 字段 | 说明 |
|------|------|
| title | 视频标题/文案 |
| video_url | 无水印视频直链 |
| cover_url | 高清封面图 |
| music_url | 背景音乐链接 |
| author | 作者昵称 |
| aweme_id | 视频唯一ID |

---

## 💡 使用示例

### 示例1：Python脚本
```python
# 编辑 scripts/douyin_parser.py
INPUT_URL = "https://v.douyin.com/iJkXy1W/"
# 运行: python scripts/douyin_parser.py
```

### 示例2：通过API测试
```bash
# 测试API
curl -X POST http://localhost:3002/api/download/parse \
  -H "Content-Type: application/json" \
  -d '{"url":"https://v.douyin.com/iJkXy1W/"}'
```

---

## 📋 支持的链接格式

### 抖音链接类型
- ✓ 短链接: `https://v.douyin.com/xxxxxx/`
- ✓ 完整链接: `https://www.douyin.com/video/73xxxxx`
- ✓ 笔记链接: `https://www.douyin.com/note/73xxxxx`
- ✓ 带参数的完整分享链接

---

## ⚠️ 注意事项

1. **网络环境** - 确保可以访问抖音API
2. **更新及时** - 抖音API可能更新，如遇问题请告知
3. **合法使用** - 请遵守平台规则，仅用于个人学习研究
4. **API限制** - 短时间内大量请求可能被限流

---

## 🎯 下一步计划（可选）

如有需要，可继续扩展功能：
- [ ] 支持快手、小红书等更多平台
- [ ] 批量解析功能
- [ ] 视频预览功能
- [ ] 一键下载背景音乐

---

## 📞 故障排查

### 问题：解析失败
- 检查链接是否有效
- 查看控制台日志
- 确认网络连接正常

### 问题：无法获取视频
- 确认链接是公开视频
- 尝试刷新重试
- 可能是临时限流

---

**抖音视频解析功能已完成并集成！** 🎊
