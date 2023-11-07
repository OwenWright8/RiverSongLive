document.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY;
    let windowHeight = window.innerHeight;
    let body = document.querySelector('body::before');
    
    let opacity = Math.min(scrollPosition / (windowHeight * 0.4), 1);
    body.style.backgroundColor = `rgba(36, 40, 41, ${0.6 + opacity * 0.4})`;
});

document.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY;
    let windowHeight = window.innerHeight;
    let opacity = Math.min(scrollPosition / windowHeight, 0.6);
    let landing = document.querySelector('.landing');
    
    landing.style.background = `linear-gradient(rgba(36, 40, 41, ${opacity}), rgba(36, 40, 41, ${opacity})), url('background.jpg') no-repeat center center fixed`;
});

