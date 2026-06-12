const STORAGE_KEY = "daily-schedule-items";
const THEME_KEY = "daily-schedule-theme";
const TYPE_OPTIONS_KEY = "daily-schedule-type-options";

const form = document.querySelector("#scheduleForm");
const dateInput = document.querySelector("#dateInput");
const timeInput = document.querySelector("#timeInput");
const titleInput = document.querySelector("#titleInput");
const typeInput = document.querySelector("#typeInput");
const typeOptions = document.querySelector("#typeOptions");
const filterDate = document.querySelector("#filterDate");
const showTodayBtn = document.querySelector("#showTodayBtn");
const clearDoneBtn = document.querySelector("#clearDoneBtn");
const themeToggle = document.querySelector("#themeToggle");
const exportBtn = document.querySelector("#exportBtn");
const importBtn = document.querySelector("#importBtn");
const importFile = document.querySelector("#importFile");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const prevMonthBtn = document.querySelector("#prevMonthBtn");
const nextMonthBtn = document.querySelector("#nextMonthBtn");
const itemsContainer = document.querySelector("#itemsContainer");
const emptyTemplate = document.querySelector("#emptyTemplate");
const totalCount = document.querySelector("#totalCount");
const doneCount = document.querySelector("#doneCount");
const pendingCount = document.querySelector("#pendingCount");
const listHint = document.querySelector("#listHint");
const weekday = document.querySelector("#weekday");
const todayText = document.querySelector("#todayText");

const DEFAULT_TYPES = ["工作", "学习", "生活", "健康", "其他"];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = formatDate(new Date());
let selectedMonth = new Date();
let schedules = loadSchedules();
let typeOptionList = loadTypeOptions();

function loadSchedules() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return normalizeSchedules(JSON.parse(saved));
    }
  } catch (error) {
    console.warn("读取本地日程失败，已使用示例数据。", error);
  }

  return [
    {
      id: crypto.randomUUID(),
      date: today,
      time: "09:00",
      title: "整理今天的重点事项",
      note: "列出 3 件最重要的事，优先完成第一件。",
      type: "工作",
      done: false,
    },
    {
      id: crypto.randomUUID(),
      date: today,
      time: "12:30",
      title: "午餐后散步 15 分钟",
      note: "如果天气不好，就在室内走动。",
      type: "健康",
      done: false,
    },
    {
      id: crypto.randomUUID(),
      date: today,
      time: "20:00",
      title: "复盘今天并准备明天计划",
      note: "记录完成情况和明天的第一项任务。",
      type: "生活",
      done: false,
    },
  ];
}

function normalizeSchedules(data) {
  const list = Array.isArray(data) ? data : data?.schedules;
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .filter((item) => item && item.date && item.time && item.title)
    .map((item) => ({
      id: item.id || crypto.randomUUID(),
      date: item.date,
      time: item.time,
      title: item.title,
      note: item.note || "",
      type: (item.type || "其他").trim() || "其他",
      done: Boolean(item.done),
    }));
}

function loadTypeOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(TYPE_OPTIONS_KEY));
    if (Array.isArray(saved) && saved.length) {
      return Array.from(new Set([...DEFAULT_TYPES, ...saved]));
    }
  } catch {
    // 忽略并回退到默认类型
  }
  return [...DEFAULT_TYPES];
}

function saveTypeOptions() {
  localStorage.setItem(TYPE_OPTIONS_KEY, JSON.stringify(typeOptionList));
}

function syncTypeOptions() {
  const fromSchedules = schedules
    .map((item) => (item.type || "").trim())
    .filter(Boolean);
  typeOptionList = Array.from(
    new Set([...DEFAULT_TYPES, ...typeOptionList, ...fromSchedules])
  );
  renderTypeOptions();
  saveTypeOptions();
}

function renderTypeOptions() {
  typeOptions.innerHTML = "";
  typeOptionList.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    typeOptions.appendChild(option);
  });
}

function saveSchedules() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  renderCalendar();
}

function initDateInfo() {
  const now = new Date();
  weekday.textContent = now.toLocaleDateString("zh-CN", { weekday: "long" });
  todayText.textContent = now.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
  });
  dateInput.value = today;
  filterDate.value = today;
  timeInput.value = "09:00";
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "浅色模式" : "深色模式";
  localStorage.setItem(THEME_KEY, theme);
}

