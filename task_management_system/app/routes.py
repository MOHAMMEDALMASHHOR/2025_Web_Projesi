from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from app import db, bcrypt
from app.models import User, Task, TaskPriority
from datetime import datetime

auth = Blueprint('auth', __name__)
main = Blueprint('main', __name__)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('main.dashboard'))
        else:
            flash('Login unsuccessful. Please check email and password.', 'danger')
            return render_template('login.html', error=True)
    return render_template('login.html', error=False)


@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(name=name, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You are now able to log in.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('signup.html')


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


@auth.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        user = User.query.filter_by(email=email).first()
        if user:
            # Here you would typically send an email with a reset link
            flash('An email has been sent with instructions to reset your password.', 'info')
        else:
            flash('No account found with that email address.', 'warning')
    return render_template('forgot_password.html')


@main.route('/')
@main.route('/dashboard')
@login_required
def dashboard():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    priorities = TaskPriority.query.all()
    return render_template('dashboard.html', tasks=tasks, priorities=priorities)


@main.route('/add_task', methods=['POST'])
@login_required
def add_task():
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    priority_id = request.form.get('priority')
    due_date = datetime.strptime(request.form.get('due_date'), '%Y-%m-%d')
    collaboration = request.form.get('collaboration')

    task = Task(title=title, description=description, category=category,
                priority_id=priority_id, due_date=due_date,
                collaboration=collaboration, user_id=current_user.id)
    db.session.add(task)
    db.session.commit()
    flash('Task added successfully!', 'success')
    return redirect(url_for('main.dashboard'))


@main.route('/toggle_task_completion', methods=['POST'])
@login_required
def toggle_task_completion():
    data = request.json
    task_id = data.get('task_id')
    is_completed = data.get('is_completed')

    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    task.is_completed = is_completed
    task.completed_at = datetime.utcnow() if is_completed else None
    db.session.commit()

    return jsonify({'success': True})


@main.route('/delete_task/<int:task_id>')
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        flash('You are not authorized to delete this task.', 'danger')
        return redirect(url_for('main.dashboard'))
    db.session.delete(task)
    db.session.commit()
    flash('Task deleted successfully!', 'success')
    return redirect(url_for('main.dashboard'))


@main.route('/statistics')
@login_required
def statistics():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.is_completed)
    pending_tasks = total_tasks - completed_tasks
    productivity_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    priority_distribution = db.session.query(TaskPriority.priority_name, db.func.count(Task.id)). \
        join(Task, TaskPriority.id == Task.priority_id). \
        filter(Task.user_id == current_user.id). \
        group_by(TaskPriority.priority_name).all()

    category_distribution = db.session.query(Task.category, db.func.count(Task.id)). \
        filter(Task.user_id == current_user.id). \
        group_by(Task.category).all()

    return render_template('statistics.html', total_tasks=total_tasks,
                           completed_tasks=completed_tasks, pending_tasks=pending_tasks,
                           productivity_rate=productivity_rate,
                           priority_distribution=priority_distribution,
                           category_distribution=category_distribution)


@main.route('/about')
def about():
    return render_template('about.html')

