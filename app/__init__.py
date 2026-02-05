# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Temporary test route (returns 200 instead of 404)
    @app.route('/')
    def hello():
        return "<h1>Hello from Flask! Sprint 0 complete.</h1>"

    # Register blueprints (we'll add them soon)
    # from .controllers.auth import auth_bp
    # app.register_blueprint(auth_bp)

    # Lazy load user_loader (avoids circular import)
    from app.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000, debug=True)