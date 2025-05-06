let galleryImages = [];
let currentIndex = 0;
let startX = 0;
let endX = 0;
let currentImageIndex = 0;
const images = document.querySelectorAll('.gallery-images img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const spinner = document.getElementById('spinner');

function openLightbox(imgElement) {
    galleryImages = Array.from(document.querySelectorAll('.gallery-images img'));
    currentImageIndex = Array.from(images).indexOf(imgElement);
    lightboxImg.src = imgElement.src;
    spinner.style.display = 'block'; // Show spinner
    lightboxImg.onload = () => {
        spinner.style.display = 'none'; // Hide spinner when image is loaded
    };
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function showLightboxImage() {
    if (galleryImages[currentIndex]) {
        lightboxImg.src = galleryImages[currentIndex].src;
    }
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function (event) {
    if (lightbox.style.display !== 'block') return;
    if (event.key === 'Escape') {
        closeLightbox();
    } else if (event.key === 'ArrowRight') {
        nextImage();
    } else if (event.key === 'ArrowLeft') {
        prevImage();
    }
});

function nextImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showLightboxImage();
}

function prevImage() {
    if (galleryImages.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showLightboxImage();
}

// Attach swipe and drag listeners after DOM is loaded
window.addEventListener('DOMContentLoaded', function () {
    if (lightbox) {
        // Mobile swipe
        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        lightbox.addEventListener('touchmove', (e) => {
            if (!startX) return;

            let endX = e.touches[0].clientX;
            let diffX = startX - endX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left
                    showImage(currentImageIndex + 1);
                } else {
                    // Swipe right
                    showImage(currentImageIndex - 1);
                }
                startX = 0; // Reset startX to prevent multiple swipes
            }
        });
        // Desktop drag
        let isDragging = false;
        lightbox.addEventListener('mousedown', function (e) {
            isDragging = true;
            startX = e.clientX;
        });
        lightbox.addEventListener('mouseup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            endX = e.clientX;
            handleSwipeOrDrag();
        });
        // Prevent image selection while dragging
        lightbox.addEventListener('mousemove', function (e) {
            if (isDragging) {
                e.preventDefault();
            }
        });
    }
});

function handleSwipeOrDrag() {
    const diff = endX - startX;
    if (Math.abs(diff) > 50) { // minimum swipe/drag distance
        if (diff < 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
}

function showImage(index) {
    if (index >= 0 && index < images.length) {
        spinner.style.display = 'block'; // Show spinner
        lightboxImg.src = images[index].src;
        currentImageIndex = index;
        lightboxImg.onload = () => {
            spinner.style.display = 'none'; // Hide spinner when image is loaded
        };
    }
}

.spinner {
    border: 16px solid #f3f3f3; /* Light grey */
    border - top: 16px solid #3498db; /* Blue */
    border - radius: 50 %;
    width: 60px;
    height: 60px;
    animation: spin 2s linear infinite;
    position: absolute;
    top: 50 %;
    left: 50 %;
    transform: translate(-50 %, -50 %);
    z - index: 1001; /* Above the lightbox */
    display: none; /* Hidden by default */
}

@keyframes spin {
    0 % { transform: translate(-50 %, -50 %) rotate(0deg); }
    100 % { transform: translate(-50 %, -50 %) rotate(360deg); }
} 