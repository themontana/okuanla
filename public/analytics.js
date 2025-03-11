// Google Analytics Implementation
(function() {
  // Google Analytics 4 (GA4) implementation
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-H1L3VKFZD3'); // Updated with the actual GA4 measurement ID

  // Track page views
  document.addEventListener('DOMContentLoaded', function() {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  });

  // Track user interactions with important elements
  document.addEventListener('click', function(event) {
    // Track button clicks
    if (event.target.tagName === 'BUTTON' || 
        (event.target.tagName === 'A' && event.target.classList.contains('btn'))) {
      gtag('event', 'button_click', {
        button_text: event.target.innerText || 'Unknown',
        button_id: event.target.id || 'Unknown',
        page_location: window.location.pathname
      });
    }
  });

  // Track form submissions
  document.addEventListener('submit', function(event) {
    if (event.target.tagName === 'FORM') {
      gtag('event', 'form_submit', {
        form_id: event.target.id || 'Unknown',
        page_location: window.location.pathname
      });
    }
  });
})(); 