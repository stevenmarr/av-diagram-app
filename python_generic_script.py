from app import create_app, db
from sqlalchemy import inspect
app = create_app()
with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print("Existing tables:", tables)
    if 'device_type' in tables:
        print("DeviceType table already exists")
    else:
        print("DeviceType table missing")
exit()