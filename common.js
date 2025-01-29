const STORAGE_KEY_PROJECTS = "projectList";
const STORAGE_KEY_MISLENGE = "mislengeList";

/** 日付を"YYYY-MM-DD"形式の文字列で返す */
function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = ("00" + (dateObj.getMonth() + 1)).slice(-2);
  const d = ("00" + dateObj.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

/** 今日の日付を取得 */
function getTodayString() {
  return formatDate(new Date());
}

/** データの取得・保存（localStorage） */
function getProjects() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS)) || [];
}
function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
}

function getMislenge() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_MISLENGE)) || [];
}
function saveMislenge(mislenge) {
  localStorage.setItem(STORAGE_KEY_MISLENGE, JSON.stringify(mislenge));
}

/** 新規データ追加 */
function addProject(project) {
  project.id = Date.now().toString();
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
}

function addMislenge(mislenge) {
  mislenge.id = Date.now().toString();
  const mislengeList = getMislenge();
  mislengeList.push(mislenge);
  saveMislenge(mislengeList);
}

/** Project ID に紐づくMislengeを取得 */
function getMislengeByProjectId(projectId) {
  return getMislenge().filter(m => m.projectId === projectId);
}
