from email.policy import default
from enum import unique
from xmlrpc.client import DateTime
from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()


def get_uuid():
    return uuid4().hex


# Setting up the DB models for the two tables - User and Attendance

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.String(32), primary_key=True,
                   unique=True, default=get_uuid)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)


class Attendance(db.Model):
    __table__name = "attendance"
    id = db.Column(db.Integer, db.Sequence('attendance_id', start=0,
                                           increment=1), primary_key=True)
    email = db.Column(db.String(32), db.ForeignKey('user.email'))
    date = db.Column(db.String(10), default=None)
    day = db.Column(db.String(10), default=None)
    punch_in = db.Column(db.String(10), default=None)
    punch_out = db.Column(db.String(10), default=None)
    duration = db.Column(db.String(10), default=None)
    week_num = db.Column(db.Integer, default=None)
