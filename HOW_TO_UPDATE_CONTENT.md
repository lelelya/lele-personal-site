# How to update my website content

首页内容保存在 `dist/data/` 中。通常只需要编辑这些 JSON 文件，不需要修改 HTML、CSS 或 JavaScript。

## 修改个人资料和自我介绍

编辑 `dist/data/profile.json`：

- `name`：昵称
- `avatar`：头像或吉祥物图片地址
- `greeting`：头像旁边的多行问候语
- `interests`：个人兴趣列表
- `mood`、`status`、`visits`：个人状态
- `introduction`：首页欢迎标题、介绍文字和签名
- `links`：个人链接；`label` 是显示文字，`url` 是跳转地址

## 更新 currently.exe

编辑 `dist/data/status.json`。每一项包括：

```json
{
  "icon": "▰",
  "label": "learning",
  "value": "C++ / Algorithms",
  "progress": "▣▣▣▣▢▢"
}
```

复制一整项即可增加状态；删除一整项即可移除状态。

## 添加或修改项目

编辑 `dist/data/projects.json`。项目字段包括：

- `icon`：项目左侧的小图标
- `name`：项目名称
- `description`：一句话介绍
- `tags`：标签列表
- `url`：点击项目后打开的地址

## 更新日记和笔记

- `dist/data/diary.json`：首页 Latest Diary 列表
- `dist/data/notes.json`：首页 Notes 列表

新内容建议放在数组最上方，这样它会显示在首页最前面。

## 更新待办事项

编辑 `dist/data/todo.json`：

```json
{ "text": "Learn more about Transformer", "done": false }
```

把 `done` 改为 `true` 可以标记已完成，并保留以后扩展完成状态样式的能力。

## 更新音乐信息

编辑 `dist/data/music.json`，可以修改歌曲名、歌手、封面和显示的播放时间。这个面板目前是展示组件，不会自动播放音频。

## JSON 注意事项

- 字符串必须使用英文双引号。
- 同一数组中的项目之间需要逗号，最后一项后面不要加逗号。
- 链接到站内页面时，以 `/` 开头，例如 `/projects/`。
- 图片放在 `dist/assets/` 后，可写成 `/assets/图片文件名.png`。
- 保存后请通过本地网页服务器预览；直接双击 `index.html` 时，浏览器通常不允许读取 JSON 文件。

页面结构仍在 `dist/index.html`，视觉样式仍在 `dist/assets/site.css`，数据加载和渲染逻辑在 `dist/assets/site.js`。
