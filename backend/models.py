from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def gen_id(prefix=''):
    return prefix + str(uuid.uuid4())


class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.String, primary_key=True, default=lambda: gen_id('addr-'))
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    organization = db.Column(db.String)
    department = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.String, primary_key=True, default=lambda: gen_id('grp-'))
    group_name = db.Column(db.String, nullable=False)
    member_ids = db.Column(db.JSON, default=list)
    custom_attributes = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class EmailTemplate(db.Model):
    __tablename__ = 'templates'
    id = db.Column(db.String, primary_key=True, default=lambda: gen_id('tpl-'))
    title = db.Column(db.String)
    subject = db.Column(db.String)
    body = db.Column(db.Text)
    default_recipients = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class GlobalVariable(db.Model):
    __tablename__ = 'globals'
    id = db.Column(db.String, primary_key=True, default=lambda: gen_id('gvar-'))
    key = db.Column(db.String, nullable=False, unique=True)
    value = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AttributeDefinition(db.Model):
    __tablename__ = 'attrdefs'
    id = db.Column(db.String, primary_key=True, default=lambda: gen_id('atdef-'))
    key = db.Column(db.String, nullable=False, unique=True)
    label = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
