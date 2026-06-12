const STORAGE_KEY = "daily-schedule-items";

const form = document.querySelector("#scheduleForm");
const dateInput = document.querySelector("#dateInput");
const timeInput = document.querySelector("#timeInput");
const titleInput = document.querySelector("#titleInput");
const typeInput = document.querySelector("#typeInput");
const filterDate = document.querySelector("#filterDate");
const showTodayBtn = document.querySelector("#showTodayBtn");
const clearDoneBtn = document.querySelector("#clearDoneBtn");
const itemsContainer = document.querySelector("#itemsContainer");
const emptyTemplate = document.querySelector("#emptyTemplate");
const totalCount = document.querySelector("#totalCount");
const doneCount = document.querySelector("#doneCount");
const pendingCount = document.querySelector("#pendingCount");
const weekday = document.querySelector("#weekday");
const todayText = document.querySelector("#todayText");

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = formatDate(new Date());

let schedules = loadSchedules();

function loadSchedules() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
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

function saveSchedules() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
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

function renderSchedules() {
  const selectedDate = filterDate.value || today;
  const filtered = schedules
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  itemsContainer.innerHTML = "";

  if (!filtered.length) {
    itemsContainer.appendChild(emptyTemplate.content.cloneNode(true));
  } else {
    filtered.forEach((item) => {
      itemsContainer.appendChild(createScheduleItem(item));
    });
  }

  const total = filtered.length;
  const done = filtered.filter((item) => item.done).length;
  totalCount.textContent = total;
  doneCount.textContent = done;
  pendingCount.textContent = total - done;
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

function addSchedule(event) {
  event.preventDefault();

  const newItem = {
    id: crypto.randomUUID(),
    date: dateInput.value,
    time: timeInput.value,
    title: titleInput.value.trim(),
    note: "",
    type: typeInput.value,
    done: false,
  };

  schedules.push(newItem);
  saveSchedules();
  filterDate.value = newItem.date;
  form.reset();
  dateInput.value = newItem.date;
  timeInput.value = newItem.time;
  typeInput.value = newItem.type;
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

form.addEventListener("submit", addSchedule);
filterDate.addEventListener("change", renderSchedules);
showTodayBtn.addEventListener("click", () => {
  filterDate.value = today;
  dateInput.value = today;
  renderSchedules();
});
clearDoneBtn.addEventListener("click", clearDone);

initDateInfo();
saveSchedules();
renderSchedules();
