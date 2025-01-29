// ===========================
// Firestore 設定 & 認証管理
// ===========================

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";

// Firebase の設定
const firebaseConfig = {
  apiKey: "AIzaSyD4Unr7lG5puI4n3tDZJ4qTNeAvVh6OABg",
  authDomain: "bady-e1de5.firebaseapp.com",
  projectId: "bady-e1de5",
  storageBucket: "bady-e1de5.firebasestorage.app",
  messagingSenderId: "334821642950",
  appId: "1:334821642950:web:aa7cd88b342ad6e4c4bdc7",
  measurementId: "G-9W2M171QBK"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// 認証状態の監視
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    console.log("ログイン中:", user.email);
    loadProjectsFromFirestore();
    loadMislengeFromFirestore();
  } else {
    window.location.href = "login.html"; // 未ログインならログイン画面へ
  }
});

function loginWithEmail(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = "index.html")
    .catch(error => alert(error.message));
}

function registerWithEmail(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("アカウントを作成しました"))
    .catch(error => alert(error.message));
}

// `window` に明示的に登録
window.addEventListener("load", function() {
  window.loginWithEmail = loginWithEmail;
  window.registerWithEmail = registerWithEmail;
  window.loginWithGoogle = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(() => {
      window.location.href = "index.html";
    }).catch(error => alert(error.message));
  };
});



window.loginWithGoogle = function() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then(() => {
    window.location.href = "index.html";
  }).catch(error => alert(error.message));
};

// ログアウト処理
function logout() {
  auth.signOut().then(() => {
    window.location.href = "logout.html";
  }).catch(error => alert("ログアウトに失敗しました: " + error.message));
}

  // ===========================
  // プロジェクトの Firestore 処理
  // ===========================
  
  // Firestore からプロジェクトを取得
  function loadProjectsFromFirestore() {
    db.collection("users").doc(currentUser.uid).collection("projects").get()
      .then(snapshot => {
        let projects = [];
        snapshot.forEach(doc => projects.push(doc.data()));
        saveProjects(projects); // localStorage に保存（バックアップ用）
      });
  }
  
  // Firestore にプロジェクトを追加
  function addProject(project) {
    project.id = Date.now().toString();
    project.createdAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
  
    db.collection("users").doc(currentUser.uid).collection("projects").doc(project.id).set(project)
      .then(() => {
        console.log("プロジェクトが追加されました");
        loadProjectsFromFirestore();
      })
      .catch(error => console.error("プロジェクト追加エラー:", error));
  }
  
  // Firestore からプロジェクトを削除
  function deleteProject(projectId) {
    db.collection("users").doc(currentUser.uid).collection("projects").doc(projectId).delete()
      .then(() => {
        deleteMislengeByProjectId(projectId); // 関連する Mislenge も削除
        console.log("プロジェクトを削除しました");
        loadProjectsFromFirestore();
      })
      .catch(error => console.error("プロジェクト削除エラー:", error));
  }
  
  // ===========================
  // Mislenge（Task/Schedule）の Firestore 処理
  // ===========================
  
  // Firestore から Mislenge を取得
  function loadMislengeFromFirestore() {
    db.collection("users").doc(currentUser.uid).collection("mislenge").get()
      .then(snapshot => {
        let mislenge = [];
        snapshot.forEach(doc => mislenge.push(doc.data()));
        saveMislenge(mislenge); // localStorage に保存（バックアップ用）
      });
  }
  
  // Firestore に Mislenge を追加
  function addMislenge(mislenge) {
    mislenge.id = Date.now().toString();
    mislenge.createdAt = new Date().toISOString();
    mislenge.updatedAt = new Date().toISOString();
  
    db.collection("users").doc(currentUser.uid).collection("mislenge").doc(mislenge.id).set(mislenge)
      .then(() => {
        console.log("Mislenge が追加されました");
        loadMislengeFromFirestore();
      })
      .catch(error => console.error("Mislenge追加エラー:", error));
  }
  
  // Firestore から Mislenge を削除
  function deleteMislenge(mislengeId) {
    db.collection("users").doc(currentUser.uid).collection("mislenge").doc(mislengeId).delete()
      .then(() => {
        console.log("Mislenge を削除しました");
        loadMislengeFromFirestore();
      })
      .catch(error => console.error("Mislenge削除エラー:", error));
  }
  
  // 特定のプロジェクトに紐づく Mislenge を削除
  function deleteMislengeByProjectId(projectId) {
    db.collection("users").doc(currentUser.uid).collection("mislenge")
      .where("projectId", "==", projectId).get()
      .then(snapshot => {
        snapshot.forEach(doc => doc.ref.delete());
      });
  }
  
  // ===========================
  // ローカルストレージ操作
  // ===========================
  
  const STORAGE_KEY_PROJECTS = "projectList";
  const STORAGE_KEY_MISLENGE = "mislengeList";
  
  // ローカルストレージからプロジェクトを取得
  function getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS)) || [];
  }
  
  // ローカルストレージへプロジェクトを保存
  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }
  
  // ローカルストレージから Mislenge を取得
  function getMislenge() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_MISLENGE)) || [];
  }
  
  // ローカルストレージへ Mislenge を保存
  function saveMislenge(mislenge) {
    localStorage.setItem(STORAGE_KEY_MISLENGE, JSON.stringify(mislenge));
  }
  