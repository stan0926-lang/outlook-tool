# Outlook Mail Tool - プロジェクト構成ガイド 📚

このドキュメントでは、Outlook Mail Toolのプロジェクト内のすべてのファイルとフォルダの役割を、図解を交えて詳しく解説します。

---

## 📋 目次

1. [プロジェクト全体像](#プロジェクト全体像)
2. [ルートディレクトリのファイル](#ルートディレクトリのファイル)
3. [backendフォルダ](#backendフォルダ)
4. [componentsフォルダ](#componentsフォルダ)
5. [servicesフォルダ](#servicesフォルダ)
6. [distフォルダ](#distフォルダ)
7. [ビルド関連フォルダ](#ビルド関連フォルダ)
8. [データフロー図](#データフロー図)
9. [開発・本番環境の違い](#開発本番環境の違い)

---

## プロジェクト全体像

### ディレクトリツリー

```
outlook-app/
│
├── 📄 main.py                          # EXE起動のエントリーポイント
├── 📄 index.html                       # フロントエンドのHTMLテンプレート
├── 📄 index.tsx                        # Reactアプリケーションのエントリーポイント
├── 📄 App.tsx                          # Reactのメインコンポーネント
├── 📄 types.ts                         # TypeScript型定義
├── 📄 index.css                        # CSSスタイル（マーキーアニメーション）
│
├── 📄 package.json                     # Node.jsプロジェクト設定
├── 📄 tsconfig.json                    # TypeScriptコンパイラ設定
├── 📄 vite.config.ts                   # Viteビルドツール設定
│
├── 📄 outlook-mail-tool.spec           # PyInstallerビルド設定
├── 📄 BUILD.md                         # EXE作成ガイド
├── 📄 BUILD_OLD.md                     # 旧ビルドガイド（バックアップ）
├── 📄 DISTRIBUTION.md                  # 配布ガイド
├── 📄 README.md                        # プロジェクト概要
├── 📄 LICENSE                          # ライセンス情報
│
├── 📄 reset_demo_data.py               # デモデータ初期化スクリプト
├── 📄 data.db                          # SQLiteデータベース（自動生成）
│
├── 📁 backend/                         # バックエンド（Flask API）
│   ├── __init__.py                     # Pythonパッケージ初期化
│   ├── app.py                          # FlaskアプリとAPI定義
│   ├── models.py                       # データベースモデル定義
│   └── requirements.txt                # Python依存パッケージ
│
├── 📁 components/                      # Reactコンポーネント
│   ├── Layout.tsx                      # 全体レイアウト（サイドバー）
│   ├── MailComposer.tsx                # メール作成画面
│   ├── AddressBook.tsx                 # アドレス帳管理
│   ├── GroupManager.tsx                # グループ管理
│   ├── TemplateManager.tsx             # テンプレート管理
│   ├── VariableSettings.tsx            # 変数設定
│   ├── DataImport.tsx                  # データ取込
│   └── ui/                             # UI部品
│       ├── Button.tsx                  # ボタンコンポーネント
│       └── Icons.tsx                   # アイコンコンポーネント
│
├── 📁 services/                        # API通信サービス
│   └── mockApi.ts                      # バックエンドAPI呼び出し
│
├── 📁 dist/                            # ビルド済みフロントエンド
│   ├── index.html                      # ビルド済みHTML
│   ├── OutlookMailTool.exe            # ビルド済みEXE（作成後）
│   └── assets/                         # ビルド済みJS/CSS
│       ├── index-xxxxx.js
│       └── index-xxxxx.css
│
├── 📁 build/                           # PyInstaller中間ファイル
│   └── outlook-mail-tool/
│       ├── Analysis-00.toc
│       ├── EXE-00.toc
│       └── ...
│
├── 📁 node_modules/                    # Node.js依存パッケージ
├── 📁 .venv/                          # Python仮想環境
└── 📁 __pycache__/                    # Pythonキャッシュ
```

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────┐
│                   ユーザー                            │
│            (ブラウザでアクセス)                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────┐
│              OutlookMailTool.exe                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         main.py (起動制御)                   │   │
│  │  ・ブラウザ自動起動                           │   │
│  │  ・Flaskサーバー起動                          │   │
│  └─────────────┬───────────────────────────────┘   │
│                │                                     │
│  ┌─────────────↓───────────────────────────────┐   │
│  │   backend/app.py (Flask API)                 │   │
│  │  ┌──────────────────────────────────┐        │   │
│  │  │ REST API (30エンドポイント)      │        │   │
│  │  │ /api/addresses                  │        │   │
│  │  │ /api/groups                     │        │   │
│  │  │ /api/templates                  │        │   │
│  │  │ /api/globals                    │        │   │
│  │  └────────────┬─────────────────────┘        │   │
│  │               │                              │   │
│  │  ┌────────────↓─────────────────────┐       │   │
│  │  │ backend/models.py               │       │   │
│  │  │ ・Address (アドレス)             │       │   │
│  │  │ ・Group (グループ)               │       │   │
│  │  │ ・EmailTemplate (テンプレート)   │       │   │
│  │  │ ・GlobalVariable (変数)          │       │   │
│  │  └────────────┬─────────────────────┘       │   │
│  │               │                              │   │
│  │  ┌────────────↓─────────────────────┐       │   │
│  │  │      data.db (SQLite)            │       │   │
│  │  └──────────────────────────────────┘       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │   dist/ (フロントエンド)                      │   │
│  │  ┌──────────────────────────────────┐        │   │
│  │  │ index.html + React App           │        │   │
│  │  │ ・Layout (レイアウト)             │        │   │
│  │  │ ・MailComposer (メール作成)       │        │   │
│  │  │ ・AddressBook (アドレス帳)        │        │   │
│  │  │ ・GroupManager (グループ)         │        │   │
│  │  │ ・TemplateManager (テンプレート)  │        │   │
│  │  └──────────────────────────────────┘        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ルートディレクトリのファイル

### 📄 main.py
**役割**: EXE起動時のエントリーポイント

**主な機能**:
```python
# 1. リソースパスの解決（EXE内のファイルパス）
def resource_path(relative_path):
    # PyInstallerで実行時は sys._MEIPASS を使用
    # 通常実行時はカレントディレクトリ

# 2. サーバー起動確認
def check_server_ready(host, port, timeout=10):
    # ポート5000が開くまで待機

# 3. ブラウザ自動起動
def open_browser(url, host, port):
    # サーバー起動後にブラウザを開く

# 4. Flaskサーバー起動
def run_server(app, host, port):
    # 別スレッドでFlaskを起動

# 5. メイン処理
if __name__ == '__main__':
    # Flaskアプリを作成
    # ブラウザ起動スレッドを開始
    # サーバーを起動
```

**重要なポイント**:
- EXE化時と開発時で動作を切り替える
- `sys._MEIPASS`: PyInstallerが一時展開するフォルダ
- `threading`: ブラウザ起動をノンブロッキングで実行

**使用タイミング**: EXE実行時のみ

---

### 📄 index.html
**役割**: ReactアプリのベースとなるHTMLテンプレート

**内容**:
```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Outlook Mail Tool</title>
    
    <!-- Tailwind CSS（スタイリング） -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            spacing: {
              '50': '12.5rem',  // カスタムスペーシング
            }
          }
        }
      }
    </script>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    
    <!-- カスタムCSS -->
    <link rel="stylesheet" href="/index.css">
  </head>
  
  <body class="bg-[#f8fafc] text-[#334155]">
    <!-- Reactがマウントされる場所 -->
    <div id="root"></div>
    
    <!-- Reactアプリのエントリーポイント -->
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

**ビルド後**: `dist/index.html`に変換され、JS/CSSが最適化される

---

### 📄 index.tsx
**役割**: Reactアプリケーションのエントリーポイント

**内容**:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reactアプリをrootにマウント
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**処理の流れ**:
1. `document.getElementById('root')` でHTML内の`<div id="root">`を取得
2. `ReactDOM.createRoot()` でReactのルートを作成
3. `<App />` コンポーネントをレンダリング

---

### 📄 App.tsx
**役割**: Reactアプリのメインコンポーネント

**構造**:
```tsx
import { View } from './types';
import { Layout } from './components/Layout';
import { MailComposer } from './components/MailComposer';
import { AddressBook } from './components/AddressBook';
// ... 他のコンポーネント

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.COMPOSE);

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {/* 現在の画面を表示 */}
      {currentView === View.COMPOSE && <MailComposer />}
      {currentView === View.ADDRESS_BOOK && <AddressBook />}
      {currentView === View.GROUPS && <GroupManager />}
      {currentView === View.TEMPLATES && <TemplateManager />}
      {currentView === View.VARIABLES && <VariableSettings />}
      {currentView === View.IMPORT && <DataImport />}
    </Layout>
  );
}
```

**役割**:
- 画面の切り替えを管理（`currentView`）
- Layoutコンポーネントで全体を包む
- サイドバーのメニューに応じて表示を切り替え

---

### 📄 types.ts
**役割**: TypeScriptの型定義を一元管理

**主な型**:
```typescript
// 画面の種類
export enum View {
  COMPOSE = 'compose',
  ADDRESS_BOOK = 'address_book',
  GROUPS = 'groups',
  TEMPLATES = 'templates',
  VARIABLES = 'variables',
  IMPORT = 'import',
}

// アドレス（連絡先）
export interface Address {
  id: string;
  name: string;
  email: string;
  organization: string;
  department?: string;
}

// グループ
export interface Group {
  id: string;
  group_name: string;
  member_ids: string[];  // アドレスIDの配列
  customAttributes?: { key: string; value: string }[];
}

// メールテンプレート
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  defaultRecipients: { addressId: string; type: RecipientType }[];
}

// グローバル変数
export interface GlobalVariable {
  id: string;
  key: string;
  value: string;
}

// 宛先タイプ
export type RecipientType = 'TO' | 'CC' | 'BCC';
```

**メリット**:
- 型安全性の確保
- VSCodeの自動補完が効く
- リファクタリングが安全
- ドキュメント代わりになる

---

### 📄 index.css
**役割**: カスタムCSSスタイル

**内容**:
```css
/* マーキーアニメーション（宛先の見切れ文字対策） */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee-hover {
  display: inline-block;
  position: relative;
}

.animate-marquee-hover:hover {
  animation: marquee 2.67s linear infinite;
}

/* ホバー時にテキストを複製して表示 */
.animate-marquee-hover::after {
  content: attr(data-text);
  position: absolute;
  left: 100%;
  padding-left: 2rem;
  opacity: 0;
}

.animate-marquee-hover:hover::after {
  opacity: 1;
}
```

**使用箇所**: MailComposer.tsxの宛先リスト

---

### 📄 package.json
**役割**: Node.jsプロジェクトの設定ファイル

**内容**:
```json
{
  "name": "outlook-mail-tool",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",                    // 開発サーバー起動
    "build": "vite build",            // 本番用ビルド
    "preview": "vite preview",        // ビルド結果のプレビュー
    "start": "concurrently \"npm run dev\" \"python backend\\app.py\""  // 同時起動
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "concurrently": "^9.1.0"         // 複数コマンド同時実行
  }
}
```

**コマンド**:
- `npm install`: パッケージインストール
- `npm run dev`: 開発サーバー起動（ポート3000）
- `npm run build`: distフォルダにビルド
- `npm start`: フロント+バックを同時起動

---

### 📄 tsconfig.json
**役割**: TypeScriptコンパイラの設定

**主な設定**:
```json
{
  "compilerOptions": {
    "target": "ES2020",              // 出力するJavaScriptのバージョン
    "module": "ESNext",              // モジュールシステム
    "lib": ["ES2020", "DOM"],        // 使用するライブラリ
    "jsx": "react-jsx",              // JSXのコンパイル方法
    "strict": true,                  // 厳格な型チェック
    "moduleResolution": "bundler",   // モジュール解決方法
    "esModuleInterop": true,         // CommonJSとの互換性
    "skipLibCheck": true             // ライブラリの型チェックをスキップ
  }
}
```

---

### 📄 vite.config.ts
**役割**: Viteビルドツールの設定

**内容**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],              // Reactプラグイン
  server: {
    port: 3000,                    // 開発サーバーのポート
  },
  build: {
    outDir: 'dist',                // 出力先ディレクトリ
    sourcemap: false,              // ソースマップを生成しない
  },
});
```

**Viteとは？**:
- 高速なビルドツール
- TypeScript/Reactを自動変換
- ホットリロード対応

---

### 📄 outlook-mail-tool.spec
**役割**: PyInstallerのビルド設定ファイル

**内容の解説**:
```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],                      # エントリーポイント
    pathex=[],
    binaries=[],
    datas=[
        ('dist', 'dist'),             # フロントエンドを含める
        ('backend/models.py', 'backend'),  # models.pyを含める
    ],
    hiddenimports=[                   # 明示的にインポート
        'flask',
        'flask_cors',
        'flask_sqlalchemy',
        'sqlalchemy',
        'sqlalchemy.ext.declarative',
        'sqlalchemy.orm',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='OutlookMailTool',           # EXEファイル名
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,                         # UPX圧縮を有効化
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,                     # コンソールウィンドウを表示
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

**カスタマイズ例**:
- `console=False`: コンソールを非表示
- `icon='icon.ico'`: アイコンを設定
- `onefile=True`: 1ファイルにまとめる

---

### 📄 reset_demo_data.py
**役割**: デモデータの初期化スクリプト

**内容**:
```python
import os
from backend.models import db, Address, Group, EmailTemplate, GlobalVariable
from backend.app import create_app

# Flaskアプリを作成
app = create_app()

with app.app_context():
    # 既存データを削除
    db.drop_all()
    db.create_all()
    
    # サンプルアドレスを46件作成
    # 港区庁舎改修現場: 15人
    # 県立高校新築現場: 15人  
    # 病院増築現場: 16人
    
    # サンプルグループを3つ作成
    # 各グループにカスタム属性を設定
    
    # サンプルテンプレートを6つ作成
    
    # サンプル変数を作成
    
    db.session.commit()
    print("✅ デモデータを作成しました")
```

**使い方**:
```powershell
python reset_demo_data.py
```

---

## backendフォルダ

### 📄 backend/__init__.py
**役割**: Pythonパッケージとして認識させる

**内容**: 空ファイル（存在するだけで機能する）

---

### 📄 backend/app.py
**役割**: FlaskアプリケーションとAPI定義

**構造**:
```python
# 1. インポート
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from models import db, Address, Group, EmailTemplate, GlobalVariable

# 2. Flaskアプリ作成関数
def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATA_DB}'
    CORS(app)  # クロスオリジン許可
    db.init_app(app)
    
    with app.app_context():
        db.create_all()  # テーブル作成
    
    # 3. APIエンドポイント定義（30個）
    
    # アドレス関連
    @app.route('/api/addresses', methods=['GET'])
    @app.route('/api/addresses', methods=['POST'])
    @app.route('/api/addresses/<id>', methods=['PUT'])
    @app.route('/api/addresses/<id>', methods=['DELETE'])
    
    # グループ関連
    @app.route('/api/groups', methods=['GET'])
    @app.route('/api/groups', methods=['POST'])
    @app.route('/api/groups/<id>', methods=['PUT'])
    @app.route('/api/groups/<id>', methods=['DELETE'])
    
    # テンプレート関連
    @app.route('/api/templates', methods=['GET'])
    @app.route('/api/templates', methods=['POST'])
    @app.route('/api/templates/<id>', methods=['PUT'])
    @app.route('/api/templates/<id>', methods=['DELETE'])
    
    # 変数関連
    @app.route('/api/globals', methods=['GET'])
    @app.route('/api/globals', methods=['POST'])
    @app.route('/api/globals/<id>', methods=['PUT'])
    @app.route('/api/globals/<id>', methods=['DELETE'])
    
    # 4. SPAのルーティング
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # distフォルダからファイルを提供
        if path != '' and os.path.exists(os.path.join(DIST_DIR, path)):
            return send_from_directory(DIST_DIR, path)
        else:
            return send_from_directory(DIST_DIR, 'index.html')
    
    return app
```

**重要な機能**:
1. **CORS設定**: フロントエンドからのAPI呼び出しを許可
2. **データベース初期化**: 起動時にテーブルを自動作成
3. **REST API**: CRUD操作を提供
4. **SPA対応**: すべてのルートで`index.html`を返す

---

### 📄 backend/models.py
**役割**: データベースのテーブル定義

**構造**:
```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

# 1. Addressテーブル（アドレス帳）
class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"addr-{uuid.uuid4().hex[:8]}")
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    organization = db.Column(db.String(100))
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 2. Groupテーブル（グループ）
class Group(db.Model):
    __tablename__ = 'groups'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"grp-{uuid.uuid4().hex[:8]}")
    group_name = db.Column(db.String(100), nullable=False)
    member_ids = db.Column(db.Text)  # JSON文字列
    custom_attributes = db.Column(db.Text)  # JSON文字列
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 3. EmailTemplateテーブル（メールテンプレート）
class EmailTemplate(db.Model):
    __tablename__ = 'email_templates'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"tpl-{uuid.uuid4().hex[:8]}")
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(500))
    body = db.Column(db.Text)
    default_recipients = db.Column(db.Text)  # JSON文字列
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 4. GlobalVariableテーブル（グローバル変数）
class GlobalVariable(db.Model):
    __tablename__ = 'global_variables'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"var-{uuid.uuid4().hex[:8]}")
    key = db.Column(db.String(100), nullable=False, unique=True)
    value = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 5. AttributeDefinitionテーブル（属性定義）
