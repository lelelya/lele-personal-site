# How to update my website content

首页内容保存在 `dist/data/` 中。通常只需要编辑这些 JSON 文件，不需要修改 HTML、CSS 或 JavaScript。

## 修改个人资料和自我介绍

编辑 `dist/data/profile.json`：

- `name`：昵称
- `avatar`：头像或吉祥物图片地址
- `greeting`：头像旁边的多行问候语
- `interests`：个人兴趣列表
- `introduction`：首页欢迎标题、介绍文字和签名
- `links`：Profile 的按钮或链接。当前 `Blogroll↗` 使用 `"action": "blogroll"` 打开空状态弹窗；普通链接使用 `label`（显示文字）和 `url`（跳转地址）

## 添加或修改项目

编辑 `dist/data/projects.json`。目前它是空数组 `[]`。只添加你确认要公开的真实项目。项目字段包括：

- `icon`：项目左侧的小图标
- `name`：项目名称
- `description`：一句话介绍
- `tags`：标签列表
- `url`：可选；只填写真实存在的项目页面地址

## 更新日记和笔记

- `dist/data/diary.json`：首页 Latest Diary 列表；条目可包含 `date`、`title`、`url`，真实点赞数才填写 `likes`
- `dist/data/notes.json`：首页和 Notes 页面列表；条目包含 `category`、`file`、`date`，有实际文章页面时再填写 `url`

这两个文件也以 `[]` 开始。新内容建议放在数组最上方，这样会显示在首页最前面。Notes 页面与首页读取同一份数据；添加列表项之前，应先创建对应的真实文章页面。

三个内容窗口里的「＋」会说明应修改哪个 JSON 文件；它不是在线编辑器，不会保存内容。

## 更新音乐信息

编辑 `dist/data/music.json`，可以修改歌曲名、歌手、封面和显示的播放时间。这个面板目前是展示组件，不会自动播放音频。

## Guestbook

留言板目前只有空状态，留言按钮明确标记为未开放。站点尚未接入留言服务或数据库，不能接收或显示访客留言。

## JSON 注意事项

- 字符串必须使用英文双引号。
- 同一数组中的项目之间需要逗号，最后一项后面不要加逗号。
- 链接到站内页面时，以 `/` 开头，例如 `/projects/`。
- 图片放在 `dist/assets/` 后，可写成 `/assets/图片文件名.png`。
- 保存后请通过本地网页服务器预览；直接双击 `index.html` 时，浏览器通常不允许读取 JSON 文件。

页面结构仍在 `dist/index.html`，视觉样式仍在 `dist/assets/site.css`，数据加载和渲染逻辑在 `dist/assets/site.js`。
