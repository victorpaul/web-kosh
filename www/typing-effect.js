document.addEventListener('DOMContentLoaded', function() {
    // Get the element with id "victor-say"
    const victorSayElement = document.getElementById('victor-say');
    
    if (victorSayElement) {
        // Store the original text
        const originalText = victorSayElement.textContent.trim();
        
        // Clear the element
        victorSayElement.textContent = '';
        
        // Set up variables for typing effect
        let charIndex = 0;
        const typingSpeed = 5; // milliseconds per character
        
        // Function to type one character at a time
        function typeText() {
            if (charIndex < originalText.length) {
                // Add the next character
                victorSayElement.textContent += originalText.charAt(charIndex);
                charIndex++;
                
                // Schedule the next character
                setTimeout(typeText, typingSpeed);
            }
        }
        
        // Start the typing effect
        setTimeout(typeText, 500); // Small delay before starting
    }
});
