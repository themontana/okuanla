// This script hides the prerendered content when JavaScript is enabled
document.addEventListener('DOMContentLoaded', function() {
    // Find all prerendered content containers
    const prerenderedContainers = document.querySelectorAll('.preview-container[style="display: block;"]');
    
    // Hide them when JavaScript is enabled
    prerenderedContainers.forEach(function(container) {
        container.style.display = 'none';
    });
}); 