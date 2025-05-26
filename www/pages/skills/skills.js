document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('skills-cloud');
    container.innerHTML = ''; // Clear existing skills
    
    // Function to get random number between min and max
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Load skills from JSON
    fetch('/pages/skills/skills.json')
        .then(response => response.json())
        .then(data => {
            const skills = data.skills.map(skill => {
                const skillElement = document.createElement('div');
                skillElement.className = 'skill-cloud';
                skillElement.setAttribute('data-skill', skill.title);
                skillElement.setAttribute('data-description', skill.description);
                skillElement.style.setProperty('--size', getRandom(3, 5).toFixed(1));
                skillElement.style.setProperty('--speed', Math.floor(getRandom(18, 30)));
                
                const img = document.createElement('img');
                img.src = skill.image;
                img.alt = skill.title;
                skillElement.appendChild(img);
                
                container.appendChild(skillElement);
                return skillElement;
            });
            
            initializeSkills(skills);
        })
        .catch(error => console.error('Error loading skills:', error));
    
    // Store velocity and position data for each skill
    let skillData = [];
    
    function initializeSkills(skills) {
        skillData = skills.map(skill => ({
            element: skill,
            x: 0,
            y: 0,
            vx: getRandom(-0.5, 0.5), // Velocity x
            vy: getRandom(-0.5, 0.5), // Velocity y
            radius: parseFloat(skill.style.getPropertyValue('--size')) * 5 + 30 // Approximate radius based on size
        }));
        
        initializePositions();
        requestAnimationFrame(updatePositions);
        
        // Add tooltip on hover
        skills.forEach(skill => {
            skill.addEventListener('mouseenter', function() {
                const skillName = this.getAttribute('data-skill');
                const skillDesc = this.getAttribute('data-description');
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.innerHTML = `<strong>${skillName}</strong>: ${skillDesc}`;
                this.appendChild(tooltip);
            });
            
            skill.addEventListener('mouseleave', function() {
                const tooltip = this.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }
    
    // Function to check collision between two elements
    function checkCollision(skill1, skill2) {
        const dx = skill2.x - skill1.x;
        const dy = skill2.y - skill1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (skill1.radius + skill2.radius);
    }
    
    // Function to handle collision response
    function handleCollision(skill1, skill2) {
        const dx = skill2.x - skill1.x;
        const dy = skill2.y - skill1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return; // Prevent division by zero
        
        // Normal vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Relative velocity
        const dvx = skill2.vx - skill1.vx;
        const dvy = skill2.vy - skill1.vy;
        
        // Dot product of relative velocity and normal
        const dotProduct = dvx * nx + dvy * ny;
        
        // If moving towards each other, apply impulse
        if (dotProduct < 0) {
            const impulse = (2 * dotProduct) / 2; // Assuming equal mass
            skill1.vx += impulse * nx;
            skill1.vy += impulse * ny;
            skill2.vx -= impulse * nx;
            skill2.vy -= impulse * ny;
            
            // Dampen velocity to simulate energy loss
            skill1.vx *= 0.95;
            skill1.vy *= 0.95;
            skill2.vx *= 0.95;
            skill2.vy *= 0.95;
        }
    }
    
    // Function to initialize positions without overlapping
    function initializePositions() {
        const containerRect = container.getBoundingClientRect();
        const placedSkills = [];
        
        skillData.forEach(skill => {
            let attempts = 0;
            let left, top;
            const skillRect = skill.element.getBoundingClientRect();
            
            do {
                left = getRandom(0, containerRect.width - skillRect.width);
                top = getRandom(0, containerRect.height - skillRect.height);
                skill.element.style.left = `${left}px`;
                skill.element.style.top = `${top}px`;
                skill.x = left + skillRect.width / 2;
                skill.y = top + skillRect.height / 2;
                attempts++;
                
                // Prevent infinite loop
                if (attempts > 100) break;
            } while (placedSkills.some(placed => checkCollision(skill, placed)));
            
            placedSkills.push(skill);
        });
    }
    
    // Function to update positions
    function updatePositions() {
        const containerRect = container.getBoundingClientRect();
        
        skillData.forEach(skill => {
            // Update position
            skill.x += skill.vx;
            skill.y += skill.vy;
            
            const rect = skill.element.getBoundingClientRect();
            const left = skill.x - rect.width / 2;
            const top = skill.y - rect.height / 2;
            
            // Boundary checks - bounce off walls
            if (left <= 0) {
                skill.x = rect.width / 2;
                skill.vx = Math.abs(skill.vx);
            } else if (left + rect.width >= containerRect.width) {
                skill.x = containerRect.width - rect.width / 2;
                skill.vx = -Math.abs(skill.vx);
            }
            
            if (top <= 0) {
                skill.y = rect.height / 2;
                skill.vy = Math.abs(skill.vy);
            } else if (top + rect.height >= containerRect.height) {
                skill.y = containerRect.height - rect.height / 2;
                skill.vy = -Math.abs(skill.vy);
            }
            
            // Apply position
            skill.element.style.left = `${skill.x - rect.width / 2}px`;
            skill.element.style.top = `${skill.y - rect.height / 2}px`;
        });
        
        // Check collisions between all pairs
        for (let i = 0; i < skillData.length; i++) {
            for (let j = i + 1; j < skillData.length; j++) {
                if (checkCollision(skillData[i], skillData[j])) {
                    handleCollision(skillData[i], skillData[j]);
                }
            }
        }
        
        requestAnimationFrame(updatePositions);
    }
    
    // Re-position if window is resized
    window.addEventListener('resize', initializePositions);
});
