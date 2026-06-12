# DailyPlanner

DailyPlanner 是一个用于记录每日安排的轻量前端网页。它不依赖后端服务，打开网页即可添加、查看和管理当天日程，适合个人日计划、学习安排、生活事项和简单任务记录。

## 功能

- 添加日程：支持选择日期、时间、日程内容和类型。
- 按日期查看：可以切换不同日期查看对应日程。
- 完成状态：每条日程可以标记完成或取消完成。
- 可编辑备注：每条日程下方都有独立备注框，任务完成后仍然可以查看和编辑。
- 数据统计：显示当日全部日程、已完成和待完成数量。
- 本地保存：数据保存在浏览器 `localStorage` 中，刷新页面后仍会保留。
- 响应式布局：适配桌面端和移动端浏览。

## 文件结构

```text
DailyPlanner
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 本地运行

可以直接双击打开 `index.html` 使用。

如果希望通过本地服务预览，可以在项目目录运行：

```powershell
python -m http.server 5173
```

然后在浏览器访问：

```text
http://localhost:5173/
```

## 数据说明

当前项目使用浏览器本地存储保存日程数据：

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
```

这意味着日程数据只保存在当前电脑的当前浏览器里，不会自动同步到 GitHub。GitHub 仓库保存的是网页代码，只有当代码文件发生修改并执行 `git commit`、`git push` 后，仓库内容才会更新。

## 后续可扩展方向

- 增加日程导入和导出功能。
- 增加关键词搜索。
- 增加日历视图。
- 增加云端同步或 GitHub 文件同步。
- 增加深色模式。

## Git 常用命令

修改代码后，可以使用以下命令提交并推送：

```powershell
git add .
git commit -m "更新说明"
git push
```
