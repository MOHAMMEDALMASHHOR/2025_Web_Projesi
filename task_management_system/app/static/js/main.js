document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('task-list');
    const filterCategory = document.getElementById('filter-category');
    const filterPriority = document.getElementById('filter-priority');
    const filterStatus = document.getElementById('filter-status');
    const addTaskForm = document.getElementById('addTaskForm');

    // Populate category filter
    const categories = new Set();
    document.querySelectorAll('.task-item').forEach(task => {
        categories.add(task.dataset.category);
    });
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });

    // Filter function
    function filterTasks() {
        const selectedCategory = filterCategory.value;
        const selectedPriority = filterPriority.value;
        const selectedStatus = filterStatus.value;

        document.querySelectorAll('.task-item').forEach(task => {
            const categoryMatch = !selectedCategory || task.dataset.category === selectedCategory;
            const priorityMatch = !selectedPriority || task.dataset.priority === selectedPriority;
            const statusMatch = !selectedStatus || task.dataset.status === selectedStatus;

            if (categoryMatch && priorityMatch && statusMatch) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    }

    // Add event listeners to filters
    filterCategory.addEventListener('change', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    filterStatus.addEventListener('change', filterTasks);

    // Task completion toggle function
    function toggleTaskCompletion(event) {
        const checkbox = event.target;
        const taskId = checkbox.dataset.taskId;
        const isCompleted = checkbox.checked;

        fetch('/toggle_task_completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_id: taskId, is_completed: isCompleted }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const taskItem = checkbox.closest('.task-item');
                const statusSpan = taskItem.querySelector('.task-status span');
                statusSpan.textContent = isCompleted ? 'Completed' : 'Pending';
                taskItem.dataset.status = isCompleted ? 'completed' : 'pending';
            } else {
                console.error('Failed to update task completion status');
                checkbox.checked = !isCompleted; // Revert checkbox state
                alert('Failed to update task completion status. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            checkbox.checked = !isCompleted; // Revert checkbox state
            alert('An error occurred while updating the task. Please try again.');
        });
    }

    // Add event listeners for task completion toggles
    document.querySelectorAll('.task-completion-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTaskCompletion);
    });

    // Add task form validation
    addTaskForm.addEventListener('submit', function(event) {
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;

        if (!title || !category) {
            event.preventDefault();
            alert('Please fill in both the title and category fields.');
        }
    });

    // Add tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseover', function(e) {
            const tooltipText = this.dataset.tooltip;
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);

            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = `${rect.bottom + window.scrollY}px`;
            tooltipEl.style.left = `${rect.left + window.scrollX}px`;
        });

        tooltip.addEventListener('mouseout', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
});

