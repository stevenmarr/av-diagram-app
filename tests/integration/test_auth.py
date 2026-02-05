# tests/integration/test_auth.py
import pytest
from app import create_app, db
from app.models.user import User

@pytest.fixture
def client(app):
    """Test client with app context."""
    return app.test_client()

@pytest.fixture
def superadmin_client(client, app):
    """Authenticated superadmin test client."""
    with app.app_context():
        admin = User(username='superadmin_test', role='super_admin')
        admin.set_password('test123')
        db.session.add(admin)
        db.session.commit()

    client.post('/login', data={
        'username': 'superadmin_test',
        'password': 'test123'
    }, follow_redirects=True)

    yield client

    # Cleanup
    with app.app_context():
        User.query.filter_by(username='superadmin_test').delete()
        db.session.commit()

def test_login_page_renders(client):
    """GET /login returns 200 and contains form."""
    response = client.get('/login')
    assert response.status_code == 200
    assert b'<form method="post">' in response.data
    assert b'Username' in response.data
    assert b'Password' in response.data

def test_login_success_redirects_to_dashboard(superadmin_client):
    """Successful login redirects to /super_admin."""
    response = superadmin_client.post('/login', data={
        'username': 'superadmin_test',
        'password': 'test123'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b'Welcome, Super Admin!' in response.data

def test_login_failure_shows_error(client):
    """Failed login stays on login page with error."""
    response = client.post('/login', data={
        'username': 'wrong',
        'password': 'wrong'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b'Invalid username or password' in response.data

def test_unauthenticated_cannot_access_dashboard(client):
    """Unauthenticated user redirected to login on /super_admin."""
    response = client.get('/super_admin/', follow_redirects=True)
    assert response.status_code == 200
    assert b'Login' in response.data  # redirected to login page

def test_logout_redirects_to_login(superadmin_client):
    """Logout redirects to login page."""
    response = superadmin_client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert b'Logged out successfully' in response.data
    assert b'Login' in response.data