class AttributeDefinition(db.Model):
    __tablename__ = 'attribute_definitions'
    
    id = db.Column(db.String(50), primary_key=True, default=lambda: f"atd-{uuid.uuid4().hex[:8]}")
    key = db.Column(db.String(100), nullable=False, unique=True)
    label = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

**データベース設計**:
```
addresses (アドレス帳)
├── id (主キー)
├── name (名前)
├── email (メール)
├── organization (組織)
├── department (部署)
└── created_at (作成日時)

groups (グループ)
├── id (主キー)
├── group_name (グループ名)
├── member_ids (メンバーID配列 - JSON)
├── custom_attributes (カスタム属性 - JSON)
└── created_at (作成日時)

email_templates (テンプレート)
├── id (主キー)
├── name (テンプレート名)
├── subject (件名)
├── body (本文)
├── default_recipients (デフォルト宛先 - JSON)
└── created_at (作成日時)

global_variables (グローバル変数)
├── id (主キー)
├── key (変数名)
├── value (値)
└── created_at (作成日時)

attribute_definitions (属性定義)
├── id (主キー)
├── key (キー)
├── label (ラベル)
└── created_at (作成日時)
```

---

### 📄 backend/requirements.txt
**役割**: Python依存パッケージのリスト

**内容**:
```
Flask==3.1.2
Flask-CORS==5.0.0
Flask-SQLAlchemy==3.1.1
SQLAlchemy==2.0.44
```

