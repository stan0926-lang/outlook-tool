# Outlook Mail Tool - ビルド手順

## 📦 EXE化の手順

### 1. 必要なパッケージをインストール

```powershell
.\.venv\Scripts\Activate.ps1
pip install pyinstaller
```

### 2. フロントエンドをビルド

```powershell
npm run build
```

### 3. PyInstallerでEXE作成

```powershell
pyinstaller outlook-mail-tool.spec
```

ビルドが完了すると `dist\OutlookMailTool.exe` が生成されます。

### 4. 実行

```powershell
.\dist\OutlookMailTool.exe
```

## 📋 配布方法

### オプション1: EXE単体配布（推奨）

`dist\OutlookMailTool.exe` を配布
- サイズ: 約30-50MB
- data.dbは実行ファイルと同じフォルダに自動作成されます

### オプション2: ZIPで配布

```powershell
# distフォルダを圧縮
Compress-Archive -Path dist\* -DestinationPath OutlookMailTool.zip
```

## 🔧 トラブルシューティング

### エラー: "Failed to execute script"

- `console=True` を確認（.specファイル）
- コンソールウィンドウでエラーメッセージを確認

### エラー: "ModuleNotFoundError"

- `hiddenimports` に不足モジュールを追加（.specファイル）

### ブラウザが開かない

- ポート5000が使用中の可能性
- main.pyのport番号を変更

### data.dbが見つからない

- EXE実行時、カレントディレクトリに作成されます
- 初回起動時は空のDBが作成されます

## 📝 注意事項

- **初回起動**: データベースが空の状態で起動します
- **データ移行**: 既存のdata.dbをEXEと同じフォルダにコピーしてください
- **Windows Defender**: 初回実行時にセキュリティ警告が出る場合があります
- **ファイアウォール**: ローカルサーバー(127.0.0.1:5000)の許可が必要な場合があります

## 🎨 カスタマイズ

### アイコンを変更

1. .icoファイルを準備
2. outlook-mail-tool.specを編集:
```python
icon='path/to/icon.ico'
```

### コンソールを非表示

.specファイルを編集:
```python
console=False  # コンソール非表示（本番用）
```

## 📊 ビルドサイズの最適化

### UPX圧縮（既に有効）
```python
upx=True  # .specファイルで設定済み
```

### 不要なモジュールを除外
```python
excludes=['tkinter', 'matplotlib', 'numpy']  # 使っていないモジュール
```
