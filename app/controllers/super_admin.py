# app/controllers/super_admin.py
"""Super admin routes for managing master data."""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from app import db
from app.models.master import DeviceType
from app.decorators.role import requires_super_admin  # Correct import

super_admin_bp = Blueprint('super_admin', __name__, url_prefix='/super_admin')

@super_admin_bp.route('/', methods=['GET', 'POST'])
@login_required
@requires_super_admin  # Enforce super_admin role
def dashboard():
    message = None
    message_type = 'success'

    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'add':
            name = request.form.get('name', '').strip()
            color = request.form.get('color', '#3366FF').strip()

            if not name:
                message = "Name is required."
                message_type = 'error'
            elif len(name) > 64:
                message = "Name must be 64 characters or less."
                message_type = 'error'
            elif DeviceType.query.filter_by(name=name).first():
                message = f"Device type '{name}' already exists."
                message_type = 'error'
            else:
                new_type = DeviceType(name=name, color=color)
                db.session.add(new_type)
                db.session.commit()
                message = f"Device type '{name}' added successfully."
                message_type = 'success'

        elif action == 'delete':
            device_id = request.form.get('device_id')
            if device_id:
                device = DeviceType.query.get(device_id)
                if device:
                    name = device.name
                    db.session.delete(device)
                    db.session.commit()
                    message = f"Device type '{name}' deleted."
                    message_type = 'success'
                else:
                    message = "Device type not found."
                    message_type = 'error'

    device_types = DeviceType.query.order_by(DeviceType.name).all()
    return render_template('super_admin/dashboard.html', 
                          device_types=device_types, 
                          message=message,
                          message_type=message_type)