**インストール**:
```powershell
pip install -r backend/requirements.txt
```

---

## componentsフォルダ

### 📄 components/Layout.tsx
**役割**: アプリ全体のレイアウト（サイドバー+メインコンテンツ）

**構造**:
```tsx
export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen">
      {/* トグルボタン */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <IconClose /> : <IconMenu />}
      </button>
      
      {/* サイドバー */}
      <aside className={isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}>
        <h1>Outlook Mail Tool</h1>
        <nav>
          <button onClick={() => onChangeView(View.COMPOSE)}>メール作成</button>
          <button onClick={() => onChangeView(View.ADDRESS_BOOK)}>アドレス帳</button>
          <button onClick={() => onChangeView(View.GROUPS)}>グループ管理</button>
          <button onClick={() => onChangeView(View.TEMPLATES)}>テンプレート</button>
          <button onClick={() => onChangeView(View.VARIABLES)}>変数設定</button>
          <button onClick={() => onChangeView(View.IMPORT)}>データ取込</button>
        </nav>
      </aside>
      
      {/* メインコンテンツ */}
      <main className={isSidebarOpen ? 'md:ml-50' : 'ml-0'}>
        {children}
      </main>
    </div>
  );
};
```

**レイアウト図**:
```
┌────────────────────────────────────────────┐
│  [≡] Outlook Mail Tool        version 2.0.0│
├────────────┬───────────────────────────────┤
│  サイドバー  │     メインコンテンツ           │
│            │                               │
│ 📧 メール作成│  ← children が表示される      │
│ 📒 アドレス帳│                               │
│ 📁 グループ  │                               │
│ 📝 テンプレ  │                               │
│ ⚙️ 変数設定  │                               │
│ 📥 データ取込│                               │
│            │                               │
└────────────┴───────────────────────────────┘
```

