// Fully Enhanced script.js for Kanban App

const themeSwitcher = document.getElementById("themeSwitcher");
const body = document.documentElement;
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.querySelector(".close-modal");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskStatus = document.getElementById("taskStatus");
const subtasksContainer = document.getElementById("subtasksContainer");
const addSubtaskBtn = document.getElementById("addSubtask");
const boardContainer = document.querySelector(".board");
const boardHeader = document.querySelector("header h1");
const newBoardBtn = document.getElementById("createBoard");

let sidebarItems = document.querySelectorAll(".boards ul");
let currentBoard = localStorage.getItem("kanbanCurrentBoard") || "Platform Launch";

let boards = JSON.parse(localStorage.getItem("kanbanBoards")) || {
  "Platform Launch": { columns: { "To Do": [], "Doing": [], "Done": [] } },
  "Marketing Plan": { columns: { "To Do": [], "Doing": [], "Done": [] } },
  "Roadmap": { columns: { "To Do": [], "Doing": [], "Done": [] } },
};

// Theme Toggle
if (localStorage.getItem("theme") === "light") {
  themeSwitcher.checked = true;
  body.setAttribute("data-theme", "light");
}

themeSwitcher.addEventListener("change", () => {
  if (themeSwitcher.checked) {
    body.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  } else {
    body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});

// Render Sidebar
function renderSidebar() {
  const ul = document.querySelector(".boards ul");
  ul.innerHTML = "";
  Object.keys(boards).forEach(boardName => {
    const li = document.createElement("li");
    li.textContent = boardName;
    if (boardName === currentBoard) li.classList.add("active");
    li.addEventListener("click", () => {
      currentBoard = boardName;
      localStorage.setItem("kanbanCurrentBoard", currentBoard);
      renderSidebar();
      renderBoard();
    });
    ul.appendChild(li);
  });
}

// Create New Board
newBoardBtn.addEventListener("click", () => {
  const name = prompt("Enter board name:");
  if (name && !boards[name]) {
    boards[name] = { columns: { "To Do": [], "Doing": [], "Done": [] } };
    currentBoard = name;
    localStorage.setItem("kanbanCurrentBoard", currentBoard);
    localStorage.setItem("kanbanBoards", JSON.stringify(boards));
    renderSidebar();
    renderBoard();
  }
});

// Modal Functions
addTaskBtn.addEventListener("click", () => {
  taskForm.reset();
  subtasksContainer.innerHTML = "";
  taskStatus.innerHTML = "";
  Object.keys(boards[currentBoard].columns).forEach(col => {
    const option = document.createElement("option");
    option.value = col;
    option.textContent = col;
    taskStatus.appendChild(option);
  });
  addSubtaskField();
  taskModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  taskModal.classList.add("hidden");
});

addSubtaskBtn.addEventListener("click", addSubtaskField);

function addSubtaskField(value = "") {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Subtask";
  input.value = value;
  subtasksContainer.appendChild(input);
}

let editMode = false;
let editingTask = null;

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const subtasks = Array.from(subtasksContainer.querySelectorAll("input"))
    .map(input => input.value.trim())
    .filter(val => val)
    .map(title => ({ title, completed: false }));

  const task = {
    id: editMode && editingTask ? editingTask.id : Date.now(),
    title: taskTitle.value,
    description: taskDescription.value,
    subtasks
  };

  const status = taskStatus.value;
  const cols = boards[currentBoard].columns;

  if (editMode && editingTask) {
    Object.keys(cols).forEach(col => {
      cols[col] = cols[col].filter(t => t.id !== editingTask.id);
    });
    editMode = false;
    editingTask = null;
  }

  cols[status].push(task);
  localStorage.setItem("kanbanBoards", JSON.stringify(boards));
  renderBoard();
  taskModal.classList.add("hidden");
});

function renderBoard() {
  boardHeader.textContent = currentBoard;
  boardContainer.innerHTML = "";
  const cols = boards[currentBoard].columns;

  Object.keys(cols).forEach(col => {
    const column = document.createElement("div");
    column.className = "column";
    const h2 = document.createElement("h2");
    h2.innerHTML = `
      ${col.toUpperCase()} (${cols[col].length})
      <button onclick="renameColumn('${col}')">✏️</button>
      <button onclick="deleteColumn('${col}')">❌</button>
    `;
    column.appendChild(h2);

    const list = document.createElement("div");
    list.className = "task-list";
    cols[col].forEach(task => {
      const taskCard = document.createElement("div");
      taskCard.className = "task";
      taskCard.innerHTML = `
        <strong>${task.title}</strong><br />
        <small>${task.subtasks.filter(st => st.completed).length} of ${task.subtasks.length} subtasks</small>
      `;
      taskCard.addEventListener("click", () => openTaskModal(task, col));
      list.appendChild(taskCard);
    });

    column.appendChild(list);
    boardContainer.appendChild(column);
  });

  // Add new column
  const newCol = document.createElement("div");
  newCol.className = "column new-column";
  const btn = document.createElement("button");
  btn.id = "newColumnBtn";
  btn.textContent = "+ New Column";
  btn.onclick = () => {
    const newColName = prompt("Enter new column name:");
    if (newColName && !cols[newColName]) {
      cols[newColName] = [];
      localStorage.setItem("kanbanBoards", JSON.stringify(boards));
      renderBoard();
    }
  };
  newCol.appendChild(btn);
  boardContainer.appendChild(newCol);
}

function renameColumn(oldName) {
  const newName = prompt("Enter new column name:", oldName);
  if (newName && newName !== oldName && !boards[currentBoard].columns[newName]) {
    boards[currentBoard].columns[newName] = boards[currentBoard].columns[oldName];
    delete boards[currentBoard].columns[oldName];
    localStorage.setItem("kanbanBoards", JSON.stringify(boards));
    renderBoard();
  }
}

function deleteColumn(colName) {
  if (confirm(`Are you sure to delete column '${colName}'?`)) {
    delete boards[currentBoard].columns[colName];
    localStorage.setItem("kanbanBoards", JSON.stringify(boards));
    renderBoard();
  }
}

function openTaskModal(task, currentStatus) {
  taskModal.classList.remove("hidden");
  taskTitle.value = task.title;
  taskDescription.value = task.description;
  taskStatus.innerHTML = "";
  Object.keys(boards[currentBoard].columns).forEach(col => {
    const option = document.createElement("option");
    option.value = col;
    option.textContent = col;
    taskStatus.appendChild(option);
  });
  taskStatus.value = currentStatus;
  subtasksContainer.innerHTML = "";
  task.subtasks.forEach(st => addSubtaskField(st.title));

  editMode = true;
  editingTask = task;
}

renderSidebar();
renderBoard();