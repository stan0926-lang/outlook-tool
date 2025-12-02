import os
import sys
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# 開発時とEXE実行時の両方に対応
try:
    from backend.models import db, Address, Group, EmailTemplate, GlobalVariable, AttributeDefinition
except ModuleNotFoundError:
    from models import db, Address, Group, EmailTemplate, GlobalVariable, AttributeDefinition

# PyInstaller実行時は_MEIPASSを使用、通常実行時はカレントディレクトリ
if getattr(sys, 'frozen', False):
    # EXE実行時: 実行ファイルのあるフォルダ
    BASE_DIR = os.path.dirname(sys.executable)
    DIST_DIR = os.path.join(sys._MEIPASS, 'dist')
else:
    # 通常のPython実行時
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DIST_DIR = os.path.join(BASE_DIR, '..', 'dist')

# data.dbは常にEXE/スクリプトと同じフォルダに保存
DATA_DB = os.path.join(BASE_DIR if getattr(sys, 'frozen', False) else os.path.abspath(os.path.join(BASE_DIR, '..')), 'data.db')

def normalize_member_ids(member_ids):
    """
    member_idsを正規化: 旧形式(文字列配列)を新形式(オブジェクト配列)に変換
    新形式: [{"id": "addr-xxx", "recipientType": "to", "order": 0}, ...]
    """
    if not member_ids:
        return []
    if isinstance(member_ids, list) and len(member_ids) > 0:
        if isinstance(member_ids[0], str):
            # 旧形式を新形式に変換
            return [{"id": mid, "recipientType": "to", "order": idx} for idx, mid in enumerate(member_ids)]
        else:
            # 既に新形式
            return member_ids
    return []