---

### 📄 components/MailComposer.tsx
**役割**: メール作成画面

**構造**:
```tsx
export const MailComposer: React.FC = () => {
  // 状態管理
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState('');
  const [rawBody, setRawBody] = useState('');
  const [activeGroupContext, setActiveGroupContext] = useState<Group>();
  
  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* 左側: テンプレート選択 + 宛先リスト */}
      <div className="w-full md:w-1/3">
        {/* 1. テンプレート選択 */}
        <div className="bg-white p-5 rounded-xl">
          <select onChange={handleTemplateChange}>
            <option>(テンプレートなし)</option>
            {templates.map(t => <option>{t.name}</option>)}
          </select>
        </div>
        
        {/* 2. 宛先リスト */}
        <div className="bg-white p-5 rounded-xl">
          <Button onClick={() => setShowAddressPicker(true)}>追加</Button>
          {recipients.map(r => (
            <div className="flex items-center">
              <select value={r.type}>
                <option value="TO">TO</option>
                <option value="CC">CC</option>
                <option value="BCC">BCC</option>
              </select>
              <div className="animate-marquee-hover">{r.name}</div>
              <div className="animate-marquee-hover">{r.email}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 右側: 件名 + 本文 */}
      <div className="w-full md:w-2/3">
        <div contentEditable ref={subjectEditorRef} />
        <div contentEditable ref={bodyEditorRef} />
        <Button onClick={handleLaunchOutlook}>Outlookを起動</Button>
      </div>
    </div>
  );
};
```

