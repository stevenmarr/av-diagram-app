# app/decorators/role.py
from flask import abort
from flask_login import current_user
from functools import wraps

def requires_super_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("requires_super_admin decorator called")
        print("current_user authenticated:", current_user.is_authenticated)
        print("current_user.role:", current_user.role if current_user.is_authenticated else "None")
        if not current_user.is_authenticated or current_user.role != 'super_admin':
            print("Access denied - aborting 403")
            abort(403)
        print("Access granted")
        return f(*args, **kwargs)
    return decorated_function