# 🔒 Firebase セキュリティガイド

## 概要
このプロジェクトではFirebaseを使用してタスク管理機能を提供しています。セキュリティを確保するため、以下のガイドラインに従ってください。

## 🚨 重要なセキュリティ対策

### 1. APIキーの管理
- **絶対にAPIキーをGitにコミットしないでください**
- `firebase-config.json`は`.gitignore`に含まれています
- 本番環境では環境変数を使用してください

### 2. 設定ファイルのセットアップ
1. `firebase-config.example.json`を`firebase-config.json`にコピー
2. 自分のFirebaseプロジェクトの設定値に置き換え

```bash
cp firebase-config.example.json firebase-config.json
```

### 3. Firebase Consoleでの設定
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトの設定 → 全般 → マイアプリ
3. Webアプリの設定を確認

## 🔧 環境別設定

### 開発環境
- `firebase-config.dev.json`を使用
- テスト用のFirebaseプロジェクトを推奨

### 本番環境
- `firebase-config.prod.json`を使用
- 本番用のFirebaseプロジェクトを使用

## 🛡️ 追加のセキュリティ対策

### 1. Firestoreセキュリティルール
Firebase Consoleで以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // タスクコレクション
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // タグコレクション
      match /tags/{tagId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 2. 認証設定
- メール/パスワード認証のみを有効化
- 不要な認証方法は無効化

### 3. アプリケーションの制限
- Firebase Consoleで承認済みドメインを設定
- 不要なドメインからのアクセスを制限

## 📋 チェックリスト

- [ ] APIキーがGitにコミットされていない
- [ ] `firebase-config.json`が`.gitignore`に含まれている
- [ ] Firestoreセキュリティルールが設定されている
- [ ] 承認済みドメインが設定されている
- [ ] 不要な認証方法が無効化されている

## 🚨 緊急時の対応

### APIキーが漏洩した場合
1. Firebase ConsoleでAPIキーを再生成
2. 古いAPIキーを無効化
3. 新しい設定で`firebase-config.json`を更新

### セキュリティインシデントの報告
セキュリティ問題を発見した場合は、すぐに報告してください。

## 📚 参考資料
- [Firebase セキュリティ ルール](https://firebase.google.com/docs/rules)
- [Firebase 認証](https://firebase.google.com/docs/auth)
- [Firebase セキュリティ ベストプラクティス](https://firebase.google.com/docs/projects/api-keys) 