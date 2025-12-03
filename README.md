# Outlook Mail Tool 📧

Outlookメール送信を効率化するデスクトップアプリケーションです。

## 特徴

- 📒 **アドレス帳管理**: 連絡先を組織・部署で管理
- 📁 **グループ機能**: 宛先をグループ化して一括送信
- 📝 **テンプレート**: よく使うメール文面を保存
- 🔤 **変数機能**: `{会社名}` `{担当者名}` などの変数で文面を自動生成
- 📅 **システム変数**: `{本日}` で当日の日付を自動挿入 (yyyymmdd形式)
- 🚀 **Outlook連携**: ワンクリックでOutlookを起動してメール作成

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Tailwind CSS
- **バックエンド**: Flask 3.1.2 + SQLAlchemy 2.0.44
- **データベース**: SQLite
- **ビルドツール**: Vite 6.2.0
- **パッケージング**: PyInstaller 6.17.0

## セットアップ

### 前提条件

- Node.js 18以上
- Python 3.8以上

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/YOUR_USERNAME/outlook-app.git
   cd outlook-app
   ```

2. **Node.jsパッケージをインストール**
   ```bash
   npm install
   ```

3. **Python仮想環境を作成**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

4. **Pythonパッケージをインストール**
   ```bash
   pip install -r backend/requirements.txt
   ```

5. **開発サーバーを起動**
   ```bash
   npm start
   ```

   ブラウザで http://localhost:3000 が自動的に開きます。

## EXE化（配布用）

詳細な手順は [BUILD.md](BUILD.md) を参照してください。

### 簡易手順

1. フロントエンドをビルド:
   ```bash
   npm run build
   ```

2. EXEを作成:
   ```bash
   pyinstaller outlook-mail-tool.spec
   ```

3. 作成されたEXE:
   ```
   dist/OutlookMailTool.exe
   ```

## プロジェクト構造

詳細は [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) を参照してください。

```
outlook-app/
├── backend/           # Flaskバックエンド
├── components/        # Reactコンポーネント
├── services/          # API通信
├── dist/             # ビルド出力
├── main.py           # EXEエントリーポイント
├── App.tsx           # Reactメインコンポーネント
└── index.tsx         # Reactエントリーポイント
```

## ドキュメント

- [BUILD.md](BUILD.md) - EXE作成の詳細ガイド
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - プロジェクト構成の詳細説明
- [DISTRIBUTION.md](DISTRIBUTION.md) - 配布方法

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

## 注意事項

### データベースの共有について

現在のSQLite実装では、**ネットワーク共有フォルダでの複数ユーザー同時利用は推奨されません**。

複数ユーザーで利用する場合は以下の方式を検討してください:

1. **中央サーバー方式**: 1台のPCでFlaskサーバーを起動し、他のPCからブラウザでアクセス
2. **PostgreSQL/MySQL**: データベースを変更して同時アクセスに対応
3. **独立実行**: 各自のPCで独立して使用し、定期的にマスターデータを同期

詳細は [BUILD.md](BUILD.md) の「共有利用について」セクションを参照してください。
