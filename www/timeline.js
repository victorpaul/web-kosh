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
                    const timelineItem = document.createElement('div');
                    timelineItem.className = `timeline-item${item.type === 'personal' ? ' personal' : ''}`;
                    
                    const timelineDate = document.createElement('div');
                    timelineDate.className = 'timeline-date';
                    timelineDate.textContent = item.date;
                    
                    const timelineContent = document.createElement('div');
                    timelineContent.className = 'timeline-content';
                    
                    const title = document.createElement('h3');
                    title.textContent = item.title;
                    timelineContent.appendChild(title);
                    
                    // Add each description paragraph
                    item.description.forEach(desc => {
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = desc; // Using innerHTML to support HTML in descriptions
                        timelineContent.appendChild(paragraph);
                    });
                    
                    // Assemble the timeline item
                    timelineItem.appendChild(timelineDate);
                    timelineItem.appendChild(timelineContent);
                    
                    // Add to timeline
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