def create_app():
    app = Flask(__name__, static_folder=DIST_DIR, static_url_path='/')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DATA_DB}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health():
        return jsonify({'ok': True})

    # Addresses
    @app.route('/api/addresses', methods=['GET'])
    def list_addresses():
        addrs = Address.query.order_by(Address.created_at.desc()).all()
        return jsonify([{
            'id': a.id,
            'name': a.name,
            'email': a.email,
            'organization': a.organization,
            'department': a.department
        } for a in addrs])

    @app.route('/api/addresses', methods=['POST'])
    def create_address():
        data = request.json
        # IDが指定されていない場合は自動生成
        addr_id = data.get('id')
        if not addr_id or addr_id.strip() == '':
            addr_id = None  # SQLAlchemyのdefaultが適用される
        
        a = Address(
            id=addr_id,
            name=data.get('name', ''),
            email=data.get('email', ''),
            organization=data.get('organization'),
            department=data.get('department')
        )
        db.session.add(a)
        db.session.commit()
        return jsonify({'id': a.id}), 201

    @app.route('/api/addresses/<id>', methods=['PUT'])
    def update_address(id):
        data = request.json
        a = Address.query.get_or_404(id)
        a.name = data.get('name', a.name)
        a.email = data.get('email', a.email)
        a.organization = data.get('organization', a.organization)
        a.department = data.get('department', a.department)
        db.session.commit()
        return jsonify({'ok': True})

    @app.route('/api/addresses/<id>', methods=['DELETE'])
    def delete_address(id):
        a = Address.query.get_or_404(id)
        
        # 削除するアドレスを参照しているグループから削除
        groups = Group.query.all()
        for g in groups:
            member_ids = g.member_ids or []
            # 旧形式(文字列配列)と新形式(オブジェクト配列)の両方に対応
            if isinstance(member_ids, list) and len(member_ids) > 0:
                if isinstance(member_ids[0], str):
                    # 旧形式: 文字列配列
                    if id in member_ids:
                        member_ids.remove(id)
                        g.member_ids = member_ids
                else:
                    # 新形式: オブジェクト配列
                    g.member_ids = [m for m in member_ids if m.get('id') != id]
        
        # 削除するアドレスを参照しているテンプレートから削除
        templates = EmailTemplate.query.all()
        for t in templates:
            default_recipients = t.default_recipients or []
            # defaultRecipientsは [{"addressId": "addr-xxx", "type": "TO"}] 形式
            if isinstance(default_recipients, list):
                t.default_recipients = [r for r in default_recipients if r.get('addressId') != id]
        
        db.session.delete(a)
        db.session.commit()
        return jsonify({'ok': True})

    # Groups
    @app.route('/api/groups', methods=['GET'])
    def list_groups():
        groups = Group.query.order_by(Group.created_at.desc()).all()
        return jsonify([{
            'id': g.id,
            'group_name': g.group_name,
            'memberIds': normalize_member_ids(g.member_ids),
            'customAttributes': g.custom_attributes or []
        } for g in groups])

    @app.route('/api/groups', methods=['POST'])
    def create_group():
        data = request.json
        grp_id = data.get('id')
        if not grp_id or grp_id.strip() == '':
            grp_id = None
        
        g = Group(
            id=grp_id,
            group_name=data.get('group_name', ''),
            member_ids=data.get('memberIds', []),
            custom_attributes=data.get('customAttributes', [])
        )
        db.session.add(g)
        db.session.commit()
        return jsonify({'id': g.id}), 201

    @app.route('/api/groups/<id>', methods=['PUT'])
    def update_group(id):
        data = request.json
        g = Group.query.get_or_404(id)
        g.group_name = data.get('group_name', g.group_name)
        g.member_ids = data.get('memberIds', g.member_ids)
        g.custom_attributes = data.get('customAttributes', g.custom_attributes)
        db.session.commit()
        return jsonify({'ok': True})

    @app.route('/api/groups/<id>', methods=['DELETE'])
    def delete_group(id):
        g = Group.query.get_or_404(id)
        db.session.delete(g)
        db.session.commit()
        return jsonify({'ok': True})

    # Templates
    @app.route('/api/templates', methods=['GET'])
    def list_templates():
        tpls = EmailTemplate.query.order_by(EmailTemplate.created_at.desc()).all()
        return jsonify([{
            'id': t.id,
            'title': t.title,
            'subject': t.subject,
            'body': t.body,
            'defaultRecipients': t.default_recipients or []
        } for t in tpls])

    @app.route('/api/templates', methods=['POST'])
    def create_template():
        data = request.json
        tpl_id = data.get('id')
        if not tpl_id or tpl_id.strip() == '':
            tpl_id = None
        
        t = EmailTemplate(
            id=tpl_id,
            title=data.get('title'),
            subject=data.get('subject'),
            body=data.get('body'),
            default_recipients=data.get('defaultRecipients', [])
        )
        db.session.add(t)
        db.session.commit()
        return jsonify({'id': t.id}), 201

    @app.route('/api/templates/<id>', methods=['PUT'])
    def update_template(id):
        data = request.json
        t = EmailTemplate.query.get_or_404(id)
        t.title = data.get('title', t.title)
        t.subject = data.get('subject', t.subject)
        t.body = data.get('body', t.body)
        t.default_recipients = data.get('defaultRecipients', t.default_recipients)
        db.session.commit()
        return jsonify({'ok': True})

    @app.route('/api/templates/<id>', methods=['DELETE'])
    def delete_template(id):
        t = EmailTemplate.query.get_or_404(id)
        db.session.delete(t)
        db.session.commit()
        return jsonify({'ok': True})

    # Globals
    @app.route('/api/globals', methods=['GET'])
    def list_globals():
        items = GlobalVariable.query.order_by(GlobalVariable.created_at.desc()).all()
        return jsonify([{'id': i.id, 'key': i.key, 'value': i.value} for i in items])

    @app.route('/api/globals', methods=['POST'])
    def create_global():
        data = request.json
        gvar_id = data.get('id')
        if not gvar_id or gvar_id.strip() == '':
            gvar_id = None
        g = GlobalVariable(id=gvar_id, key=data.get('key'), value=data.get('value'))
        db.session.add(g)
        db.session.commit()
        return jsonify({'id': g.id}), 201

    @app.route('/api/globals/<id>', methods=['PUT'])
    def update_global(id):
        data = request.json
        g = GlobalVariable.query.get_or_404(id)
        g.key = data.get('key', g.key)
        g.value = data.get('value', g.value)
        db.session.commit()
        return jsonify({'ok': True})

    @app.route('/api/globals/<id>', methods=['DELETE'])
    def delete_global(id):
        g = GlobalVariable.query.get_or_404(id)
        db.session.delete(g)
        db.session.commit()
        return jsonify({'ok': True})

    # AttrDefs
    @app.route('/api/attrdefs', methods=['GET'])
    def list_attrdefs():
        items = AttributeDefinition.query.order_by(AttributeDefinition.created_at.desc()).all()
        return jsonify([{'id': i.id, 'key': i.key, 'label': i.label} for i in items])

    @app.route('/api/attrdefs', methods=['POST'])
    def create_attrdef():
        data = request.json
        atdef_id = data.get('id')
        if not atdef_id or atdef_id.strip() == '':
            atdef_id = None
        a = AttributeDefinition(id=atdef_id, key=data.get('key'), label=data.get('label'))
        db.session.add(a)
        db.session.commit()
        return jsonify({'id': a.id}), 201

    @app.route('/api/attrdefs/<id>', methods=['PUT'])
    def update_attrdef(id):
        data = request.json
        a = AttributeDefinition.query.get_or_404(id)
        a.key = data.get('key', a.key)
        a.label = data.get('label', a.label)
        db.session.commit()
        return jsonify({'ok': True})

    @app.route('/api/attrdefs/<id>', methods=['DELETE'])
    def delete_attrdef(id):
        a = AttributeDefinition.query.get_or_404(id)
        db.session.delete(a)
        db.session.commit()
        return jsonify({'ok': True})

    # Serve SPA index.html for root
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != '' and os.path.exists(os.path.join(DIST_DIR, path)):
            return send_from_directory(DIST_DIR, path)
        else:
            return send_from_directory(DIST_DIR, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=True)
