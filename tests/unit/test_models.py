# tests/unit/test_models.py
import pytest
import uuid
from app import create_app, db
from app.models.master import DeviceType
from sqlalchemy.exc import IntegrityError
from datetime import datetime

@pytest.fixture(autouse=True)
def cleanup_device_types(app):
    """Automatically clean up DeviceType records after every test."""
    yield
    with app.app_context():
        DeviceType.query.delete()
        db.session.commit()

def test_device_type_creation(app):
    """Test DeviceType model creation, attributes, and uniqueness constraint."""
    with app.app_context():
        # Unique name for this test run
        unique_name = f"Test Type {uuid.uuid4().hex[:8]}"

        # Create first device type (should succeed)
        dt1 = DeviceType(name=unique_name, color="#FF0000", thumbnail="test.png")
        db.session.add(dt1)
        db.session.commit()

        # Verify it was saved correctly
        loaded = DeviceType.query.filter_by(name=unique_name).first()
        assert loaded is not None
        assert loaded.name == unique_name
        assert loaded.color == "#FF0000"
        assert loaded.thumbnail == "test.png"
        assert isinstance(loaded.created_at, datetime)
        assert isinstance(loaded.updated_at, datetime)
        assert loaded.updated_at >= loaded.created_at

        # Try duplicate name (should raise IntegrityError)
        dt2 = DeviceType(name=unique_name, color="#00FF00")
        db.session.add(dt2)
        with pytest.raises(IntegrityError):
            db.session.commit()

        # Rollback to keep session clean (important!)
        db.session.rollback()