**レイアウト図**:
```
┌─────────────────┬─────────────────────────────┐
│ テンプレート     │  件名: [編集可能]            │
│ [▼選択]         │                             │
├─────────────────┤                             │
│ 宛先リスト       │  本文: [編集可能]            │
│ [+ 追加]        │                             │
│                 │  {変数名} は自動でオレンジ色  │
│ ↑↓ TO  山田太郎 │  に表示される                │
│ ↑↓ CC  佐藤花子 │                             │
│ ↑↓ BCC 鈴木一郎 │                             │
│                 │                             │
│ (スクロール可能) │  (スクロール可能)            │
│                 │                             │
│                 │  [📧 Outlookを起動]         │
└─────────────────┴─────────────────────────────┘
```

**主な機能**:
1. テンプレート選択で件名・本文を自動入力
2. 宛先の追加・削除・並び替え
3. 変数 `{変数名}` の自動ハイライト
4. グループ選択で変数を置換
5. Outlook起動ボタンで`mailto:`リンクを開く

---

### 📄 components/AddressBook.tsx
**役割**: アドレス帳管理画面

**主な機能**:
```tsx
// 1. ソート機能
const [sortField, setSortField] = useState<string>('');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

// 2. フィルター機能
const [filterOrganization, setFilterOrganization] = useState('');
const [filterDepartment, setFilterDepartment] = useState('');

// 3. CRUD操作
const handleSave = async (address: Address) => {
  await saveAddress(address);
  fetchData();
};

const handleDelete = async (id: string) => {
  await deleteAddress(id);
  fetchData();
};
```

