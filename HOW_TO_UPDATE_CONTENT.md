# How to update my website content

本站仍是纯静态 HTML/CSS/JavaScript。个人资料、项目和音乐继续编辑 `dist/data/` 中的 JSON；Diary 和 Study Note 的唯一内容来源改为 `content/` 中的 Markdown。不要手工编辑构建生成的 `dist/data/diary.json`、`dist/data/notes.json` 或文章 HTML。

## 写一篇 Diary 或 Study Note

1. 在 `content/diary/` 或 `content/notes/` 新建 `.md` 文件。文件名会成为链接地址，只能使用小写英文字母、数字和连字符，例如 `my-topic.md`。
2. 在文件开头写 YAML front matter。`type` 必须与所在目录一致；`title`、`date` 必填，`tags` 可留空。

   ```yaml
   ---
   title: 你的文章标题
   date: "2026-09-22"
   type: diary
   tags:
     - AI
     - life
   ---
   ```

3. 在第二个 `---` 之后写正文。支持标题、列表、粗体、斜体、链接、图片、引用、行内代码、围栏代码块和表格。代码块可标 `cpp`、`python`、`ascend-c`；Ascend C 暂按 C++ 语法着色。图片文件放在 `dist/assets/`，正文使用 `/assets/文件名.png` 这样的站内路径。
4. 首次在仓库运行 `npm install`；之后每次新增、修改或删除文章，运行 `npm run build`，再用本地服务器预览 `dist/`。检查无误后再提交和部署。

构建会自动生成独立页面、首页及 Diary/Notes 列表数据，并按日期倒序排列。若目录里没有 Markdown，页面继续显示现有空状态。删除文章后再次构建，会移除对应的生成页。构建报错时先检查提示中的文件名和 front matter，不要直接修改生成文件。

当前部署配置仍直接发布 `dist/`。因此仅 push Markdown 并不会自动更新网站：需要先运行 `npm run build`，把生成的 `dist` 内容一起提交或纳入部署步骤。本站目前没有自动构建的 GitHub 工作流。

## 修改其他内容

- `dist/data/profile.json`：昵称、头像、问候、兴趣、自我介绍和 Profile 链接。`Blogroll↗` 使用 `"action": "blogroll"` 打开空状态弹窗；普通链接使用 `label` 和 `url`。
- `dist/data/projects.json`：只添加真实项目；可填 `icon`、`name`、`description`、`tags` 和实际存在的 `url`。
- `dist/data/music.json`：Now Playing 展示的歌曲、歌手、封面和时间。它目前不播放音频。

Guestbook 仍只有真实空状态；没有接入留言服务或数据库。三个内容窗口中的「＋」是站长写作提示，不是在线编辑器。

JSON 字符串须使用英文双引号；最后一项后面不要加逗号。页面结构在 `dist/index.html`，样式在 `dist/assets/site.css`，浏览器端列表渲染在 `dist/assets/site.js`。
