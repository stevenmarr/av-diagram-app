# app/controllers/super_admin.py
"""Super admin routes."""

from flask import Blueprint, render_template
from flask_login import login_required

super_admin_bp = Blueprint('super_admin', __name__, url_prefix='/super_admin')

@super_admin_bp.route('/')
@login_required
def dashboard():
    """Super admin dashboard."""
    return render_template('super_admin/dashboard.html')