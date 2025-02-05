document.addEventListener('DOMContentLoaded', function () {
    const greetings = ['Yo!', 'Hi!', 'Hey', 'Sup', 'Hoy', 'Hi!', ' 👋 '];
    let currentIndex = 0;

    const profileImage = document.querySelector('.profile-image');
    const greetingText = profileImage.querySelector('p');

    profileImage.addEventListener('mouseenter', function () {
      currentIndex = (currentIndex + 1) % greetings.length;
      greetingText.textContent = greetings[currentIndex];
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Select all links on the page
    const links = document.querySelectorAll('a');
    
    // Iterate through each link
    links.forEach(link => {
        // Create the wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'CornerLinesWrapper';
        
        // Create the corner spans
        const topLeft = document.createElement('span');
        topLeft.className = 'CornerLinesTopLeft';
        
        const topRight = document.createElement('span');
        topRight.className = 'CornerLinesTopRight';
        
        const bottomLeft = document.createElement('span');
        bottomLeft.className = 'CornerLinesBottomLeft';
        
        const bottomRight = document.createElement('span');
        bottomRight.className = 'CornerLinesBottomRight';
        
        // Clone the link's content
        const linkContent = link.cloneNode(true);
    
        
        // Add all elements to the wrapper
        wrapper.appendChild(topLeft);
        wrapper.appendChild(topRight);
        wrapper.appendChild(bottomLeft);
        wrapper.appendChild(bottomRight);
        
        // Add the wrapper to the link
        link.appendChild(wrapper);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const projectImage = document.querySelector('.DSitems');

    const projectGrid = document.querySelector('.DSgrid');

    const container = document.querySelector('#zoomFrame');
    
    // Set initial styles
    container.style.overflow = 'hidden';
    projectImage.style.transition = 'transform 0.2s ease-out';
    projectImage.style.width = '100%';
    projectImage.style.height = '100%';
    projectImage.style.objectFit = 'cover';
    projectImage.style.transform = 'scale(1.05)';

    projectGrid.style.transition = 'transform 0.2s ease-out';
    projectGrid.style.width = '100%';
    projectGrid.style.height = '100%';
    projectGrid.style.objectFit = 'cover';
    projectGrid.style.transform = 'scale(1.05)';
    
    container.addEventListener('mousemove', function(e) {
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position relative to container (0 to 1)
        const xPos = (e.clientX - rect.left) / rect.width;
        const yPos = (e.clientY - rect.top) / rect.height;
        
        // Calculate movement range (in pixels)
        const moveRange = 35;
        const moveRangeFar = 20;
        
        // Calculate translation values
        const xMove = (xPos - 0.5) * moveRange;
        const yMove = (yPos - 0.5) * (moveRange * 0.6);

        const xMoveFar = (xPos - 0.5) * moveRangeFar;
        const yMoveFar = (yPos - 0.5) * (moveRangeFar * 0.6);
        
        // Apply transform
        projectImage.style.transform = `scale(1.09) translate(${-xMove}px, ${-yMove}px)`;
        projectGrid.style.transform = `scale(1.07) translate(${-xMoveFar}px, ${-yMoveFar}px)`;
    });
    
    // Reset position when mouse leaves
    container.addEventListener('mouseleave', function() {
        projectImage.style.transform = 'scale(1.05) translate(0, 0)';
        projectGrid.style.transform = 'scale(1.05) translate(0, 0)';
    });
});