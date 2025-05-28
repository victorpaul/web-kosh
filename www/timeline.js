document.addEventListener('DOMContentLoaded', function() {
    // Get filter checkboxes
    const workFilter = document.querySelector('input[name="filter-work"]');
    const personalFilter = document.querySelector('input[name="filter-personal"]');
    
    // Get timeline container
    const timelineContainer = document.querySelector('.timeline');
    
    // Function to create timeline items from JSON data
    function createTimelineItems() {
        // Fetch the timeline data from JSON file
        fetch('timeline.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load timeline data');
                }
                return response.json();
            })
            .then(data => {
                // Clear any existing timeline items
                timelineContainer.innerHTML = '';
                
                // Create HTML for each timeline item
                data.timelineItems.forEach(item => {
                    const timelineItem = createTimelineItem(item);
                    timelineContainer.appendChild(timelineItem);
                });
                
                // Apply filters after loading items
                updateTimeline();
            })
            .catch(error => {
                console.error('Error loading timeline data:', error);
                timelineContainer.innerHTML = `<div class="timeline-error">Error loading timeline data: ${error.message}</div>`;
            });
    }
    
    // Function to create timeline item with images if available
    function createTimelineItem(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `timeline-item ${item.type}`;
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'timeline-date';
        dateDiv.textContent = item.date;
        itemDiv.appendChild(dateDiv);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'timeline-content';

        const textColumn = document.createElement('div');
        textColumn.className = 'timeline-text-column';

        const titleH3 = document.createElement('h3');
        titleH3.textContent = item.title;
        textColumn.appendChild(titleH3);

        if (item.description && item.description.length > 0) {
            const descP = document.createElement('p');
            descP.innerHTML = item.description.join('<br>');
            textColumn.appendChild(descP);
        }
        contentDiv.appendChild(textColumn);

        // Check if images array exists and has entries
        if (item.images && item.images.length > 0) {
            const imagesColumn = document.createElement('div');
            imagesColumn.className = 'timeline-images-column';
            
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'timeline-images';
            
            // Store all images in this timeline item
            const imageGroup = [...item.images];
            
            item.images.forEach((imageSrc, index) => {
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = 'Timeline image';
                img.className = 'timeline-thumbnail';
                img.addEventListener('click', () => {
                    // Use the new modal function to open image with its group
                    if (window.modalFunctions && window.modalFunctions.openModalWithImage) {
                        window.modalFunctions.openModalWithImage(imageSrc, imageGroup, index);
                    }
                });
                imagesContainer.appendChild(img);
            });
            
            imagesColumn.appendChild(imagesContainer);
            contentDiv.appendChild(imagesColumn);
        }
        
        itemDiv.appendChild(contentDiv);
        return itemDiv;
    }
    
    // Function to update timeline based on filters
    function updateTimeline() {
        const showWork = workFilter.checked;
        const showPersonal = personalFilter.checked;
        
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            const isPersonal = item.classList.contains('personal');
            const isWork = !isPersonal;
            
            if ((isWork && showWork) || (isPersonal && showPersonal)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Add event listeners to checkboxes
    workFilter.addEventListener('change', updateTimeline);
    personalFilter.addEventListener('change', updateTimeline);
    
    // Load timeline items
    createTimelineItems();
});
