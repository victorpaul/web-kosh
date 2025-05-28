document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalThumbnails = document.getElementById('modalThumbnails');
    const closeBtn = document.querySelector('.modal-close');
    
    // Store current group of images
    let currentImageGroup = [];
    let currentImageIndex = 0;
    
    // Function to open modal with image and its group
    function openModalWithImage(imgUrl, imageGroup, index) {
        // Clear previous thumbnails
        modalThumbnails.innerHTML = '';
        
        // Store current group and index
        currentImageGroup = imageGroup;
        currentImageIndex = index;
        
        // Create a new image to preload
        const preloadImg = new Image();
        
        // Set up loading event
        preloadImg.onload = function() {
            // Set the modal image source after preloading
            modalImg.src = imgUrl;
            
            // Create thumbnails for all images in the group
            imageGroup.forEach((src, i) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = src;
                thumbnail.alt = 'Thumbnail';
                thumbnail.className = 'modal-thumbnail';
                if (i === index) {
                    thumbnail.classList.add('active');
                }
                
                thumbnail.addEventListener('click', function() {
                    // Update main image when thumbnail is clicked
                    modalImg.src = src;
                    currentImageIndex = i;
                    
                    // Update active state
                    const allThumbnails = modalThumbnails.querySelectorAll('.modal-thumbnail');
                    allThumbnails.forEach((thumb, idx) => {
                        if (idx === i) {
                            thumb.classList.add('active');
                        } else {
                            thumb.classList.remove('active');
                        }
                    });
                });
                
                modalThumbnails.appendChild(thumbnail);
            });
            
            // Show the modal
            modal.style.display = 'flex';
            
            // Prevent body scrolling while modal is open
            document.body.style.overflow = 'hidden';
        };
        
        // Start loading the image
        preloadImg.src = imgUrl;
    }
    
    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        modalThumbnails.innerHTML = '';
        currentImageGroup = [];
    }
    
    // Function to navigate to next/previous image
    function navigateImage(direction) {
        if (currentImageGroup.length <= 1) return;
        
        // Calculate new index with wrap-around
        let newIndex = currentImageIndex + direction;
        if (newIndex < 0) newIndex = currentImageGroup.length - 1;
        if (newIndex >= currentImageGroup.length) newIndex = 0;
        
        // Update current index
        currentImageIndex = newIndex;
        
        // Update main image
        modalImg.src = currentImageGroup[newIndex];
        
        // Update active thumbnail
        const allThumbnails = modalThumbnails.querySelectorAll('.modal-thumbnail');
        allThumbnails.forEach((thumb, idx) => {
            if (idx === newIndex) {
                thumb.classList.add('active');
                // Scroll thumbnail into view if needed
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // Close modal when clicking the close button
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Navigate with arrow keys and close with Escape
    document.addEventListener('keydown', function(event) {
        if (modal.style.display !== 'flex') return;
        
        switch(event.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowRight':
                navigateImage(1); // Next image
                break;
            case 'ArrowLeft':
                navigateImage(-1); // Previous image
                break;
        }
    });
    
    // Expose functions to global scope for timeline.js to use
    window.modalFunctions = {
        openModalWithImage: openModalWithImage
    };
});
