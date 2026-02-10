# app/controllers/super_admin.py
"""Super admin routes for managing master data."""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from app import db
from app.models.master import DeviceType, Manufacturer
from app.decorators.role import requires_super_admin  # Correct import

super_admin_bp = Blueprint('super_admin', __name__, url_prefix='/super_admin')

@super_admin_bp.route('/super_admin/', methods=['GET', 'POST'])
@login_required
@requires_super_admin
def dashboard():
    
    if request.method == 'POST':
        action = request.form.get('action')
        #create and edit device types
        if action == 'device_type_add':
            name = request.form.get('name', '').strip()
            color = request.form.get('color', '#3366FF').strip()

            if not name:
                flash("Name is required.", "error")
            elif len(name) > 64:
                flash("Name must be 64 characters or less.", "error")
            elif DeviceType.query.filter_by(name=name).first():
                flash(f"Device type '{name}' already exists.", "error")
            else:
                new_type = DeviceType(name=name, color=color)
                db.session.add(new_type)
                db.session.commit()
                flash(f"Device type '{name}' added successfully.", "success")
        elif action == 'device_type_delete':
            device_id = request.form.get('device_id')
            if device_id:
                device = DeviceType.query.get(device_id)
                if device:
                    name = device.name
                    db.session.delete(device)
                    db.session.commit()
                    flash(f"Device type '{name}' deleted.", "success")
                else:
                    flash("Device type not found.", "error")
            else:
                flash("No device selected for deletion.", "error")

        #create and edit manufacturers
        elif action == 'manufacturer_add':
            name = request.form.get('mname', '').strip()
            #color = request.form.get('color', '#3366FF').strip()

            if not name:
                flash("Name is required.", "error")
            elif len(name) > 64:
                flash("Name must be 64 characters or less.", "error")
            elif Manufacturer.query.filter_by(name=name).first():
                flash(f"Manufacturer '{name}' already exists.", "error")
            else:
                new_type = Manufacturer(name=name)
                db.session.add(new_type)
                db.session.commit()
                flash(f"Device type '{name}' added successfully.", "success")
        elif action == 'manufacturer_delete':
            manufacturer_id = request.form.get('manufacturer_id')
            if manufacturer_id:
                manufacturer = Manufacturer.query.get(manufacturer_id)
                if manufacturer:
                    name = manufacturer.name
                    db.session.delete(manufacturer)
                    db.session.commit()
                    flash(f"manufacturer '{name}' deleted.", "success")
                else:
                    flash("manufacturer not found.", "error")
            else:
                flash("No device selected for deletion.", "error")

        return redirect(url_for('super_admin.dashboard'))

    device_types = DeviceType.query.order_by(DeviceType.name).all()
    manufacturers = Manufacturer.query.order_by(Manufacturer.name).all()
    return render_template('super_admin/dashboard.html', device_types=device_types, manufacturers=manufacturers)