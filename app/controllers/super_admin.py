from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_required
from app import db
from app.models.master import DeviceType

super_admin_bp = Blueprint('super_admin', __name__, url_prefix='/super_admin')

@super_admin_bp.route('/', methods=['GET', 'POST'])
@login_required
def dashboard():
    if request.method == 'POST':
        name = request.form.get('name')
        color = request.form.get('color', '#3366FF')
        new_type = DeviceType(name=name, color=color)
        db.session.add(new_type)
        db.session.commit()
        return redirect(url_for('super_admin.dashboard'))
    device_types = DeviceType.query.all()
    return render_template('super_admin/dashboard.html', device_types=device_types)