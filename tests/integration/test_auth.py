# tests/integration/test_auth.py
import pytest
import uuid
from app import create_app, db
from app.models.user import User
from app.decorators.role import requires_super_admin

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def superadmin_client(client, app):
    username = f'superadmin_test_{uuid.uuid4().hex[:8]}'  # unique per run

    with app.app_context():
        admin = User(username=username, role='super_admin')
        admin.set_password('test123')
        db.session.add(admin)
        db.session.commit()

    client.post('/login', data={
        'username': username,
        'password': 'test123'
    }, follow_redirects=True)

    yield client, username  # return username for cleanup

    # Cleanup
    with app.app_context():
        User.query.filter_by(username=username).delete()
        db.session.commit()

def test_login_page_renders(client):
    response = client.get('/login')
    assert response.status_code == 200
    assert b'<form method="post">' in response.data

def test_login_success_redirects_to_dashboard(superadmin_client, client):
    """Successful login redirects to /super_admin and renders the dashboard."""
    client, _ = superadmin_client  # unpack fixture

    response = client.get('/super_admin/', follow_redirects=True)
    assert response.status_code == 200

    # Check for stable dashboard content (pick one or more that exist in your template)
    assert b'Super Admin Dashboard' in response.data          # from <title> or <h1>
    assert b'Master Device Types' in response.data           # section heading
    assert b'Add New Device Type' in response.data           # form heading
    assert b'Logout' in response.data                         # logout link
    # Optional: check for the add form structure
    assert b'<form method="post">' in response.data

def test_regular_user_gets_403(client, app):
    username = f'regular_test_{uuid.uuid4().hex[:8]}'

    with app.app_context():
        regular = User(username=username, role='user')
        regular.set_password('test123')
        db.session.add(regular)
        db.session.commit()

    client.post('/login', data={
        'username': username,
        'password': 'test123'
    }, follow_redirects=True)

    response = client.get('/super_admin/')
    assert response.status_code == 403

    # Cleanup
    with app.app_context():
        User.query.filter_by(username=username).delete()
        db.session.commit()