const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll('.gallery-img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
    document.body.classList.add('noscroll');
  });
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
  document.body.classList.remove('noscroll');
  lightboxImg.src = '';
});

// Fast shake animation for logo
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('click', function (e) {
    e.preventDefault();
    logo.classList.remove('shake');
    // Force reflow to restart animation
    void logo.offsetWidth;
    logo.classList.add('shake');
  });
  logo.addEventListener('animationend', function (e) {
    if (e.animationName === 'logoShake') {
      logo.classList.remove('shake');
    }
  });
}
