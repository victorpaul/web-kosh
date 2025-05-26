document.addEventListener('DOMContentLoaded', function() {
    // Get the theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the saved theme on page load
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Save the new theme preference
        localStorage.setItem('theme', newTheme);
        
        // Apply the new theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update the icon
        updateThemeIcon(newTheme);
    });
    
    // Function to update the theme icon
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.innerHTML = '☀️'; // Sun icon for dark mode (to switch to light)
            themeToggle.setAttribute('title', 'Switch to Light Mode');
        } else {
            themeIcon.innerHTML = '🌙'; // Moon icon for light mode (to switch to dark)
            themeToggle.setAttribute('title', 'Switch to Dark Mode');
        }
    }
});