**画面イメージ**:
```
┌─────────────────────────────────────────────┐
│ アドレス帳                      [+ 新規追加] │
├─────────────────────────────────────────────┤
│ 🔍 フィルター                               │
│ 組織: [▼すべて]  部署: [▼すべて]  [✕ クリア]│
├─────────────────────────────────────────────┤
│ 名前 ↑ │ メール ↕ │ 組織 ↕ │ 部署 ↕ │ 操作 │
├────────┼──────────┼────────┼────────┼──────┤
│山田太郎│ yamada@  │ A社    │ 営業部 │ 編集 │
│佐藤花子│ sato@    │ B社    │ 開発部 │ 削除 │
│鈴木一郎│ suzuki@  │ C社    │ 総務部 │      │
│        │          │        │        │      │
│ (スクロール可能)                            │
└─────────────────────────────────────────────┘
```

---

### 📄 components/GroupManager.tsx
**役割**: グループ管理画面

**構造**:
```tsx
// 左側: グループ一覧
<div className="w-1/3">
  {groups.map(g => (
    <div onClick={() => setSelectedGroup(g)}>
      {g.group_name} ({g.member_ids.length}人)
    </div>
  ))}
</div>

// 右側: グループ詳細
<div className="w-2/3">
  <input value={selectedGroup.group_name} />
  
  {/* メンバー一覧 */}
  {selectedGroup.member_ids.map(id => {
    const addr = addresses.find(a => a.id === id);
    return <div>{addr.name}</div>;
  })}
  
  {/* カスタム属性 */}
  {selectedGroup.customAttributes.map(attr => (
    <div>
      {attr.key}: {attr.value}
    </div>
  ))}
</div>
```

