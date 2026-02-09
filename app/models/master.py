# app/models/master.py
"""Master library models."""

from app import db
from datetime import datetime

class DeviceType(db.Model):
    """Global device type catalog."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=False, default='#3366FF')  # hex
    thumbnail = db.Column(db.String(128))  # filename
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<DeviceType {self.name}>'

class Manufacturer(db.Model):
    """Global device type catalog."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    #color = db.Column(db.String(7), nullable=False, default='#3366FF')  # hex
    #thumbnail = db.Column(db.String(128))  # filename
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Manufacturer {self.name}>'