# 🚀 Budy - タスク管理とスキル成長アプリ

**Budy**は、タスク管理とスキル成長を組み合わせた総合的な生産性向上ツールです。ポモドーロタイマー、経験値システム、学習記録機能により、効率的なタスク管理と継続的な成長をサポートします。

## ✨ 主要機能

### 🔐 ユーザー認証
- メールアドレス・パスワードによる認証
- 新規登録・ログイン・ログアウト
- 認証状態の自動管理

### 📋 タスク管理
- **タスク作成・編集・削除**
- **タスク完了・延期（スヌーズ）**
- **期限切れ警告**
- **カテゴリ分類**（仕事・学習・プライベート・その他）
- **関連スキル設定**
- **フィルタリング機能**

### ⏰ ポモドーロタイマー
- **予定作業時間に基づくタイマー**
- **開始・一時停止・リセット**
- **プログレスバー表示**
- **タスク完了時の学び記録**

### 🎯 スキル成長システム
- **4つのスキルカテゴリ**
  - 学習力
  - 創造力
  - 実行力
  - コミュニケーション力
- **レベル・経験値管理**
- **円形プログレスバー**
- **タスク完了時の経験値加算**

### 📊 ダッシュボード
- **今日のフォーカスタスク**
- **スキルサマリー**
- **統計情報**
- **完了済みタスク（折りたたみ表示）**
- **期限切れタスク警告**

### 📚 学習記録
- **完了タスクの学び一覧**
- **スキル別フィルタリング**
- **学びあり・なしの分類**

### 📈 プロフィール・分析
- **ユーザー情報表示**
- **全体レベル・経験値**
- **スキル別統計分析**
- **完了率・学び記録率**

## 🛠️ 技術スタック

- **フロントエンド**: React 18, Material-UI (MUI)
- **バックエンド**: Firebase
- **認証**: Firebase Authentication
- **データベース**: Firestore
- **ルーティング**: React Router DOM

## 🚀 セットアップ

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd bady
```

### 2. Firebase設定
1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authenticationでメール・パスワード認証を有効化
3. Firestoreデータベースを作成
4. `frontend/public/firebase-config.example.json`を`firebase-config.json`にコピー
5. Firebase設定値を`firebase-config.json`に記入

### 3. 依存関係のインストール
```bash
cd frontend
npm install
```

### 4. 開発サーバーの起動
```bash
npm start
```

### 5. Firestoreセキュリティルール
Firebase Consoleで以下のセキュリティルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📁 プロジェクト構成

```
bady/
├── frontend/                 # Reactアプリケーション
│   ├── public/
│   │   ├── index.html
│   │   ├── firebase-config.json
│   │   └── firebase-config.example.json
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── Auth/        # 認証関連
│   │   │   ├── Tasks/       # タスク管理
│   │   │   ├── Timer/       # ポモドーロタイマー
│   │   │   ├── Skills/      # スキル・分析
│   │   │   ├── Profile/     # プロフィール
│   │   │   └── Common/      # 共通コンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── styles/          # スタイル
│   │   ├── App.js           # メインアプリ
│   │   ├── index.js         # エントリーポイント
│   │   └── firebase.js      # Firebase設定
│   ├── package.json
│   └── README.md
├── docs/                    # ドキュメント
│   ├── SECURITY.md          # セキュリティガイド
│   ├── DEPLOYMENT.md        # デプロイメントガイド
│   └── CHANGELOG.md         # 変更履歴
├── legacy/                  # 旧バージョン（参考用）
│   ├── README.md
│   ├── index.html
│   ├── project-list.html
│   ├── task-list.html
│   ├── mislenge-create.html
│   ├── styles.css
│   ├── common.js
│   └── icon.png
├── backend/                 # バックエンド（将来の拡張用）
├── .gitignore
└── README.md
```

## 🔒 セキュリティ

- Firebase APIキーは外部ファイルで管理
- `.gitignore`で機密情報を除外
- Firestoreセキュリティルールでアクセス制御
- ユーザー認証によるデータ保護

詳細は[docs/SECURITY.md](docs/SECURITY.md)を参照してください。

## 🎮 使い方

### 1. アカウント作成・ログイン
- 新規登録でユーザー名・メール・パスワードを設定
- ログイン後、ダッシュボードが表示されます

### 2. タスク作成
- 「タスク一覧」から「新しいタスク」をクリック
- タスク名、締切日、予定時間、関連スキルを設定
- カテゴリとメモも追加可能

### 3. ポモドーロタイマー使用
- タスクのタイマーアイコンをクリック
- 予定時間に基づいてタイマーが開始
- 完了時に学んだことを記録

### 4. スキル成長確認
- 「プロフィール」でスキル進捗を確認
- タスク完了で経験値が加算
- レベルアップでスキルが成長

### 5. 学習記録の振り返り
- 「学習記録」で完了タスクの学びを確認
- スキル別にフィルタリング可能

## 🚧 今後の拡張予定

- [ ] データ分析・レポート機能の強化
- [ ] チーム機能・共有機能
- [ ] モバイルアプリ対応
- [ ] 通知機能
- [ ] データエクスポート機能

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、Issueを作成してください。

---

**Budy**で効率的なタスク管理と継続的な成長を実現しましょう！ 🎯 