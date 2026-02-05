# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .config import Config
from app.models.user import User 
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)  # <--- THIS LINE MUST BE HERE (inside create_app)
    print("Extensions after init: ", app.extensions)  # <-- ADD THIS TEMPORARY LINE

    # Temporary test route (returns 200 instead of 404)
    @app.route('/')
    def hello():
        return "<h1>Hello from Flask! Sprint 0 complete.</h1>"

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000, debug=True)