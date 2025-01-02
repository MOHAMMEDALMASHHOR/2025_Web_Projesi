from app import create_app, db
from app.models import User, Task, TaskPriority

app = create_app()

with app.app_context():
    db.create_all()

    # Create task priorities
    priorities = ['High', 'Medium', 'Low']
    for priority in priorities:
        if not TaskPriority.query.filter_by(priority_name=priority).first():
            db.session.add(TaskPriority(priority_name=priority))

    db.session.commit()

    print("Database initialized successfully.")