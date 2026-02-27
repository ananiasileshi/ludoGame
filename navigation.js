document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const playButtons = document.querySelectorAll('#play-now-nav, #play-now-cta, #read-more-btn, #media-coverage-btn');
    
    console.log('Navigation.js loaded, found play buttons:', playButtons.length);

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });

    playButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                setTimeout(() => {
                    if (typeof game !== 'undefined' && game.showSetup) {
                        game.showSetup();
                    } else if (typeof window.showSetup === 'function') {
                        window.showSetup();
                    }
                }, 100);
            });
        }
    });

    initPreviewBoard();
    setupDownloadButtons();
    setupContactForm();
});

function setupDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const buttonText = button.textContent.trim();
            
            if (buttonText.includes('Play Online')) {
                if (typeof game !== 'undefined' && game.showSetup) {
                    game.showSetup();
                }
            } else {
                alert(`${buttonText} download would redirect to app store in a real implementation.`);
            }
        });
    });
}

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form-fields');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const topic = contactForm.querySelector('select').value;
            const message = contactForm.querySelector('textarea').value;
            
            if (name && email && topic && message) {
                alert(`Thank you ${name}! Your message has been sent. We'll get back to you at ${email} soon.`);
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
}

function initPreviewBoard() {
    const previewCanvas = document.getElementById('preview-board');
    if (!previewCanvas) return;

    const ctx = previewCanvas.getContext('2d');
    const size = 400;
    const cellSize = size / 15;
    
    previewCanvas.width = size;
    previewCanvas.height = size;

    function drawPreviewBoard() {
        ctx.clearRect(0, 0, size, size);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        for (let i = 0; i <= 15; i++) {
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, size);
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(size, i * cellSize);
            ctx.stroke();
        }

        const colors = ['#dc2626', '#2563eb', '#16a34a', '#eab308'];
        const baseAreas = [
            {x: 0, y: 0, color: colors[0]},
            {x: 0, y: 9, color: colors[1]},
            {x: 9, y: 9, color: colors[2]},
            {x: 9, y: 0, color: colors[3]}
        ];

        baseAreas.forEach(area => {
            ctx.fillStyle = area.color + '40';
            ctx.fillRect(area.x * cellSize, area.y * cellSize, 6 * cellSize, 6 * cellSize);
            
            ctx.strokeStyle = area.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(area.x * cellSize, area.y * cellSize, 6 * cellSize, 6 * cellSize);
        });

        const centerArea = {x: 6, y: 6, width: 3, height: 3};
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(centerArea.x * cellSize, centerArea.y * cellSize, centerArea.width * cellSize, centerArea.height * cellSize);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerArea.x * cellSize, centerArea.y * cellSize, centerArea.width * cellSize, centerArea.height * cellSize);

        const pathSquares = [
            {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5},
            {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
            {x: 6, y: 9}, {x: 6, y: 10}, {x: 6, y: 11}, {x: 6, y: 12}, {x: 6, y: 13},
            {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6},
            {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
            {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8},
            {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13},
            {x: 9, y: 8}, {x: 10, y: 8}, {x: 11, y: 8}, {x: 12, y: 8}, {x: 13, y: 8}
        ];

        pathSquares.forEach(square => {
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(square.x * cellSize + 2, square.y * cellSize + 2, cellSize - 4, cellSize - 4);
        });

        const homeSquares = [
            {x: 7, y: 1, color: colors[0]}, {x: 7, y: 2, color: colors[0]}, {x: 7, y: 3, color: colors[0]},
            {x: 1, y: 7, color: colors[1]}, {x: 2, y: 7, color: colors[1]}, {x: 3, y: 7, color: colors[1]},
            {x: 7, y: 13, color: colors[2]}, {x: 7, y: 12, color: colors[2]}, {x: 7, y: 11, color: colors[2]},
            {x: 13, y: 7, color: colors[3]}, {x: 12, y: 7, color: colors[3]}, {x: 11, y: 7, color: colors[3]}
        ];

        homeSquares.forEach(square => {
            ctx.fillStyle = square.color + '80';
            ctx.fillRect(square.x * cellSize + 2, square.y * cellSize + 2, cellSize - 4, cellSize - 4);
        });

        const tokenPositions = [
            {x: 2.5, y: 2.5, color: colors[0]},
            {x: 3.5, y: 3.5, color: colors[0]},
            {x: 2.5, y: 11.5, color: colors[1]},
            {x: 3.5, y: 12.5, color: colors[1]},
            {x: 11.5, y: 11.5, color: colors[2]},
            {x: 12.5, y: 12.5, color: colors[2]},
            {x: 11.5, y: 2.5, color: colors[3]},
            {x: 12.5, y: 3.5, color: colors[3]}
        ];

        tokenPositions.forEach(token => {
            const x = token.x * cellSize;
            const y = token.y * cellSize;
            const radius = cellSize * 0.3;

            ctx.fillStyle = token.color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawPreviewBoard();

    let animationFrame = 0;
    function animatePreview() {
        animationFrame++;
        if (animationFrame % 120 === 0) {
            drawPreviewBoard();
        }
        requestAnimationFrame(animatePreview);
    }
    animatePreview();
}
