# app/controllers/auth.py
from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.user import User
from app.forms import LoginForm

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    print("Login route hit")
    if current_user.is_authenticated:
        print("Already authenticated, redirecting to dashboard")
        return redirect(url_for('super_admin.dashboard'))

    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        print(f"Form submitted with username: {username}")
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(form.password.data):
            print(f"Login success for {username}")
            login_user(user, remember=True)
            db.session.commit()
            print(f"After login_user: current_user = {current_user.username if current_user.is_authenticated else 'None'}")
            return redirect(url_for('super_admin.dashboard'))
        print("Login failed - invalid credentials")
        flash('Invalid username or password.', 'error')

    print("Showing login form")
    return render_template('auth/login.html', form=form)
    
@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('auth.login'))