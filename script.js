document.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY;
    let windowHeight = window.innerHeight;
    let bodyBefore = document.querySelector('body').style;

    let opacity = Math.min(scrollPosition / (windowHeight * 0.4), 1);
    bodyBefore.backgroundColor = `rgba(36, 40, 41, ${0.6 + opacity * 0.4})`;
});


