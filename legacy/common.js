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
  project.url = project.url || "";
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
}

function addMislenge(mislenge) {
  mislenge.id = mislenge.id || Date.now().toString();  // ✅ すでにIDがあればそれを使う
  const mislengeList = getMislenge();
  mislengeList.push(mislenge);
  saveMislenge(mislengeList);
}

/** Project ID に紐づくMislengeを取得（型を統一して比較） */
function getMislengeByProjectId(projectId) {
  return getMislenge().filter(m => String(m.projectId) === String(projectId));
}

/* 削除機能 */
function deleteProject(projectId) {
    // プロジェクト削除
    let projects = getProjects();
    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
  
    // 関連する Mislenge も削除
    let mislenge = getMislenge();
    mislenge = mislenge.filter(m => m.projectId !== projectId);
    saveMislenge(mislenge);
  }
  
  function deleteMislenge(mislengeId) {
    let mislenge = getMislenge();
    mislenge = mislenge.filter(m => m.id !== mislengeId);
    saveMislenge(mislenge);
  }

//編集機能
function updateProject(updatedProject) {
  let projects = getProjects();
  let index = projects.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    projects[index] = updatedProject;
    saveProjects(projects);
  }
}

/** Mislengeの更新（Object.assignを使用） */
function updateMislenge(updatedMislenge) {
  let mislenge = getMislenge();
  let index = mislenge.findIndex(m => m.id === updatedMislenge.id);
  if (index !== -1) {
    Object.assign(mislenge[index], updatedMislenge);
    saveMislenge(mislenge);
  }
}

/** プロジェクトを指定位置へ移動（範囲外チェックを追加） */
function moveProject(fromIndex, toIndex) {
  let projects = getProjects();
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= projects.length || toIndex >= projects.length) {
    console.warn("無効な移動");
    return;
  }
  const [movedProject] = projects.splice(fromIndex, 1);
  projects.splice(toIndex, 0, movedProject);
  saveProjects(projects);
}

const STORAGE_KEY_RECORDS = "dailyRecords";

// 毎日の記録の取得・保存
function getDailyRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_RECORDS)) || [];
}

function saveDailyRecords(records) {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
}
