// ===== GREETING ANIMATION FUNCTION =====
// This function creates an interactive greeting animation on the profile image
// When the user hovers over the profile image, it cycles through different greetings
document.addEventListener('DOMContentLoaded', function () {
    // Array of different greeting messages to cycle through
    const greetings = ['Yo!', 'Hi!', 'Hey', 'Sup', 'Hoy', 'Hi!', ' 👋 '];
    let currentIndex = 0; // Track which greeting is currently displayed

    // Get references to the profile image and the greeting text element inside it
    const profileImage = document.querySelector('.profile-image');
    const greetingText = profileImage.querySelector('p');

    // Add mouse enter event listener to the profile image
    profileImage.addEventListener('mouseenter', function () {
        // Cycle to the next greeting in the array (loop back to 0 when reaching the end)
        currentIndex = (currentIndex + 1) % greetings.length;
        // Update the greeting text with the new message
        greetingText.textContent = greetings[currentIndex];
    });
});

// ===== CORNER LINES ANIMATION FUNCTION =====
// This function adds decorative corner lines to all links on the page
// Creates a visual effect with corner elements that can be styled with CSS
document.addEventListener('DOMContentLoaded', function() {
    // Select all links on the page
    const links = document.querySelectorAll('a');
    
    // Iterate through each link to add corner decorations
    links.forEach(link => {
        // Create a wrapper div to contain the corner elements
        const wrapper = document.createElement('div');
        wrapper.className = 'CornerLinesWrapper';
        
        // Create four corner span elements for decorative purposes
        const topLeft = document.createElement('span');
        topLeft.className = 'CornerLinesTopLeft';
        
        const topRight = document.createElement('span');
        topRight.className = 'CornerLinesTopRight';
        
        const bottomLeft = document.createElement('span');
        bottomLeft.className = 'CornerLinesBottomLeft';
        
        const bottomRight = document.createElement('span');
        bottomRight.className = 'CornerLinesBottomRight';
        
        // Clone the link's content to preserve it
        const linkContent = link.cloneNode(true);
    
        
        // Add all corner elements to the wrapper
        wrapper.appendChild(topLeft);
        wrapper.appendChild(topRight);
        wrapper.appendChild(bottomLeft);
        wrapper.appendChild(bottomRight);
        
        // Add the wrapper with corner elements to the original link
        link.appendChild(wrapper);
    });
});

// ===== PROFILE IMAGE ANIMATION FUNCTION =====
// This function adds a delayed animation to the profile image
// Creates a subtle entrance effect after the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the profile image element
    const element = document.querySelector('.profile-image');
    
    // Set a timeout to delay the animation start
    setTimeout(function() {
        // Add animation classes to trigger the entrance effect
        element.classList.add('animate-profile-img');
        element.classList.add('animate-profile-img-speed');
        
        // Remove the main animation class after 2.5 seconds
        setTimeout(function() {
            element.classList.remove('animate-profile-img');
        }, 2500);
        
        // Remove the speed animation class after 3 seconds
        setTimeout(function() {
            element.classList.remove('animate-profile-img-speed');
        }, 3000);
    }, 5000); // Wait 5 seconds before starting the animation
});