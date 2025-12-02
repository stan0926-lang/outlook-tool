import os
import sys

# プロジェクトルートをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app
from backend.models import db, Address, Group, EmailTemplate, GlobalVariable, AttributeDefinition

app = create_app()

DEMO_ADDRESSES = [
  # 港区庁舎改修現場
  {"id":"addr-001","name":"山田 太郎","email":"yamada.taro@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"現場代理人"},
  {"id":"addr-002","name":"鈴木 花子","email":"suzuki.hanako@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"主任技術者"},
  {"id":"addr-003","name":"田中 浩","email":"tanaka.hiro@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"施工管理"},
  {"id":"addr-004","name":"佐藤 健","email":"sato.ken@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"施工管理"},
  {"id":"addr-005","name":"高橋 美咲","email":"takahashi.misaki@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"安全管理"},
  {"id":"addr-006","name":"伊藤 誠","email":"ito.makoto@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"品質管理"},
  {"id":"addr-007","name":"渡辺 由美","email":"watanabe.yumi@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"事務"},
  {"id":"addr-008","name":"中村 大輔","email":"nakamura.daisuke@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"資材管理"},
  {"id":"addr-009","name":"小林 一郎","email":"kobayashi.ichiro@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"作業員"},
  {"id":"addr-010","name":"加藤 恵子","email":"kato.keiko@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"作業員"},
  {"id":"addr-011","name":"吉田 修平","email":"yoshida.shuhei@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"協力業者"},
  {"id":"addr-012","name":"松本 真理","email":"matsumoto.mari@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"協力業者"},
  {"id":"addr-013","name":"木村 正樹","email":"kimura.masaki@city-minato.lg.jp","organization":"港区庁舎改修現場","department":"発注者"},
  {"id":"addr-014","name":"林 由香","email":"hayashi.yuka@city-minato.lg.jp","organization":"港区庁舎改修現場","department":"発注者"},
  {"id":"addr-015","name":"清水 裕太","email":"shimizu.yuta@abc-construction.co.jp","organization":"港区庁舎改修現場","department":"測量"},
  
  # 県立高校新築現場
  {"id":"addr-016","name":"山口 亮","email":"yamaguchi.ryo@abc-construction.co.jp","organization":"県立高校新築現場","department":"現場代理人"},
  {"id":"addr-017","name":"大野 さくら","email":"oono.sakura@abc-construction.co.jp","organization":"県立高校新築現場","department":"主任技術者"},
  {"id":"addr-018","name":"前田 健太","email":"maeda.kenta@abc-construction.co.jp","organization":"県立高校新築現場","department":"施工管理"},
  {"id":"addr-019","name":"藤原 美紀","email":"fujiwara.miki@abc-construction.co.jp","organization":"県立高校新築現場","department":"施工管理"},
  {"id":"addr-020","name":"坂本 勇","email":"sakamoto.isamu@abc-construction.co.jp","organization":"県立高校新築現場","department":"安全管理"},
  {"id":"addr-021","name":"内田 真由美","email":"uchida.mayumi@abc-construction.co.jp","organization":"県立高校新築現場","department":"品質管理"},
  {"id":"addr-022","name":"森田 聡","email":"morita.satoshi@abc-construction.co.jp","organization":"県立高校新築現場","department":"事務"},
  {"id":"addr-023","name":"長谷川 麗","email":"hasegawa.rei@abc-construction.co.jp","organization":"県立高校新築現場","department":"資材管理"},
  {"id":"addr-024","name":"西村 隆志","email":"nishimura.takashi@abc-construction.co.jp","organization":"県立高校新築現場","department":"作業員"},
  {"id":"addr-025","name":"石川 愛","email":"ishikawa.ai@abc-construction.co.jp","organization":"県立高校新築現場","department":"作業員"},
  {"id":"addr-026","name":"池田 正人","email":"ikeda.masato@abc-construction.co.jp","organization":"県立高校新築現場","department":"協力業者"},
  {"id":"addr-027","name":"橋本 千春","email":"hashimoto.chiharu@abc-construction.co.jp","organization":"県立高校新築現場","department":"協力業者"},
  {"id":"addr-028","name":"遠藤 修","email":"endo.osamu@kanagawa-edu.jp","organization":"県立高校新築現場","department":"発注者"},
  {"id":"addr-029","name":"青木 直美","email":"aoki.naomi@kanagawa-edu.jp","organization":"県立高校新築現場","department":"発注者"},
  {"id":"addr-030","name":"村上 大介","email":"murakami.daisuke@abc-construction.co.jp","organization":"県立高校新築現場","department":"測量"},
  
  # 病院増築現場
  {"id":"addr-031","name":"野村 幸一","email":"nomura.koichi@abc-construction.co.jp","organization":"病院増築現場","department":"現場代理人"},
  {"id":"addr-032","name":"岡田 優子","email":"okada.yuko@abc-construction.co.jp","organization":"病院増築現場","department":"主任技術者"},
  {"id":"addr-033","name":"三浦 和也","email":"miura.kazuya@abc-construction.co.jp","organization":"病院増築現場","department":"施工管理"},
  {"id":"addr-034","name":"近藤 香織","email":"kondo.kaori@abc-construction.co.jp","organization":"病院増築現場","department":"施工管理"},
  {"id":"addr-035","name":"原田 剛","email":"harada.tsuyoshi@abc-construction.co.jp","organization":"病院増築現場","department":"安全管理"},
  {"id":"addr-036","name":"中島 真紀","email":"nakajima.maki@abc-construction.co.jp","organization":"病院増築現場","department":"品質管理"},
  {"id":"addr-037","name":"平野 雅人","email":"hirano.masato@abc-construction.co.jp","organization":"病院増築現場","department":"事務"},
  {"id":"addr-038","name":"井上 沙織","email":"inoue.saori@abc-construction.co.jp","organization":"病院増築現場","department":"資材管理"},
  {"id":"addr-039","name":"福田 達也","email":"fukuda.tatsuya@abc-construction.co.jp","organization":"病院増築現場","department":"作業員"},
  {"id":"addr-040","name":"横山 綾","email":"yokoyama.aya@abc-construction.co.jp","organization":"病院増築現場","department":"作業員"},
  {"id":"addr-041","name":"宮本 洋平","email":"miyamoto.yohei@abc-construction.co.jp","organization":"病院増築現場","department":"協力業者"},
  {"id":"addr-042","name":"川口 恵美","email":"kawaguchi.emi@abc-construction.co.jp","organization":"病院増築現場","department":"協力業者"},
  {"id":"addr-043","name":"山崎 博文","email":"yamazaki.hirofumi@aoyama-hospital.or.jp","organization":"病院増築現場","department":"発注者"},
  {"id":"addr-044","name":"須藤 加奈","email":"sudo.kana@aoyama-hospital.or.jp","organization":"病院増築現場","department":"発注者"},
  {"id":"addr-045","name":"北川 俊介","email":"kitagawa.shunsuke@abc-construction.co.jp","organization":"病院増築現場","department":"測量"},
  {"id":"addr-046","name":"杉山 智子","email":"sugiyama.tomoko@abc-construction.co.jp","organization":"病院増築現場","department":"作業員"}
]

DEMO_GROUPS = [
  {"id":"grp-001","group_name":"港区庁舎改修現場","memberIds":["addr-001","addr-002","addr-003","addr-004","addr-005","addr-006","addr-007","addr-008","addr-009","addr-010","addr-011","addr-012","addr-013","addr-014","addr-015"],"customAttributes":[
    {"key":"現場名","value":"港区役所第二庁舎改修工事"},
    {"key":"工事番号","value":"2024-K-0123"},
    {"key":"現場責任者","value":"山田 太郎"},
    {"key":"工期","value":"2024年4月1日～2025年3月31日"},
    {"key":"契約金額","value":"3億2,500万円"}
  ]},
  {"id":"grp-002","group_name":"県立高校新築現場","memberIds":["addr-016","addr-017","addr-018","addr-019","addr-020","addr-021","addr-022","addr-023","addr-024","addr-025","addr-026","addr-027","addr-028","addr-029","addr-030"],"customAttributes":[
    {"key":"現場名","value":"神奈川県立横浜南高等学校新築工事"},
    {"key":"工事番号","value":"2024-K-0456"},
    {"key":"現場責任者","value":"山口 亮"},
    {"key":"工期","value":"2024年6月1日～2026年2月28日"},
    {"key":"契約金額","value":"12億8,000万円"}
  ]},
  {"id":"grp-003","group_name":"病院増築現場","memberIds":["addr-031","addr-032","addr-033","addr-034","addr-035","addr-036","addr-037","addr-038","addr-039","addr-040","addr-041","addr-042","addr-043","addr-044","addr-045","addr-046"],"customAttributes":[
    {"key":"現場名","value":"青山総合病院外来棟増築工事"},
    {"key":"工事番号","value":"2024-B-0789"},
    {"key":"現場責任者","value":"野村 幸一"},
    {"key":"工期","value":"2024年7月15日～2025年12月20日"},
    {"key":"契約金額","value":"8億4,200万円"}
  ]}
]

DEMO_TEMPLATES = [
  {"id":"tpl-001","title":"【現場】日報提出","subject":"【{現場名}】本日の作業報告（{メール送付者名}）","body":"各位\n\nお疲れ様です。{メール送付者名}です。\n{現場名}（工事番号：{工事番号}）の本日の作業内容を報告いたします。\n\n■本日の作業内容\n・\n\n■作業人員\n・\n\n■明日の予定\n・\n\n■連絡事項\n・\n\n以上、よろしくお願いいたします。\n\n----\n{会社名}\n{メール送付者名}","defaultRecipients":[{"addressId":"addr-001","type":"TO"}]},
  {"id":"tpl-002","title":"【発注者】施工状況報告","subject":"【{工事番号}】{現場名} 施工状況報告","body":"{現場責任者}様\n\nいつもお世話になっております。{会社名}の{メール送付者名}です。\n\n{現場名}（工事番号：{工事番号}）の本日の施工状況をご報告いたします。\n\n■本日の作業内容\n・\n\n■進捗状況\n予定出来高：○○%\n実績出来高：○○%\n\n■明日の予定\n・\n\n■課題・調整事項\n・\n\nご確認のほど、よろしくお願いいたします。","defaultRecipients":[{"addressId":"addr-013","type":"TO"},{"addressId":"addr-001","type":"CC"}]},
  {"id":"tpl-003","title":"【発注者】月次報告","subject":"【{工事番号}】{現場名} 月次進捗報告","body":"ご担当者様\n\n平素より大変お世話になっております。\n{会社名}の{メール送付者名}です。\n\n{現場名}（工事番号：{工事番号}）の今月の進捗状況をご報告いたします。\n\n■出来高進捗率\n予定：○○%\n実績：○○%\n\n■今月の主な施工内容\n・\n\n■来月の予定\n・\n\n■課題・調整事項\n・\n\n引き続きよろしくお願いいたします。\n\n----\n{会社名}\n現場責任者：{現場責任者}\n連絡先：{本社電話番号}","defaultRecipients":[{"addressId":"addr-013","type":"TO"},{"addressId":"addr-001","type":"CC"}]},
  {"id":"tpl-004","title":"【現場】安全協議会開催通知","subject":"【{現場名}】安全協議会開催のご案内","body":"現場関係者各位\n\nお疲れ様です。{会社名}の{メール送付者名}です。\n\n{現場名}（工事番号：{工事番号}）の安全協議会を下記の通り開催いたしますので、ご出席をお願いいたします。\n\n【日時】令和○年○月○日（○）○○:○○～\n【場所】{現場名} 現場事務所\n【議題】\n・今月の労災発生状況\n・次月の重点安全管理事項\n・新規入場者教育について\n・KY活動の実施状況\n\n※ご欠席の場合は事前にご連絡ください。\n\n以上、よろしくお願いいたします。\n\n----\n{会社名}\n安全管理：{メール送付者名}\n{本社電話番号}","defaultRecipients":[{"addressId":"addr-011","type":"TO"},{"addressId":"addr-012","type":"TO"}]},
  {"id":"tpl-005","title":"【全現場】安全パトロール実施報告","subject":"【全現場】安全パトロール実施結果のご報告","body":"現場代理人各位\n\nお疲れ様です。{メール送付者名}です。\n\n本日実施した全社安全パトロールの結果をご報告いたします。\n\n■実施日時\n令和○年○月○日（○）\n\n■巡回現場\n・港区庁舎改修現場\n・県立高校新築現場\n・病院増築現場\n\n■主な指摘事項\n・\n\n■好事例\n・\n\n■今後の対応方針\n各現場責任者は、指摘事項について速やかに是正対応をお願いいたします。\n次回パトロールは○月○日を予定しております。\n\n以上、よろしくお願いいたします。\n\n----\n{会社名} 安全管理部\n{メール送付者名}","defaultRecipients":[{"addressId":"addr-001","type":"TO"},{"addressId":"addr-016","type":"TO"},{"addressId":"addr-031","type":"TO"}]},
  {"id":"tpl-006","title":"【発注者】工期変更協議のお願い","subject":"【{工事番号}】{現場名} 工期変更協議のお願い","body":"ご担当者様\n\n平素より大変お世話になっております。\n{会社名}の{メール送付者名}です。\n\n{現場名}（工事番号：{工事番号}）につきまして、下記の理由により工期の変更をご協議いただきたくご連絡いたしました。\n\n■変更理由\n・\n\n■現行工期\n{工期}\n\n■変更後工期（案）\n着工：令和○年○月○日\n完成：令和○年○月○日\n※○日間の延期\n\n■対応方針\n・工程の見直しと人員の増強\n・作業時間の延長による挽回\n\nつきましては、工期変更についてご協議の機会をいただけますと幸いです。\nご検討のほど、何卒よろしくお願い申し上げます。\n\n----\n{会社名}\n{本社住所}\nTEL: {本社電話番号}\n現場責任者：{現場責任者}\n担当：{メール送付者名}","defaultRecipients":[{"addressId":"addr-013","type":"TO"},{"addressId":"addr-001","type":"CC"}]}
]

DEMO_GLOBALS = [
  {"id":"gvar-001","key":"メール送付者名","value":"山田"},
  {"id":"gvar-002","key":"会社名","value":"ABC建設株式会社"},
  {"id":"gvar-003","key":"本社住所","value":"東京都港区芝5-1-1"},
  {"id":"gvar-004","key":"本社電話番号","value":"03-1234-5678"}
]

DEMO_ATTR_DEFS = [
  {"id":"atdef-001","key":"現場名","label":"プロジェクトや現場の名称"},
  {"id":"atdef-002","key":"工事番号","label":"工事管理番号"},
  {"id":"atdef-003","key":"現場責任者","label":"現場担当者名"},
  {"id":"atdef-004","key":"工期","label":"工事開始日〜完了予定日"},
  {"id":"atdef-005","key":"契約金額","label":"請負契約金額"}
]

with app.app_context():
    # データベースをリセット
    db.drop_all()
    db.create_all()
    
    # Addresses
    for a in DEMO_ADDRESSES:
        addr = Address(id=a['id'], name=a['name'], email=a['email'], organization=a.get('organization'), department=a.get('department'))
        db.session.add(addr)

    # Groups
    for g in DEMO_GROUPS:
        grp = Group(id=g['id'], group_name=g['group_name'], member_ids=g.get('memberIds', []), custom_attributes=g.get('customAttributes', []))
        db.session.add(grp)

    # Templates
    for t in DEMO_TEMPLATES:
        tpl = EmailTemplate(id=t['id'], title=t.get('title'), subject=t.get('subject'), body=t.get('body'), default_recipients=t.get('defaultRecipients', []))
        db.session.add(tpl)

    # Globals
    for g in DEMO_GLOBALS:
        gv = GlobalVariable(id=g['id'], key=g['key'], value=g['value'])
        db.session.add(gv)

    # AttrDefs
    for a in DEMO_ATTR_DEFS:
        ad = AttributeDefinition(id=a['id'], key=a['key'], label=a.get('label'))
        db.session.add(ad)

    db.session.commit()
    print("✓ デモデータを登録しました！")
    print(f"  - アドレス: {len(DEMO_ADDRESSES)}件")
    print(f"  - グループ: {len(DEMO_GROUPS)}件")
    print(f"  - テンプレート: {len(DEMO_TEMPLATES)}件")
    print(f"  - グローバル変数: {len(DEMO_GLOBALS)}件")
    print(f"  - 属性定義: {len(DEMO_ATTR_DEFS)}件")
