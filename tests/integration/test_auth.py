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
    client, _ = superadmin_client  # unpack
    response = client.get('/super_admin/', follow_redirects=True)
    assert response.status_code == 200
    assert b'Welcome, Super Admin!' in response.data

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