---

### 📄 components/TemplateManager.tsx
**役割**: メールテンプレート管理画面

**主な機能**:
- テンプレートの作成・編集・削除
- 件名・本文の編集
- デフォルト宛先の設定

---

### 📄 components/VariableSettings.tsx
**役割**: 変数設定画面

**2種類の変数**:
1. **グローバル変数**: すべてのメールで使える
2. **グループ属性**: グループごとに異なる値

---

### 📄 components/DataImport.tsx
**役割**: CSVデータ取込画面

**機能**:
- CSVファイルのアップロード
- アドレス帳への一括登録

---

### 📄 components/ui/Button.tsx
**役割**: 再利用可能なボタンコンポーネント

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

---

### 📄 components/ui/Icons.tsx
**役割**: アイコンコンポーネント集

```tsx
// SVGアイコンを関数コンポーネント化
export const IconMail = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export const IconPeople = (props: React.SVGProps<SVGSVGElement>) => (
  // ... SVGパス
);

// 他のアイコンも同様
```

---

## servicesフォルダ

### 📄 services/mockApi.ts
**役割**: バックエンドAPIとの通信

**構造**:
```typescript
const API_BASE = 'http://127.0.0.1:5000/api';

// HTTP通信のユーティリティ
const httpGet = async (path: string) => {
  const r = await fetch(`${API_BASE}${path}`);
  return r.json();
};

const httpPost = async (path: string, body: any) => {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
};

// API関数
export const fetchAddresses = async (): Promise<Address[]> => 
  httpGet('/addresses');

export const saveAddress = async (item: Address): Promise<{ id: string }> => {
  if (item.id) {
    await httpPut(`/addresses/${item.id}`, item);
    return { id: item.id };
  }
  return httpPost('/addresses', item);
};

// 変数置換関数
export const resolveTextVariables = (
  text: string, 
  group?: Group, 
  globals?: GlobalVariable[]
): { text: string; html: string } => {
  // {本日} → yyyymmdd形式の日付
  const today = new Date();
  const todayStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
  resolvedText = replacer(resolvedText, '本日', todayStr);
  
  // グローバル変数を置換
  globals?.forEach(g => {
    resolvedText = replacer(resolvedText, g.key, g.value);
  });
  
  // グループ属性を置換
  group?.customAttributes?.forEach(attr => {
    resolvedText = replacer(resolvedText, attr.key, attr.value);
  });
  
  return { text: resolvedText, html: resolvedHtml };
};
```

---

## distフォルダ

### 役割
**ビルド済みフロントエンドの出力先**

**生成方法**:
```powershell
npm run build
```

**内容**:
```
dist/
├── index.html                  # ビルド済みHTML（最適化済み）
├── assets/
│   ├── index-[hash].js        # ビルド済みJavaScript（圧縮済み）
│   └── index-[hash].css       # ビルド済みCSS（圧縮済み）
└── OutlookMailTool.exe        # EXE作成後に追加される
```

**変換内容**:
```
開発時
├── index.html (オリジナル)
├── index.tsx (TypeScript)
├── App.tsx (TypeScript)
├── components/*.tsx (TypeScript)
└── index.css

↓ npm run build (Vite)

ビルド後 (dist/)
├── index.html (最適化済み、JS/CSSへのリンク含む)
└── assets/
    ├── index-xxxxx.js (全TSXファイルが1つに結合・圧縮)
    └── index-xxxxx.css (全CSSが1つに結合・圧縮)
```

---

## ビルド関連フォルダ

### 📁 build/
**役割**: PyInstallerの中間ファイル

**内容**:
- 依存関係の解析結果
- コンパイル済みPythonファイル
- ビルドログ

**削除しても問題なし**: 次回ビルド時に再生成される

---

### 📁 node_modules/
**役割**: Node.jsのパッケージ格納先

**サイズ**: 約200〜300MB

**インストール**:
```powershell
npm install
```

**Gitには含めない**: `.gitignore`で除外

---

### 📁 .venv/
**役割**: Python仮想環境

**作成**:
```powershell
python -m venv .venv
```

**Gitには含めない**: `.gitignore`で除外

---

## データフロー図

### メール作成の流れ

