// The page scrolls inside <body> (style.css sets html/body to height: 100%; overflow: auto),
// so listen in the capture phase to catch the body's scroll events and read its scrollTop.
document.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY || document.body.scrollTop;
    let windowHeight = window.innerHeight;
    let bodyBefore = document.querySelector('body').style;

    let opacity = Math.min(scrollPosition / (windowHeight * 0.4), 1);
    bodyBefore.backgroundColor = `rgba(36, 40, 41, ${0.6 + opacity * 0.4})`;

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrollPosition > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(container => {
        const containerTop = container.getBoundingClientRect().top;
        const triggerPoint = windowHeight * 0.8;

        if (containerTop < triggerPoint) {
            container.classList.add('visible');
        }
    });
}, true);


