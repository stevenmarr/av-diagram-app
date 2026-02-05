# tests/unit/test_setup.py
from app import create_app, db
from sqlalchemy import text 

def test_app_exists(app):
    """Test that the app is created correctly."""
    assert app is not None
    assert app.config["TESTING"] is True


def test_db_connection(app):
    """Test that we can connect to the database."""
    with app.app_context():
        # Simple query to verify connection
        result = db.session.execute(text("SELECT 1")).scalar()
        assert result == 1


def test_login_manager_configured(app):
    """Test that Flask-Login is initialized."""
    assert app.login_manager.login_view == 'auth.login'


#def test_index_404(client):
#    """Test that root URL returns 404 (no route yet)."""
#    response = client.get('/')
#    assert response.status_code == 404
#    assert b"Not Found" in response.data


def test_index_hello(client):
    """test that root URL returns our hello message."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"Hello from Flask! Sprint 0 complete." in response.data