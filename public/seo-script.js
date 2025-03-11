// This script hides the prerendered content when JavaScript is enabled
document.addEventListener('DOMContentLoaded', function() {
    // Find all prerendered content containers
    const prerenderedContainers = document.querySelectorAll('.preview-container[style="display: block;"]');
    
    // Hide them when JavaScript is enabled
    prerenderedContainers.forEach(function(container) {
        container.style.display = 'none';
    });
    
    // Initialize AdSense ads if they exist
    try {
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    } catch (e) {
        console.log('AdSense initialization error:', e);
    }
}); 