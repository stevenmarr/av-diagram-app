# app/decorators.py
"""Custom decorators for role enforcement."""

from flask import abort
from flask_login import current_user
from functools import wraps

def requires_super_admin(f):
    """Decorator to restrict access to super_admin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'super_admin':
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function