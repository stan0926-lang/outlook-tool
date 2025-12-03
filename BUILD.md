# Outlook Mail Tool - EXEファイル作成ガイド 📦

このガイドでは、Outlook Mail Toolを配布用のEXEファイルにする方法を、初心者の方にもわかりやすく丁寧に説明します。

> ✅ **前提条件**: フロントエンド（React）は既にビルド済みで、`dist/`フォルダに保存されています。

---

## 📋 目次

1. [EXE化の仕組み](#exe化の仕組み)
2. [必要な環境](#必要な環境)
3. [事前準備](#事前準備)
4. [ステップ1: Python環境のセットアップ](#ステップ1-python環境のセットアップ)
5. [ステップ2: EXEファイルの作成](#ステップ2-exeファイルの作成)
6. [ステップ3: 動作確認](#ステップ3-動作確認)
7. [配布方法](#配布方法)
8. [トラブルシューティング](#トラブルシューティング)

---

## EXE化の仕組み

### 📂 プロジェクトの構成

```
outlook-app/
├── main.py                 ← EXE起動のエントリーポイント
├── backend/
│   ├── app.py             ← Flaskサーバーの本体
│   ├── models.py          ← データベース定義
│   └── requirements.txt   ← 必要なライブラリ
├── dist/                  ← ビルド済みフロントエンド（重要！）
│   ├── index.html
│   └── assets/
│       ├── index-xxxxx.js
│       └── index-xxxxx.css
└── outlook-mail-tool.spec ← PyInstallerの設定ファイル
```

### 🔄 EXE化の流れ

```
1. main.py (Pythonコード)
   ↓
2. PyInstaller (変換ツール)
   ↓
3. dist/OutlookMailTool.exe (完成したEXE)
   ├── Python本体を内蔵
   ├── Flaskライブラリを内蔵
   ├── フロントエンド(HTML/JS/CSS)を内蔵
   └── データベース機能を内蔵
```

**重要**: EXEを実行すると、中でFlaskサーバーが起動し、ブラウザで画面が表示されます。

---

## 必要な環境

### ✅ 必須

1. **Python 3.8以降**
   - ダウンロード: https://www.python.org/downloads/
   - インストール時に「Add Python to PATH」にチェック

2. **Pythonパッケージ**
   - Flask、SQLAlchemy など（後でインストールします）

### ❌ 不要（既にビルド済みのため）

- Node.js
- npm

### 確認方法

PowerShellを開いて実行:
```powershell
python --version
```

**期待される出力**:
```
Python 3.12.x
```

---

## 事前準備

### 1. distフォルダの確認

フロントエンドがビルド済みか確認します。

```powershell
cd C:\Users\kagam\Desktop\outlook-app
dir dist
```

**確認ポイント**:
```
dist/
├── index.html           ← あるべき
└── assets/
    ├── index-xxxxx.js   ← あるべき
    └── index-xxxxx.css  ← あるべき
```

**❌ もしdistフォルダが空の場合**:
```powershell
npm run build
```
でビルドしてください。

### 2. プロジェクトファイルの確認

以下のファイルが存在するか確認:

```powershell
dir main.py
dir backend\app.py
dir backend\models.py
dir backend\requirements.txt
dir outlook-mail-tool.spec
```

すべて「見つかりました」と表示されればOK！

---

## ステップ1: Python環境のセットアップ

### 1-1. プロジェクトフォルダに移動

```powershell
cd C:\Users\kagam\Desktop\outlook-app
```

### 1-2. 仮想環境を作成

```powershell
python -m venv .venv
```

**何が起こる？**
- `.venv`という名前のフォルダが作成されます
- このフォルダに独立したPython環境が構築されます
- プロジェクト専用の環境なので、他のプロジェクトに影響しません

**処理時間**: 30秒〜1分

**成功のサイン**:
```
.venv/
├── Scripts/
├── Lib/
└── pyvenv.cfg
```

### 1-3. 仮想環境を有効化

```powershell
.\.venv\Scripts\Activate.ps1
```

**成功のサイン**:
プロンプトの先頭に `(.venv)` が表示されます:
```
(.venv) PS C:\Users\kagam\Desktop\outlook-app>
```

**⚠️ エラーが出た場合**:

```
.\.venv\Scripts\Activate.ps1 : このシステムではスクリプトの実行が無効になっています...
```

以下を実行してから再試行:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 1-4. 必要なライブラリをインストール

```powershell
pip install -r backend/requirements.txt
```

**何が起こる？**
- Flask（Webサーバー）
- Flask-CORS（クロスオリジン対応）
- Flask-SQLAlchemy（データベース）
- などがインストールされます

**処理時間**: 1〜3分

**成功のサイン**:
```
Successfully installed Flask-3.1.2 SQLAlchemy-2.0.44 flask-cors-5.0.0 ...
```

### 1-5. PyInstallerをインストール

```powershell
pip install pyinstaller
```

**PyInstallerとは？**
- Pythonプログラムを実行可能なEXEファイルに変換するツール
- Pythonがインストールされていない環境でも動くEXEを作成できます

**処理時間**: 30秒〜1分

**成功のサイン**:
```
Successfully installed pyinstaller-6.17.0 ...
```

---

## ステップ2: EXEファイルの作成

### 2-1. 古いビルドファイルを削除（推奨）

```powershell
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Force "dist\OutlookMailTool.exe" -ErrorAction SilentlyContinue
```

**なぜ削除？**
- 古いファイルが残っていると、新しいコードが正しく反映されない場合があります
- クリーンな状態でビルドすることで、エラーを防ぎます

**注意**: フロントエンドの`dist`フォルダは削除されません（EXEファイルだけ削除）

### 2-2. PyInstallerでEXEを作成

```powershell
pyinstaller outlook-mail-tool.spec
```

**何が起こる？**

1. **解析フェーズ** (0〜30秒)
   ```
   INFO: Analyzing main.py
   INFO: Processing dependencies...
   ```
   - main.pyを解析
   - 必要なライブラリをすべて検出

2. **収集フェーズ** (30秒〜1分)
   ```
   INFO: Looking for dynamic libraries
   INFO: Analyzing hidden imports
   ```
   - Flaskなどのライブラリを収集
   - distフォルダ（フロントエンド）を収集

3. **ビルドフェーズ** (1〜2分)
   ```
   INFO: Building PKG
   INFO: Building EXE
   ```
   - すべてを1つのEXEにまとめる
   - 圧縮・最適化

**合計処理時間**: 2〜3分（コーヒーブレイク☕）

### 2-3. ビルドプロセスの進行状況

以下のようなメッセージがたくさん表示されます:

```
294 INFO: PyInstaller: 6.17.0, contrib hooks: 2025.10
294 INFO: Python: 3.12.3
345 INFO: Platform: Windows-11-10.0.xxxxx-SP0
...
INFO: Processing standard module hook 'hook-flask.py'
...
WARNING: Hidden import "pysqlite2" not found!
...
INFO: Building EXE from EXE-00.toc
INFO: Copying bootloader EXE to dist\OutlookMailTool.exe
...
INFO: Building EXE from EXE-00.toc completed successfully.
```

**⚠️ WARNINGは気にしないでOK**: 多くの警告が出ますが、ほとんど無視して大丈夫です。

**✅ 最後に以下が表示されれば成功**:
```
INFO: Building EXE from EXE-00.toc completed successfully.
```

### 2-4. 完成確認

```powershell
dir dist
```

**期待される出力**:
```
dist/
├── assets/                       ← フロントエンド（旧）
├── index.html                    ← フロントエンド（旧）
└── OutlookMailTool.exe          ← 完成したEXEファイル！
```

**EXEファイルのサイズ**: 約100〜150MB

**なぜこんなに大きい？**
- Python本体（約30MB）
- Flask、SQLAlchemyなどのライブラリ（約50MB）
- フロントエンド（HTML/JS/CSS）（約1MB）
- その他の依存ファイル

すべてが1つのEXEに含まれているためです。

---

## ステップ3: 動作確認

### 3-1. EXEファイルを起動

`dist`フォルダ内の`OutlookMailTool.exe`をダブルクリック！

### 3-2. 期待される動作

#### ① コンソールウィンドウが開く

```
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
サーバーの起動を待っています...
ブラウザを起動します: http://127.0.0.1:5000
```

**コンソールは閉じないでください**！サーバーが動いています。

#### ② ブラウザが自動で開く

- アドレスバーに `http://127.0.0.1:5000` が表示される
- Outlook Mail Toolの画面が表示される

#### ③ 動作確認

以下の機能を試してください:

1. **アドレス帳**: 登録されている連絡先が表示される
2. **グループ管理**: グループの一覧が表示される
3. **テンプレート**: メールテンプレートが表示される
4. **メール作成**: テンプレートを選んで宛先を追加

すべて動作すれば成功です！🎉

### 3-3. 終了方法

1. ブラウザを閉じる
2. コンソールウィンドウで `Ctrl + C` を押す
3. または、コンソールウィンドウの ✕ をクリック

---

## 配布方法

### 📦 配布パッケージの構成（推奨）

```
Outlook_Mail_Tool_v1.0/
├── OutlookMailTool.exe    ← EXEファイル本体
├── README.txt             ← 使い方の説明
└── INSTALL.txt            ← インストール手順
```

### 📄 README.txt の例

```
# Outlook Mail Tool

## 概要
メールの一斉送信を効率化するツールです。

## 使い方
1. OutlookMailTool.exe をダブルクリック
2. ブラウザが自動で開きます
3. アドレス帳、グループ、テンプレートを設定
4. メール作成画面で宛先を選択してメールを作成

## 注意事項
- 初回起動時にファイアウォールの警告が出る場合があります
  → 「アクセスを許可する」を選択してください
- コンソールウィンドウは閉じないでください
- データは data.db ファイルに保存されます

## トラブルシューティング
- ブラウザが開かない場合: 手動で http://localhost:5000 にアクセス
- ポート5000が使用中のエラー: 他のアプリケーションを終了してください

## サポート
問題があればお問い合わせください。
```

### 📦 配布方法

#### 方法1: ZIPファイルで配布
```powershell
# PowerShellで圧縮
Compress-Archive -Path "dist\OutlookMailTool.exe","README.txt" -DestinationPath "OutlookMailTool_v1.0.zip"
```

#### 方法2: ネットワークドライブで共有
```
\\共有サーバー\ツール\OutlookMailTool\
└── OutlookMailTool.exe
```

#### 方法3: USBメモリで配布
EXEファイルをUSBにコピーして配布

---

## トラブルシューティング

### ❌ エラー1: `python: command not found`

**原因**: Pythonがインストールされていない、またはPATHが通っていない

**解決策**:
1. Pythonを再インストール（「Add Python to PATH」にチェック）
2. PowerShellを再起動
3. PCを再起動

### ❌ エラー2: `.venv\Scripts\Activate.ps1 cannot be loaded`

**原因**: PowerShellの実行ポリシーが制限されている

**解決策**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ エラー3: `ModuleNotFoundError: No module named 'flask'`

**原因**: 必要なライブラリがインストールされていない

**解決策**:
```powershell
# 仮想環境が有効になっているか確認（(.venv)が表示されているか）
.\.venv\Scripts\Activate.ps1

# ライブラリを再インストール
pip install -r backend/requirements.txt
```

### ❌ エラー4: `FileNotFoundError: [Errno 2] No such file or directory: 'dist'`

**原因**: distフォルダが存在しない、またはビルドされていない

**解決策**:
```powershell
npm run build
```

### ❌ エラー5: PyInstallerのビルド中に大量のWARNINGが出る

**原因**: 正常です。ほとんどの警告は無視して大丈夫

**確認ポイント**:
- 最後に `completed successfully` と表示されているか
- `dist\OutlookMailTool.exe` が生成されているか

### ❌ エラー6: EXE起動後にブラウザが開かない

**原因**: ブラウザの自動起動に失敗した

**解決策**:
手動でブラウザを開いて `http://localhost:5000` にアクセス

### ❌ エラー7: `Port 5000 is already in use`

**原因**: 別のアプリケーションがポート5000を使用中

**解決策**:
```powershell
# ポートを使用しているプロセスを確認
netstat -ano | findstr :5000

# プロセスIDを確認して終了
taskkill /PID [プロセスID] /F
```

### ❌ エラー8: ウイルス対策ソフトが警告を出す

**原因**: PyInstallerで作成したEXEは誤検知されることがあります

**解決策**:
- ウイルス対策ソフトのホワイトリストに追加
- または、社内のIT部門に確認

### ❌ エラー9: data.dbが見つからない

**原因**: データベースファイルが生成されていない

**解決策**:
初回起動時に自動生成されます。EXEと同じフォルダに作成されます。

### ❌ エラー10: EXEのサイズが大きすぎる

**原因**: Python本体とライブラリがすべて含まれているため

**対策**:
- 仕様です。配布時は圧縮（ZIP）を推奨
- または、インストーラー作成ツールを使用

---

## 📚 補足情報

### EXEファイルの中身

```
OutlookMailTool.exe
├── Python 3.12 本体
├── Flask ライブラリ
├── SQLAlchemy ライブラリ
├── main.py (コンパイル済み)
├── backend/app.py (コンパイル済み)
├── backend/models.py (コンパイル済み)
└── dist/ (フロントエンド)
    ├── index.html
    └── assets/
        ├── index-xxxxx.js
        └── index-xxxxx.css
```

### outlook-mail-tool.spec の役割

このファイルはPyInstallerの設定ファイルです:

```python
datas=[
    ('dist', 'dist'),  # distフォルダをEXEに含める
    ('backend/models.py', 'backend'),  # models.pyを含める
],
```

**カスタマイズ例**:
- アイコンを変更: `icon='icon.ico'`
- コンソールを非表示: `console=False`
- ファイル名を変更: `name='MyApp'`

### データの保存場所

- **開発時**: プロジェクトフォルダに`data.db`
- **EXE実行時**: EXEと同じフォルダに`data.db`

ユーザーのデータは`data.db`に保存されるため、配布時に初期データを含めたい場合は、あらかじめ`data.db`を作成しておいて一緒に配布します。

### 再ビルドの手順

コードを修正した後:

```powershell
# 1. フロントエンドを修正した場合
npm run build

# 2. バックエンド(Python)を修正した場合
# （buildは不要、直接EXE化）

# 3. 古いビルドを削除
Remove-Item -Recurse -Force build
Remove-Item "dist\OutlookMailTool.exe"

# 4. 再ビルド
pyinstaller outlook-mail-tool.spec
```

---

## 🎓 よくある質問

### Q1: 他のPCでも動きますか？
**A**: はい！Pythonがインストールされていない環境でも動作します。ただし、Windows専用です。

### Q2: EXEファイルだけで配布できますか？
**A**: はい。EXEファイル1つだけで配布可能です。ただし、初回起動時にdata.dbが自動生成されます。

### Q3: Macでも動きますか？
**A**: このガイドはWindows用です。Macの場合は別途設定が必要で、.app形式になります。

### Q4: ビルドのたびにdistフォルダを削除すべき？
**A**: EXEファイルだけ削除してください。フロントエンドのdistフォルダは残しておきます。

### Q5: インストーラーは作れますか？
**A**: はい。Inno SetupやNSISなどのツールでインストーラーを作成できます。

### Q6: アップデート方法は？
**A**: 新しいEXEファイルを配布して、古いものと置き換えてもらいます。data.dbは残すようにユーザーに指示してください。

### Q7: Node.jsは本当に不要ですか？
**A**: distフォルダにビルド済みファイルがあれば不要です。フロントエンドを修正する場合のみNode.jsが必要になります。

### Q8: データベースは？
**A**: SQLiteを使用しており、data.dbファイルに保存されます。別途データベースサーバーは不要です。

---

## 🎉 完成おめでとうございます！

このガイドに従って、配布用のEXEファイルが完成しました。

**重要なポイントのおさらい**:
- ✅ distフォルダ（フロントエンド）が必要
- ✅ PyInstallerでPythonをEXE化
- ✅ EXE内にFlaskサーバーとフロントエンドを内蔵
- ✅ 配布はEXEファイル1つでOK

**次のステップ**:
1. ✅ 社内でテスト配布
2. ✅ フィードバックを収集
3. ✅ 必要に応じて改良

---

**最終更新**: 2025年12月3日  
**バージョン**: 1.0.0  
**対象者**: Outlook Mail Tool 開発者

---

## 📞 サポート

質問や問題があれば、開発チームにお問い合わせください。

**Happy Deployment! 🚀**
