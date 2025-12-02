"""
Outlook Mail Tool - EXE Entry Point
起動時にFlaskサーバーを開始し、ブラウザを自動起動
"""
import os
import sys
import webbrowser
import threading
import time
import socket
from backend.app import create_app

def resource_path(relative_path):
    """PyInstallerでバンドルされたリソースのパスを取得"""
    try:
        # PyInstallerで実行時
        base_path = sys._MEIPASS
    except Exception:
        # 通常のPython実行時
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

def check_server_ready(host, port, timeout=10):
    """サーバーが起動するまで待機"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                return True
        except:
            pass
        time.sleep(0.5)
    return False

def open_browser(url, host, port):
    """サーバー起動を待ってブラウザを開く"""
    print(f"サーバーの起動を待っています...")
    if check_server_ready(host, port):
        print(f"ブラウザを起動します: {url}")
        webbrowser.open(url)
    else:
        print(f"サーバーの起動に失敗しました。手動で {url} にアクセスしてください。")

def run_server(app, host, port):
    """Flaskサーバーを別スレッドで起動"""
    app.run(host=host, port=port, debug=False, use_reloader=False, threaded=True)

def main():
    try:
        print(f"==============================================")
        print(f"  Outlook Mail Tool v2.0.0")
        print(f"==============================================")
        print(f"")
        
        # データベースの保存場所を表示
        if getattr(sys, 'frozen', False):
            db_path = os.path.join(os.path.dirname(sys.executable), 'data.db')
        else:
            db_path = os.path.join(os.path.abspath('.'), 'data.db')
        print(f"データベース: {db_path}")
        print(f"")
        
        # Flaskアプリを作成
        print(f"アプリケーションを初期化しています...")
        app = create_app()
        print(f"初期化完了")
        
        port = 5000
        host = '127.0.0.1'
        url = f'http://{host}:{port}'
        
        print(f"サーバーを起動しています...")
        
        # Flaskサーバーを別スレッドで起動
        server_thread = threading.Thread(target=run_server, args=(app, host, port), daemon=True)
        server_thread.start()
        
        # ブラウザを別スレッドで起動
        browser_thread = threading.Thread(target=open_browser, args=(url, host, port), daemon=True)
        browser_thread.start()
        
        print(f"")
        print(f"アプリケーションが起動しました")
        print(f"URL: {url}")
        print(f"")
        print(f"終了するには Ctrl+C を押すか、このウィンドウを閉じてください")
        print(f"==============================================")
        
        # メインスレッドを維持（無限ループ）
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print(f"\nアプリケーションを終了しています...")
    except Exception as e:
        print(f"\n!!! エラーが発生しました !!!")
        print(f"エラー内容: {e}")
        print(f"エラー詳細:")
        import traceback
        traceback.print_exc()
        print(f"\n何かキーを押すと終了します...")
        input()

if __name__ == '__main__':
    main()
