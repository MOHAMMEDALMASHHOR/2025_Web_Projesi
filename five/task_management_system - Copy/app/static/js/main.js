document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('task-list');
    const filterCategory = document.getElementById('filter-category');
    const filterPriority = document.getElementById('filter-priority');
    const filterStatus = document.getElementById('filter-status');

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