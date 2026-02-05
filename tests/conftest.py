# tests/conftest.py
import pytest
from app import create_app, db

@pytest.fixture(scope="function")
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "postgresql://postgres:your_secure_password_here@localhost:5432/test_db",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "WTF_CSRF_ENABLED": False,
    })

    with app.app_context():
        db.create_all()
        yield app
        # Rollback instead of drop (prevents locks/hangs)
        db.session.rollback()
        db.session.remove()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app's Click commands."""
    return app.test_cli_runner()