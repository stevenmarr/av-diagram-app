from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    # Delete any existing (safety)
    User.query.filter_by(username='superadmin').delete()
    db.session.commit()

    # Create fresh
    admin = User(username='superadmin', role='super_admin')
    admin.set_password('super123')
    db.session.add(admin)
    db.session.commit()

    # Verify immediately
    loaded = User.query.filter_by(username='superadmin').first()
    if loaded:
        print("User created successfully")
        print("Username:", loaded.username)
        print("Role:", loaded.role)
        print("Hash length:", len(loaded.password_hash))
        print("Password check (should be True):", loaded.check_password('super123'))
    else:
        print("Creation failed - check DB")
