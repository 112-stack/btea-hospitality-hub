/**
 * Sidebar Toggle Functionality
 */

$(document).ready(function() {
    const hamBurger = document.querySelector(".toggle-btn");

    if (hamBurger) {
        hamBurger.addEventListener("click", function() {
            // Toggle group items visibility
            const groupItems = document.querySelectorAll(".groupItem");
            groupItems.forEach(item => {
                item.style.display = item.style.display === 'none' ? '' : 'none';
            });

            // Toggle sidebar expansion
            document.querySelector("#sidebar").classList.toggle("expand");
        });
    }

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
