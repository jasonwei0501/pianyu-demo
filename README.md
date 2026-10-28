# 片语

帮助偶尔剪旅行视频的学生，把零散片段整理成一条有本人感受、可按段修改的短视频初稿。

- [打开网页 Demo](https://jasonwei0501.github.io/pianyu-demo/)
- [产品说明（5页 PDF）](https://jasonwei0501.github.io/pianyu-demo/product.pdf)
- [备用操作演示](https://jasonwei0501.github.io/pianyu-demo/walkthrough.html)

## 试用

1. 点击“用海边示例，试剪一条”，载入6张示例照片。
2. 保留或修改自己的感受，选择语气与时长，生成初稿。
3. 点击时间线中的第6段，修改字幕并保存；尝试锁定、排序和撤销。
4. “演示说明”可以模拟一次生成失败；重试不会丢失输入。
5. 导出当前版本的 WebM、SRT 或编排 JSON，或复制发布文案。

本地预览：在本目录启动任意静态文件服务器。无构建步骤、外部依赖、API Key 或登录要求。为保证浏览器媒体API正常，推荐通过HTTP服务访问，而不是直接双击HTML。

## 演示边界

编排与改写采用本地规则和预置示例，没有连接在线AI模型。自带素材不上传，也不会被模型识别。示例为AI生成图片，以轻微推拉组成视频片段。导出包含当前字幕和顺序，无音乐和旁白；须保持页面在前台，支持取消。浏览器需支持Canvas和MediaRecorder（推荐Chrome/Edge）。

草稿使用当前浏览器的localStorage；自带媒体刷新后需重新选择。JSON仅保存顺序、字幕和文字，不含媒体，也不支持在此Demo内重新导入。

本次方案、实现、素材、文档与视频由AI代理完成。用户提供题目和制作限制，并确认使用剪映剪旅行视频。未进行真人访谈或商业效果验证，未虚构个人经历与调研数据。

## 图片生成记录

工具：内置 imagegen。六张图片均为本次生成；原图保留，网页版本仅进行格式压缩。

共同提示词：竖屏9:16、真实手机旅行随拍、自然阴天光线、低饱和色、没有文字/标志/水印，不做拼贴。

- `tram.webp`：从海边城市电车内部看向阴天的沿海街道，绿色座椅与带雨滴的车窗。
- `coffee.webp`：米色外套的手握着无标志白色外带咖啡杯，咖啡馆窗外是灰蓝海边。
- `sea.webp`：阴天灰蓝海面、木栅栏与沙丘草，不出现日落或阳光束。
- `dog.webp`：奶油色小狗背影沿湿沙滩跑动，阴天，无人物面部。
- `sand.webp`：第一人称俯拍奶油色运动鞋和卷起的深色裤脚，湿沙与薄海浪。
- `dusk.webp`：阴天蓝调时刻的安静海滩、反光湿沙、远处海滨路灯，不出现太阳。

完整提示词结构：photorealistic-natural / vertical sample media / candid handheld phone travel diary / realistic textures / quiet muted colors / no cinematic grading / clear focal point and room for captions at bottom。

## 资料

- [剪映官方 App Store 页面](https://apps.apple.com/cn/app/id1458072671)：核对剪辑、文字、关键帧和多轨道编辑等功能。
- [VivaVideo 官方 Google Play 页面](https://play.google.com/store/apps/details?id=com.quvideo.xiaoying)：产品背景核对；片语为独立概念原型，不代表小影已上线功能。

## 交付文件

`index.html` / `style.css` / `app.js`：完整静态原型。`product.pdf`：产品说明。`walkthrough.mp4`：备用演示。`sample-output.webm`：从Demo真实导出的30秒作品。`preview.jpg`：实际工作台截图。
