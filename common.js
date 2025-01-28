/* =========================================
   common.js 
   - localStorageを使った簡易的なデータ管理
   ========================================= */

// localStorage上のキー
const STORAGE_KEY_TASKS = "taskList";
const STORAGE_KEY_PROJECTS = "projectList";

/** 日付を"YYYY-MM-DD"形式の文字列で返す */
function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = ("00" + (dateObj.getMonth() + 1)).slice(-2);
  const d = ("00" + dateObj.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

/** 今日の日付文字列を返す */
function getTodayString() {
  return formatDate(new Date());
}

/** localStorageからタスク一覧を取得 */
function getTasks() {
  const tasksJson = localStorage.getItem(STORAGE_KEY_TASKS);
  return tasksJson ? JSON.parse(tasksJson) : [];
}

/** localStorageへタスク一覧を保存 */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}

/** localStorageからプロジェクト一覧を取得 */
function getProjects() {
  const projectsJson = localStorage.getItem(STORAGE_KEY_PROJECTS);
  return projectsJson ? JSON.parse(projectsJson) : [];
}

/** localStorageへプロジェクト一覧を保存 */
function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
}

/** 新規タスクを追加 */
function addTask(task) {
  const tasks = getTasks();
  // タスクIDは簡易的に現在時刻をベースに生成
  task.id = Date.now().toString();
  tasks.push(task);
  saveTasks(tasks);
}

/** タスクを更新 */
function updateTask(updatedTask) {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
}

/** タスクをIDで取得 */
function getTaskById(taskId) {
  const tasks = getTasks();
  return tasks.find((t) => t.id === taskId);
}

/** 新規プロジェクトを追加 */
function addProject(project) {
  const projects = getProjects();
  // プロジェクトIDは簡易的に現在時刻をベースに生成
  project.id = Date.now().toString();
  projects.push(project);
  saveProjects(projects);
}

/** プロジェクトをIDで取得 */
function getProjectById(projectId) {
  const projects = getProjects();
  return projects.find((p) => p.id === projectId);
}

/** タスク一覧からプロジェクトIDでフィルタ */
function getTasksByProjectId(projectId) {
  const tasks = getTasks();
  return tasks.filter((t) => t.projectId === projectId);
}
