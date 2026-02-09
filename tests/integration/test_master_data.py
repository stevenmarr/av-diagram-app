# tests/integration/test_master_data.py
import pytest
import uuid
from app import create_app, db
from app.models.user import User
from app.models.master import DeviceType
from flask import url_for

@pytest.fixture
def superadmin_client(client, app):
    username = f'superadmin_test_{uuid.uuid4().hex[:8]}'

    with app.app_context():
        admin = User(username=username, role='super_admin')
        admin.set_password('test123')
        db.session.add(admin)
        db.session.commit()

    client.post('/login', data={
        'username': username,
        'password': 'test123'
    }, follow_redirects=True)

    yield client, username

    # Cleanup
    with app.app_context():
        User.query.filter_by(username=username).delete()
        DeviceType.query.delete()
        db.session.commit()

def test_add_device_type(superadmin_client, client):
    """Super admin can add a new device type and see it listed."""
    client, _ = superadmin_client

    name = f"Test Switcher {uuid.uuid4().hex[:8]}"  # unique
    color = "#3366FF"

    response = client.post('/super_admin/', data={
        'action': 'device_type_add',
        'name': name,
        'color': color
    }, follow_redirects=True)

    # Verify in DB
    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=name).first()
        assert dt is not None
        assert dt.color == color

def test_delete_device_type(superadmin_client, client):
    """Super admin can delete a device type."""
    client, _ = superadmin_client

    name = f"To Delete {uuid.uuid4().hex[:8]}"
    color = "#123456"

    # Add one
    client.post('/super_admin/', data={
        'action': 'device_type_add',
        'name': name,
        'color': color
    }, follow_redirects=True)

    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=name).first()
        assert dt is not None
        device_id = dt.id

    # Delete it
    response = client.post('/super_admin/', data={
        'action': 'device_type_delete',
        'device_id': device_id
    }, follow_redirects=True)

    # Verify gone
    with client.application.app_context():
        assert DeviceType.query.filter_by(name=name).first() is None

def test_add_device_type_form(superadmin_client, client):
    """Test that super_admin can submit the add form and see the new type listed."""
    client, username = superadmin_client

    unique_name = f"Form Test {uuid.uuid4().hex[:8]}"
    color = "#00AA00"

    # Submit the form
    response = client.post('/super_admin/', data={
        'action': 'device_type_add',
        'name': unique_name,
        'color': color
    }, follow_redirects=True)

    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=unique_name).first()
        assert dt is not None
        assert dt.color == color

