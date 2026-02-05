# tests/conftest.py
import pytest
from app import create_app, db

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "postgresql://postgres:your_secure_password_here@localhost:5432/test_db",
        "WTF_CSRF_ENABLED": False,  # disable CSRF for testing
    })

    # Create tables
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app's Click commands."""
    return app.test_cli_runner()