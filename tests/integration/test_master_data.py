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

def test_add_device_type_success(superadmin_client, client):
    """Super admin can add a new device type and see it listed."""
    client, _ = superadmin_client

    name = f"Test Switcher {uuid.uuid4().hex[:8]}"  # unique
    color = "#3366FF"

    response = client.post('/super_admin/', data={
        'action': 'add',
        'name': name,
        'color': color
    }, follow_redirects=True)

    assert response.status_code == 200
    assert name.encode() in response.data  # name appears in list
    assert b'added successfully' in response.data

    # Verify in DB
    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=name).first()
        assert dt is not None
        assert dt.color == color

def test_add_duplicate_device_type_fails(superadmin_client, client):
    """Adding duplicate name shows error and does not create record."""
    client, _ = superadmin_client

    name = f"Duplicate {uuid.uuid4().hex[:8]}"
    color = "#000000"

    # First add
    client.post('/super_admin/', data={
        'action': 'add',
        'name': name,
        'color': color
    }, follow_redirects=True)

    # Try duplicate
    response = client.post('/super_admin/', data={
        'action': 'add',
        'name': name,
        'color': "#FFFFFF"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b'already exists' in response.data

    # Only one record
    with client.application.app_context():
        count = DeviceType.query.filter_by(name=name).count()
        assert count == 1

def test_delete_device_type(superadmin_client, client):
    """Super admin can delete a device type."""
    client, _ = superadmin_client

    name = f"To Delete {uuid.uuid4().hex[:8]}"
    color = "#123456"

    # Add one
    client.post('/super_admin/', data={
        'action': 'add',
        'name': name,
        'color': color
    }, follow_redirects=True)

    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=name).first()
        assert dt is not None
        device_id = dt.id

    # Delete it
    response = client.post('/super_admin/', data={
        'action': 'delete',
        'device_id': device_id
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b'deleted' in response.data

    # Verify gone
    with client.application.app_context():
        assert DeviceType.query.filter_by(name=name).first() is None

    # tests/integration/test_master_data.py (add this test at the end)

def test_add_device_type_form(superadmin_client, client):
    """Test that super_admin can submit the add form and see the new type listed."""
    client, username = superadmin_client

    unique_name = f"Form Test {uuid.uuid4().hex[:8]}"
    color = "#00AA00"

    # Submit the form
    response = client.post('/super_admin/', data={
        'action': 'add',
        'name': unique_name,
        'color': color
    }, follow_redirects=True)

    assert response.status_code == 200
    assert unique_name.encode() in response.data   # name appears in list
    assert b'added successfully' in response.data   # success message

    # Verify in DB
    with client.application.app_context():
        dt = DeviceType.query.filter_by(name=unique_name).first()
        assert dt is not None
        assert dt.color == color