function getVisibleSchedules() {
  const selectedDate = filterDate.value || today;
  return schedules
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function renderSchedules() {
  const filtered = getVisibleSchedules();
  itemsContainer.innerHTML = "";
  listHint.textContent = "按时间从早到晚排列";

  if (!filtered.length) {
    itemsContainer.appendChild(emptyTemplate.content.cloneNode(true));
  } else {
    filtered.forEach((item) => {
      itemsContainer.appendChild(createScheduleItem(item));
    });
  }

  const done = filtered.filter((item) => item.done).length;
  totalCount.textContent = filtered.length;
  doneCount.textContent = done;
  pendingCount.textContent = filtered.length - done;
  renderCalendar();
}

function createScheduleItem(item) {
  const wrapper = document.createElement("article");
  wrapper.className = `schedule-item${item.done ? " done" : ""}`;
  wrapper.dataset.id = item.id;

  const time = document.createElement("div");
  time.className = "item-time";
  time.textContent = item.time;

  const content = document.createElement("div");
  const title = document.createElement("p");
  title.className = "item-title";
  title.textContent = item.title;

  const note = document.createElement("p");
  note.className = "note-label";
  note.textContent = "备注";

  const noteEditor = document.createElement("textarea");
  noteEditor.className = "item-note-editor";
  noteEditor.maxLength = 160;
  noteEditor.placeholder = "点击填写备注，例如地点、准备事项或补充说明";
  noteEditor.value = item.note || "";
  noteEditor.addEventListener("input", (event) => updateNote(item.id, event.target.value));

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = item.type;

  content.append(title, note, noteEditor, tag);

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const completeBtn = document.createElement("button");
  completeBtn.className = "small-btn complete-btn";
  completeBtn.textContent = item.done ? "取消完成" : "完成";
  completeBtn.addEventListener("click", () => toggleDone(item.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "small-btn delete-btn";
  deleteBtn.textContent = "删除";
  deleteBtn.addEventListener("click", () => deleteSchedule(item.id));

  actions.append(completeBtn, deleteBtn);
  wrapper.append(time, content, actions);

  return wrapper;
}

function renderCalendar() {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  calendarTitle.textContent = selectedMonth.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });
  calendarGrid.innerHTML = "";

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar-day";

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cell.classList.add("empty");
      cell.disabled = true;
      calendarGrid.appendChild(cell);
      continue;
    }

    const cellDate = formatDate(new Date(year, month, dayNumber));
    const daySchedules = schedules.filter((item) => item.date === cellDate);
    const done = daySchedules.filter((item) => item.done).length;

    if (cellDate === today) cell.classList.add("today");
    if (cellDate === filterDate.value) cell.classList.add("selected");

    cell.innerHTML = `
      <strong>${dayNumber}</strong>
      <span>${daySchedules.length ? `${daySchedules.length} 项` : "无"}</span>
      ${daySchedules.length ? `<small>${done}/${daySchedules.length} 完成</small>` : ""}
    `;
    cell.addEventListener("click", () => selectDateFromCalendar(cellDate));
    calendarGrid.appendChild(cell);
  }
}

function selectDateFromCalendar(date) {
  filterDate.value = date;
  dateInput.value = date;
  selectedMonth = parseDate(date);
  renderSchedules();
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addSchedule(event) {
  event.preventDefault();

  const customType = typeInput.value.trim() || "其他";

  const newItem = {
    id: crypto.randomUUID(),
    date: dateInput.value,
    time: timeInput.value,
    title: titleInput.value.trim(),
    note: "",
    type: customType,
    done: false,
  };

  schedules.push(newItem);
  if (!typeOptionList.includes(customType)) {
    typeOptionList.push(customType);
    renderTypeOptions();
    saveTypeOptions();
  }
  saveSchedules();
  filterDate.value = newItem.date;
  selectedMonth = parseDate(newItem.date);
  form.reset();
  dateInput.value = newItem.date;
  timeInput.value = newItem.time;
  typeInput.value = customType;
  titleInput.focus();
  renderSchedules();
}

function toggleDone(id) {
  schedules = schedules.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  saveSchedules();
  renderSchedules();
}

function updateNote(id, note) {
  schedules = schedules.map((item) =>
    item.id === id ? { ...item, note } : item
  );
  saveSchedules();
}

function deleteSchedule(id) {
  schedules = schedules.filter((item) => item.id !== id);
  saveSchedules();
  renderSchedules();
}

function clearDone() {
  const selectedDate = filterDate.value || today;
  schedules = schedules.filter((item) => item.date !== selectedDate || !item.done);
  saveSchedules();
  renderSchedules();
}

function exportSchedules() {
  const payload = {
    app: "DailyPlanner",
    version: 1,
    exportedAt: new Date().toISOString(),
    schedules,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dailyplanner-${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importSchedules(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = normalizeSchedules(JSON.parse(reader.result));
      if (!imported.length) {
        alert("导入文件中没有可用日程。");
        return;
      }

      const shouldReplace = confirm("是否用导入文件替换当前所有日程？选择“取消”则会合并导入。");
      schedules = shouldReplace ? imported : mergeSchedules(schedules, imported);
      syncTypeOptions();
      saveSchedules();
      renderSchedules();
      alert("日程导入完成。");
    } catch (error) {
      console.error(error);
      alert("导入失败，请确认文件是有效的 JSON 日程文件。");
    } finally {
      importFile.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function mergeSchedules(current, incoming) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

form.addEventListener("submit", addSchedule);
filterDate.addEventListener("change", () => {
  selectedMonth = parseDate(filterDate.value || today);
  renderSchedules();
});
showTodayBtn.addEventListener("click", () => {
  filterDate.value = today;
  dateInput.value = today;
  selectedMonth = new Date();
  renderSchedules();
});
clearDoneBtn.addEventListener("click", clearDone);
themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});
exportBtn.addEventListener("click", exportSchedules);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) importSchedules(file);
});
prevMonthBtn.addEventListener("click", () => {
  selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  selectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
  renderCalendar();
});

initDateInfo();
initTheme();
syncTypeOptions();
saveSchedules();
renderSchedules();
