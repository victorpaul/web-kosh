document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');
    
    // Function to handle click events on modal links
    function setupModalLinks() {
        // Look for links with modal class
        document.addEventListener('click', function(event) {
            // Check if the clicked element is a modal link
            if (event.target.tagName === 'A' && event.target.classList.contains('modal')) {
                event.preventDefault();
                
                // Get the image URL from the href attribute
                const imgUrl = event.target.getAttribute('href');
                
                // Create a new image to preload
                const preloadImg = new Image();
                
                // Set up loading event
                preloadImg.onload = function() {
                    // Set the modal image source after preloading
                    modalImg.src = imgUrl;
                    
                    // Show the modal
                    modal.style.display = 'flex';
                    
                    // Prevent body scrolling while modal is open
                    document.body.style.overflow = 'hidden';
                };
                
                // Start loading the image
                preloadImg.src = imgUrl;
            }
        });
    }
    
    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Initialize modal links
    setupModalLinks();
});
