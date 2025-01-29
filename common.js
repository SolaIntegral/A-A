// ===========================
// URL パラメータを利用したデータ管理
// ===========================

// URL からデータを取得
export function getDataFromURL() {
  const params = new URLSearchParams(window.location.search);
  return JSON.parse(decodeURIComponent(params.get("data") || "[]"));
}

// URL にデータを保存
export function saveDataToURL(data) {
  const encodedData = encodeURIComponent(JSON.stringify(data));
  const newUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
  window.history.replaceState({}, "", newUrl);
}

// データ追加（タスク・プロジェクト）
export function addData(item) {
  const data = getDataFromURL();
  data.push(item);
  saveDataToURL(data);
}

// データ削除
export function deleteData(id) {
  const data = getDataFromURL().filter(item => item.id !== id);
  saveDataToURL(data);
}
