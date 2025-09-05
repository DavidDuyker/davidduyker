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
    // Select only links with .button-link class
    const links = document.querySelectorAll('a.button-link');
    
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
    const element = document.querySelector('.profile-image');
    setTimeout(function() {
        element.classList.add('animate-profile-img');
        element.classList.add('animate-profile-img-speed');
        setTimeout(function() {
            element.classList.remove('animate-profile-img');
        }, 2500);
        setTimeout(function() {
            element.classList.remove('animate-profile-img-speed');
        }, 3000);
    }, 5000);
});