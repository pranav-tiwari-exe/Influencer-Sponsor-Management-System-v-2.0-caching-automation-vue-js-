from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import date

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = "roles_users"
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'), primary_key=True)

class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(128), nullable=False)
    fs_uniquifier = db.Column(db.String(255), nullable=False, unique=True)
    active = db.Column(db.Boolean,default=True)
    password = db.Column(db.String(128), nullable=False)
    profile = db.Column(db.String)
    rating=db.Column(db.Float,default=0.0)
    rating_count=db.Column(db.Integer,default=0)
    platform=db.Column(db.String)
    flagged=db.Column(db.Boolean,default=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref("users", lazy="dynamic"))
    
    # Fields For Influencer
    niche = db.Column(db.String(50))
    category = db.Column(db.String(50))
    ad_requests=db.relationship('Ad_request',backref='influencer',lazy=True)

    # Fields For Sponsors
    type = db.Column(db.String)
    address = db.Column(db.String)
    campaigns=db.relationship('Campaign',backref='sponsor',lazy=True)


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)

class Campaign(db.Model):
    __tablename__ = "campaign"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    startdate = db.Column(db.Date, nullable=False)
    enddate = db.Column(db.Date, nullable=False)
    active=db.Column(db.Boolean,default=True)
    flagged=db.Column(db.Boolean, default=False)
    budget = db.Column(db.Integer, nullable=False)
    spended=db.Column(db.Integer,default=0)
    visibility = db.Column(db.Enum("Private", "Public"), default="Public")
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ad_requests = db.relationship('Ad_request', backref='campaign', lazy=True)

    @property
    def status(self):
        today = date.today()
        if self.startdate <= today <= self.enddate:
            return "Active"
        elif today < self.startdate:
            return "Yet to be started"
        else:
            return "Completed"
        

class Ad_request(db.Model):
    __tablename__ = "ad_request"

    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    requirement = db.Column(db.String, nullable=False)
    amount=db.Column(db.Integer,nullable=False)
    status = db.Column(db.Enum("Pending", "Accepted","Declined","Completed"), default="Pending")
    progress=db.Column(db.Integer,default=0)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    accepted_at=db.Column(db.Date)
    rated=db.Column(db.Boolean,default=False)
    sender=db.Column(db.String(30),default='sponsor')
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)
    chats = db.relationship('Chat', foreign_keys='Chat.ad_request_id', lazy=True)

class Chat(db.Model):
    __tablename__ = "chat"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    sender=db.Column(db.String,nullable=False)
    message = db.Column(db.String, nullable=False)
    ad_request_id = db.Column(db.Integer, db.ForeignKey('ad_request.id', ondelete='CASCADE'))
    ad_request = db.relationship('Ad_request', overlaps="chats", lazy=True)
    