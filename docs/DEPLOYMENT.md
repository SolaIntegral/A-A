# デプロイメントガイド

## Firebase Hosting でのデプロイ

### 1. Firebase CLI のインストール
```bash
npm install -g firebase-tools
```

### 2. Firebase にログイン
```bash
firebase login
```

### 3. プロジェクトの初期化
```bash
firebase init hosting
```

### 4. ビルド設定
- 公開ディレクトリ: `frontend/build`
- SPA設定: `yes`
- GitHub Actions: `no`

### 5. アプリのビルド
```bash
cd frontend
npm run build
```

### 6. デプロイ
```bash
firebase deploy
```

## 環境変数の設定

### 本番環境
1. Firebase Consoleで本番用プロジェクトを作成
2. `frontend/public/firebase-config.json`を本番用設定に更新
3. Firestoreセキュリティルールを本番用に設定

### 開発環境
1. `frontend/public/firebase-config.example.json`をコピー
2. 開発用Firebase設定を記入

## セキュリティチェックリスト

- [ ] Firebase APIキーがGitにコミットされていない
- [ ] Firestoreセキュリティルールが設定されている
- [ ] 承認済みドメインが設定されている
- [ ] 不要な認証方法が無効化されている

## トラブルシューティング

### ビルドエラー
```bash
cd frontend
npm install
npm run build
```

### デプロイエラー
```bash
firebase logout
firebase login
firebase deploy
```

### セキュリティエラー
Firebase Consoleでセキュリティルールを確認 