```
1. ユーザーがブラウザでメール作成画面を開く
   ↓
2. MailComposer.tsxがマウント
   ↓
3. useEffect()でAPIを呼び出し
   fetchTemplates()
   fetchAddresses()
   fetchGroups()
   fetchGlobals()
   ↓
4. services/mockApi.tsがHTTPリクエスト送信
   fetch('http://127.0.0.1:5000/api/templates')
   ↓
5. Flask (backend/app.py)がリクエストを受信
   @app.route('/api/templates', methods=['GET'])
   ↓
6. backend/models.pyからデータ取得
   EmailTemplate.query.all()
   ↓
7. SQLite (data.db)からデータ読み込み
   ↓
8. JSON形式でレスポンス
   [{"id": "tpl-xxx", "name": "挨拶メール", ...}]
   ↓
9. MailComposerの状態を更新
   setTemplates(data)
   ↓
10. 画面に表示
   <select>{templates.map(...)}</select>
```

### 変数置換の流れ

```
1. ユーザーが本文に {会社名} と入力
   ↓
2. rawBodyに保存
   setRawBody("こんにちは、{会社名}の皆様")
   ↓
3. グループを選択
   setActiveGroupContext(group)
   ↓
4. useEffectが発火
   useEffect(() => {
     const { html } = resolveTextVariables(rawBody, activeGroupContext, globals);
     bodyEditorRef.current.innerHTML = html;
   }, [activeGroupContext, globals])
   ↓
5. resolveTextVariables()で置換
   {会社名} → "株式会社ABC"（グループ属性から取得）
   {担当者名} → "山田太郎"（グローバル変数から取得）
   {本日} → "20251203"（システム変数）
   ↓
6. HTMLにハイライト追加
   <span style="color: #f97316; font-weight: bold;">株式会社ABC</span>
   ↓
7. 画面に反映
   bodyEditorRef.current.innerHTML = html
```

---

## 開発・本番環境の違い

### 開発環境

```
開発マシン
├── Python実行環境
│   └── python backend\app.py
│       → http://127.0.0.1:5000 (Flask)
│
├── Node.js実行環境
│   └── npm run dev
│       → http://localhost:3000 (Vite)
│
└── ブラウザ
    → http://localhost:3000 にアクセス
    → Viteがリクエストを処理
    → APIは http://127.0.0.1:5000 に転送
```

**特徴**:
- ホットリロード有効
- TypeScriptを逐次変換
- デバッグ情報が豊富
- 2つのサーバーが必要

---

### 本番環境（EXE）

```
ユーザーマシン
└── OutlookMailTool.exe
    ├── Python (内蔵)
    ├── Flask (内蔵)
    ├── dist/ (内蔵)
    └── SQLite (data.db)
    
起動すると...
├── main.py実行
│   ├── Flaskサーバー起動 (別スレッド)
│   │   → http://127.0.0.1:5000
│   └── ブラウザ起動
│       → http://127.0.0.1:5000
│
└── ブラウザ
    → http://127.0.0.1:5000 にアクセス
    → Flaskが dist/index.html を返す
    → dist/assets/*.js を読み込み
    → APIは同じFlaskサーバーに送信
```

**特徴**:
- 1つのEXEで完結
- Python/Node.js不要
- ビルド済みファイルを提供
- サーバーは1つだけ

---

## まとめ

### ファイルの役割一覧

| ファイル | 役割 | 変更頻度 |
|---------|------|---------|
| main.py | EXE起動制御 | 低 |
| backend/app.py | FlaskサーバーとAPI | 中 |
| backend/models.py | データベース定義 | 低 |
| components/*.tsx | 画面UI | 高 |
| services/mockApi.ts | API通信 | 中 |
| types.ts | 型定義 | 中 |
| index.css | カスタムCSS | 低 |
| outlook-mail-tool.spec | ビルド設定 | 低 |

### 開発の流れ

1. **フロントエンド開発**
   ```powershell
   npm run dev  # localhost:3000
   python backend\app.py  # localhost:5000
   ```

2. **機能追加・修正**
   - components/*.tsx を編集
   - 保存すると自動リロード

3. **ビルド**
   ```powershell
   npm run build  # dist/ に出力
   ```

4. **EXE作成**
   ```powershell
   pyinstaller outlook-mail-tool.spec
   ```

5. **配布**
   - `dist/OutlookMailTool.exe` を配布

---

**最終更新**: 2025年12月3日  
**バージョン**: 1.0.0  
**対象者**: 開発者・保守担当者
