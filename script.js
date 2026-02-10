/* ========================================
   VALENTINE - PAGE NAVIGATION VERSION
   Aku Kamu Version with GIFs
   ======================================== */

// ==========================================
// CONFIG
// ==========================================
const COLORS = {
    pinkPastel: '#FFD6E0',
    pinkRose: '#FF8FAB',
    pinkHot: '#FF5C8D',
    redLove: '#FF3366',
    redDeep: '#E91E63'
};

// ==========================================
// STATE
// ==========================================
let canvas, ctx;
let particles = [];
let cursorX = 0, cursorY = 0;
let width, height;

// Page Navigation State
let currentPage = 0;
let totalPages = 0;
let isAnimating = false;
let sections = [];

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initCursor();
    initPageNavigation();
    initAudio();
    initOpeningSparkles();
    initEnvelopeClick();
    createAmbientParticles();
    animate();
});

// ==========================================
// ENVELOPE TO PAPER PLANE ANIMATION
// ==========================================
let planeCanvas, planeCtx;
let paperPlane = null;
let envelopeClicked = false;

function initEnvelopeClick() {
    const envelope = document.getElementById('loveEnvelope');
    const container = document.getElementById('envelopeContainer');

    if (!envelope || !container) return;

    container.addEventListener('click', handleEnvelopeClick);
}

function handleEnvelopeClick() {
    if (envelopeClicked) return;
    envelopeClicked = true;

    const envelope = document.getElementById('loveEnvelope');
    const plane = document.getElementById('paperPlane');
    const cta = document.getElementById('scrollCta');
    const container = document.getElementById('envelopeContainer');

    // Initialize plane canvas
    initPlaneCanvas();

    // Step 1: Envelope shake and glow
    envelope.classList.add('clicked');
    gsap.to(envelope, {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
    });

    // Step 2: Fold animation (envelope transforms)
    setTimeout(() => {
        // Animate envelope parts folding
        gsap.to(envelope.querySelector('.envelope-flap'), {
            rotateX: 180,
            duration: 0.4,
            ease: 'power2.inOut'
        });

        gsap.to(envelope.querySelector('.envelope-front'), {
            scaleY: 0,
            transformOrigin: 'bottom',
            duration: 0.3,
            delay: 0.2,
            ease: 'power2.in'
        });

        gsap.to(envelope.querySelector('.envelope-letter'), {
            scale: 0.5,
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            ease: 'power2.in'
        });
    }, 400);

    // Step 3: Transform to paper plane
    setTimeout(() => {
        // Hide envelope
        gsap.to(envelope, {
            scale: 0,
            rotation: 45,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in'
        });

        // Get envelope position for plane start
        const containerRect = container.getBoundingClientRect();
        const startX = containerRect.left + containerRect.width / 2;
        const startY = containerRect.top + containerRect.height / 2;

        // Show paper plane at envelope position
        plane.style.left = `${containerRect.width / 2 - 60}px`;
        plane.style.top = `${containerRect.height / 2 - 36}px`;

        gsap.fromTo(plane,
            { opacity: 0, scale: 0, rotation: -45 },
            {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // Step 4: Plane takes off
                    flyPaperPlane(plane, container);
                }
            }
        );
    }, 900);

    // Hide CTA
    gsap.to(cta, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in'
    });
}

function initPlaneCanvas() {
    planeCanvas = document.getElementById('planeCanvas');
    if (!planeCanvas) return;

    const section = planeCanvas.closest('.section-1');
    if (section) {
        planeCanvas.width = section.offsetWidth;
        planeCanvas.height = section.offsetHeight;
    }
    planeCtx = planeCanvas.getContext('2d');
}

function flyPaperPlane(plane, container) {
    const section = container.closest('.section-1');
    const sectionRect = section.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Create trail particles
    const trail = [];
    let animationFrame;

    // Plane flight path (curved, realistic)
    const startX = containerRect.left - sectionRect.left + containerRect.width / 2;
    const startY = containerRect.top - sectionRect.top + containerRect.height / 2;

    // Create animation timeline
    const tl = gsap.timeline();

    // Takeoff - rise up
    tl.to(plane, {
        y: -80,
        rotation: -25,
        duration: 0.6,
        ease: 'power2.out'
    });

    // Curve and accelerate
    tl.to(plane, {
        x: 150,
        y: -120,
        rotation: 15,
        duration: 0.8,
        ease: 'power1.inOut'
    });

    // Swoop down slightly
    tl.to(plane, {
        x: 350,
        y: -60,
        rotation: 5,
        duration: 0.6,
        ease: 'power1.in'
    });

    // Fly up and off screen
    tl.to(plane, {
        x: window.innerWidth + 200,
        y: -300,
        rotation: -15,
        duration: 1.2,
        ease: 'power2.in',
        onUpdate: function() {
            // Add trail particles
            if (Math.random() > 0.5 && planeCtx) {
                const planeRect = plane.getBoundingClientRect();
                trail.push({
                    x: planeRect.left - sectionRect.left,
                    y: planeRect.top - sectionRect.top + planeRect.height / 2,
                    size: Math.random() * 4 + 2,
                    alpha: 1,
                    vx: -Math.random() * 2 - 1,
                    vy: (Math.random() - 0.5) * 2
                });
            }
        },
        onComplete: () => {
            // Plane is gone, go to next page
            setTimeout(() => {
                goToPage(1);
            }, 500);
        }
    });

    // Animate trail
    function animateTrail() {
        if (!planeCtx) return;

        planeCtx.clearRect(0, 0, planeCanvas.width, planeCanvas.height);

        // Update and draw trail
        for (let i = trail.length - 1; i >= 0; i--) {
            const p = trail[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            p.size *= 0.98;

            if (p.alpha <= 0) {
                trail.splice(i, 1);
                continue;
            }

            // Draw heart-shaped particle
            planeCtx.save();
            planeCtx.translate(p.x, p.y);
            planeCtx.globalAlpha = p.alpha;

            // Simple heart
            const s = p.size;
            planeCtx.beginPath();
            planeCtx.moveTo(0, s * 0.3);
            planeCtx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
            planeCtx.bezierCurveTo(-s * 0.5, s * 0.6, 0, s * 0.8, 0, s);
            planeCtx.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.6, s * 0.5, s * 0.3);
            planeCtx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);

            planeCtx.fillStyle = `rgba(255, 143, 171, ${p.alpha})`;
            planeCtx.shadowColor = 'rgba(255, 51, 102, 0.5)';
            planeCtx.shadowBlur = 8;
            planeCtx.fill();

            planeCtx.restore();
        }

        // Add sparkles
        if (Math.random() > 0.7 && plane.style.opacity !== '0') {
            const planeRect = plane.getBoundingClientRect();
            if (planeRect.left > 0) {
                trail.push({
                    x: planeRect.left - sectionRect.left + (Math.random() - 0.5) * 40,
                    y: planeRect.top - sectionRect.top + planeRect.height / 2 + (Math.random() - 0.5) * 20,
                    size: Math.random() * 3 + 1,
                    alpha: 1,
                    vx: -Math.random() * 3 - 2,
                    vy: (Math.random() - 0.5) * 3
                });
            }
        }

        animationFrame = requestAnimationFrame(animateTrail);
    }

    animateTrail();

    // Stop animation after plane is gone
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        if (planeCtx) {
            planeCtx.clearRect(0, 0, planeCanvas.width, planeCanvas.height);
        }
    }, 4000);
}

// ==========================================
// PAGE NAVIGATION
// ==========================================
function initPageNavigation() {
    sections = document.querySelectorAll('.section');
    totalPages = sections.length;

    // Set first page as active
    sections[0].classList.add('active');

    // Keyboard navigation (PC)
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToPage(currentPage + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPage(currentPage - 1);
        }
    });

    // Touch/Swipe navigation (Mobile) - improved precision
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    let isTouching = false;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        isTouching = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        // Prevent browser scroll to avoid content shifting
        if (isTouching) {
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (!isTouching || isAnimating) {
            isTouching = false;
            return;
        }
        isTouching = false;

        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = touchStartY - touchEndY;
        const diffX = touchStartX - touchEndX;
        const timeDiff = Date.now() - touchStartTime;

        // Only trigger if vertical swipe is dominant and significant
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 30 && timeDiff < 800) {
            if (diffY > 0) {
                goToPage(currentPage + 1); // Swipe up = next
            } else {
                goToPage(currentPage - 1); // Swipe down = prev
            }
        }
    }, { passive: true });

    // Mouse wheel navigation (PC)
    let wheelTimeout = null;
    document.addEventListener('wheel', (e) => {
        e.preventDefault();

        if (isAnimating || wheelTimeout) return;

        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 800);

        if (e.deltaY > 0) {
            goToPage(currentPage + 1);
        } else {
            goToPage(currentPage - 1);
        }
    }, { passive: false });

    // Trigger first page animation
    setTimeout(() => {
        triggerPageAnimation(0);
    }, 100);
}

function goToPage(pageIndex) {
    if (isAnimating || pageIndex < 0 || pageIndex >= totalPages || pageIndex === currentPage) {
        return;
    }

    isAnimating = true;

    const oldPage = currentPage;
    currentPage = pageIndex;

    // Update wrapper position using dvh for mobile precision
    const wrapper = document.getElementById('pagesWrapper');
    wrapper.style.transform = `translateY(-${currentPage * 100}%)`;

    // Update active states
    sections[oldPage].classList.remove('active');

    setTimeout(() => {
        sections[currentPage].classList.add('active');
        triggerPageAnimation(currentPage);
        isAnimating = false;
    }, 400);

    // Reset old page animations
    resetPageAnimation(oldPage);
}

// ==========================================
// PAGE ANIMATIONS
// ==========================================
function triggerPageAnimation(pageIndex) {
    const section = sections[pageIndex];
    const sectionNum = pageIndex + 1;

    // Animate lines
    const lines = section.querySelectorAll('.line, .fade-line');
    lines.forEach((line, i) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, i * 200);
    });

    // Animate GIFs
    const gifContainer = section.querySelector('.gif-container');
    if (gifContainer) {
        setTimeout(() => {
            gifContainer.classList.add('visible');
        }, 300);
    }

    // Section-specific animations
    switch (sectionNum) {
        case 10:
            // Play love video
            const loveVideo = document.getElementById('loveVideo');
            if (loveVideo) {
                loveVideo.currentTime = 0;
                loveVideo.play().catch(() => {});
            }
            break;

        case 12:
            // Final message part 1
            const words1 = section.querySelectorAll('.word');
            words1.forEach((word, i) => {
                setTimeout(() => {
                    word.classList.add('visible');
                }, i * 300);
            });
            break;

        case 13:
            // Final message part 2
            const words2 = section.querySelectorAll('.word');
            words2.forEach((word, i) => {
                setTimeout(() => {
                    word.classList.add('visible');
                }, i * 300);
            });
            break;

        case 14:
            // Heart decoration
            setTimeout(() => {
                const deco = section.querySelector('.heart-decoration');
                if (deco) deco.classList.add('visible');
            }, 1000);
            break;

        case 16:
            // Ending animation
            const endingText = section.querySelector('.ending-text');
            const endingSub = section.querySelector('.ending-sub');
            const floatingHearts = section.querySelectorAll('.floating-hearts span');

            if (endingText) {
                setTimeout(() => endingText.classList.add('visible'), 200);
            }
            if (endingSub) {
                setTimeout(() => endingSub.classList.add('visible'), 500);
            }
            floatingHearts.forEach((h, i) => {
                setTimeout(() => h.classList.add('visible'), 800 + i * 150);
            });
            setTimeout(() => createSparkles(), 1000);

            // Start fireworks!
            setTimeout(() => startFireworks(), 600);
            break;
    }
}

function resetPageAnimation(pageIndex) {
    const section = sections[pageIndex];
    const sectionNum = pageIndex + 1;

    // Reset lines
    section.querySelectorAll('.line, .fade-line').forEach(l => {
        l.classList.remove('visible');
    });

    // Reset GIFs
    const gifContainer = section.querySelector('.gif-container');
    if (gifContainer) {
        gifContainer.classList.remove('visible');
    }

    // Reset words
    section.querySelectorAll('.word').forEach(w => {
        w.classList.remove('visible');
    });

    // Section-specific resets
    if (sectionNum === 10) {
        const loveVideo = document.getElementById('loveVideo');
        if (loveVideo) {
            loveVideo.pause();
            loveVideo.currentTime = 0;
        }
    }

    if (sectionNum === 14) {
        const deco = section.querySelector('.heart-decoration');
        if (deco) deco.classList.remove('visible');
    }

    if (sectionNum === 16) {
        section.querySelector('.ending-text')?.classList.remove('visible');
        section.querySelector('.ending-sub')?.classList.remove('visible');
        section.querySelectorAll('.floating-hearts span').forEach(h => {
            h.classList.remove('visible');
        });
        // Stop fireworks when leaving
        stopFireworks();
    }
}

// ==========================================
// OPENING SPARKLES
// ==========================================
function initOpeningSparkles() {
    const container = document.getElementById('openingSparkles');
    if (!container) return;

    // Create random sparkles
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            createOpeningSparkle(container);
        }, i * 200);
    }

    // Keep creating sparkles while on page 1
    setInterval(() => {
        if (currentPage !== 0) return;
        createOpeningSparkle(container);
    }, 300);
}

function createOpeningSparkle(container) {
    const sparkle = document.createElement('span');
    const symbols = ['✦', '✧', '⋆', '∗'];
    sparkle.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 12 + 6;
    const duration = Math.random() * 2 + 1;
    const colors = ['#FFD700', '#FF8FAB', '#FF3366', '#FFF'];

    sparkle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        font-size: ${size}px;
        color: ${colors[Math.floor(Math.random() * colors.length)]};
        opacity: 0;
        pointer-events: none;
        text-shadow: 0 0 10px currentColor;
        animation: sparkleFloat ${duration}s ease-out forwards;
    `;

    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), duration * 1000);
}

// Add sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% { opacity: 0; transform: scale(0) translateY(0); }
        20% { opacity: 1; transform: scale(1) translateY(-10px); }
        100% { opacity: 0; transform: scale(0.5) translateY(-30px); }
    }
`;
document.head.appendChild(sparkleStyle);

// ==========================================
// CANVAS
// ==========================================
function initCanvas() {
    canvas = document.getElementById('main-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// ==========================================
// CURSOR
// ==========================================
function initCursor() {
    const glow = document.querySelector('.cursor-glow');

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (glow) {
            glow.style.left = cursorX + 'px';
            glow.style.top = cursorY + 'px';
        }
    });

    // Spawn hearts on click (but not on audio button)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.audio-btn')) return;
        spawnHeartBurst(e.clientX, e.clientY, 12);
    });
}

// ==========================================
// SPARKLES
// ==========================================
function createSparkles() {
    const container = document.getElementById('sparkles');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 25; i++) {
        const sparkle = document.createElement('span');
        sparkle.innerHTML = '✦';
        sparkle.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            font-size: ${Math.random() * 14 + 8}px;
            color: ${COLORS.redLove};
            opacity: 0;
            pointer-events: none;
        `;
        container.appendChild(sparkle);

        gsap.to(sparkle, {
            opacity: 1,
            scale: 1.3,
            duration: 0.5,
            delay: Math.random() * 2,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut'
        });
    }
}

// ==========================================
// REALISTIC FIREWORKS SYSTEM
// ==========================================
let fireworksCanvas, fireworksCtx;
let fireworks = [];
let fireworkParticles = [];
let fireworksActive = false;
let fireworksInterval = null;

function initFireworks() {
    fireworksCanvas = document.getElementById('fireworksCanvas');
    if (!fireworksCanvas) return;

    fireworksCtx = fireworksCanvas.getContext('2d');
    resizeFireworksCanvas();
    window.addEventListener('resize', resizeFireworksCanvas);
}

function resizeFireworksCanvas() {
    if (!fireworksCanvas) return;
    fireworksCanvas.width = fireworksCanvas.offsetWidth;
    fireworksCanvas.height = fireworksCanvas.offsetHeight;
}

class Firework {
    constructor(x, targetY) {
        this.x = x;
        this.y = fireworksCanvas.height;
        this.targetY = targetY;
        this.speed = Math.random() * 3 + 4;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.trailLength = 15;
        this.exploded = false;
        this.hue = Math.random() * 60 + 330; // Pink to red hues
        this.brightness = 50;
    }

    update() {
        if (this.exploded) return;

        // Add trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.vy += 0.05; // Gravity
        this.x += this.vx;
        this.y += this.vy;

        // Check if reached target
        if (this.vy >= 0 || this.y <= this.targetY) {
            this.explode();
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = Math.floor(Math.random() * 80) + 100;
        const hue = this.hue;

        for (let i = 0; i < particleCount; i++) {
            fireworkParticles.push(new FireworkParticle(this.x, this.y, hue));
        }

        // Add heart-shaped particles
        for (let i = 0; i < 20; i++) {
            fireworkParticles.push(new HeartParticle(this.x, this.y, hue));
        }
    }

    draw(ctx) {
        if (this.exploded) return;

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${alpha * 0.8})`;
            ctx.fill();
        }

        // Draw head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness + 30}%)`;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isDead() {
        return this.exploded;
    }
}

class FireworkParticle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.05;
        this.friction = 0.98;
        this.opacity = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.hue = hue + (Math.random() - 0.5) * 30;
        this.brightness = Math.random() * 30 + 50;
        this.size = Math.random() * 2.5 + 1;
        this.trail = [];
        this.trailLength = 8;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= this.decay;
    }

    draw(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * t.opacity * 0.6;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * (0.3 + (i / this.trail.length) * 0.7), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${alpha})`;
            ctx.fill();
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.opacity})`;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isDead() {
        return this.opacity <= 0;
    }
}

class HeartParticle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.03;
        this.friction = 0.97;
        this.opacity = 1;
        this.decay = Math.random() * 0.012 + 0.005;
        this.hue = hue;
        this.size = Math.random() * 8 + 6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity -= this.decay;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        // Draw heart shape
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, s * 0.55, 0, s * 0.8, 0, s);
        ctx.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.55, s * 0.5, s * 0.3);
        ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);

        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

function launchFirework() {
    if (!fireworksCanvas) return;

    const x = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
    const targetY = Math.random() * fireworksCanvas.height * 0.4 + fireworksCanvas.height * 0.1;

    fireworks.push(new Firework(x, targetY));
}

function startFireworks() {
    if (fireworksActive) return;

    initFireworks();
    fireworksActive = true;

    // Launch initial burst
    for (let i = 0; i < 3; i++) {
        setTimeout(() => launchFirework(), i * 300);
    }

    // Continue launching
    fireworksInterval = setInterval(() => {
        if (Math.random() > 0.3) {
            launchFirework();
        }
    }, 800);

    animateFireworks();
}

function stopFireworks() {
    fireworksActive = false;
    if (fireworksInterval) {
        clearInterval(fireworksInterval);
        fireworksInterval = null;
    }
    fireworks = [];
    fireworkParticles = [];

    if (fireworksCtx && fireworksCanvas) {
        fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
}

function animateFireworks() {
    if (!fireworksActive || !fireworksCtx) return;

    // Clear canvas completely (transparent)
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Update and draw fireworks
    fireworks = fireworks.filter(f => !f.isDead());
    fireworks.forEach(f => {
        f.update();
        f.draw(fireworksCtx);
    });

    // Update and draw particles
    fireworkParticles = fireworkParticles.filter(p => !p.isDead());
    fireworkParticles.forEach(p => {
        p.update();
        p.draw(fireworksCtx);
    });

    requestAnimationFrame(animateFireworks);
}

// ==========================================
// PARTICLE SYSTEM
// ==========================================
class Heart {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.size = opts.size || Math.random() * 10 + 5;
        this.speedX = opts.speedX || (Math.random() - 0.5) * 3;
        this.speedY = opts.speedY || -Math.random() * 2 - 1;
        this.gravity = opts.gravity || 0.05;
        this.opacity = opts.opacity || 1;
        this.decay = opts.decay || 0.012;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;

        const colors = [COLORS.pinkPastel, COLORS.pinkRose, COLORS.pinkHot, COLORS.redLove];
        this.color = opts.color || colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.opacity -= this.decay;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, s * 0.55, 0, s * 0.8, 0, s);
        ctx.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.55, s * 0.5, s * 0.3);
        ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

function createAmbientParticles() {
    for (let i = 0; i < 30; i++) {
        particles.push(new Heart(
            Math.random() * width,
            Math.random() * height,
            {
                size: Math.random() * 6 + 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.4 - 0.2,
                gravity: 0,
                decay: 0.001,
                opacity: Math.random() * 0.3 + 0.1
            }
        ));
    }
}

function spawnHeartBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = Math.random() * 5 + 3;

        particles.push(new Heart(x, y, {
            size: Math.random() * 14 + 8,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            gravity: 0.08,
            decay: 0.015
        }));
    }
}

// Spawn from cursor periodically
let frameCount = 0;
function spawnCursorHeart() {
    if (frameCount % 6 === 0 && cursorX > 0 && cursorY > 0) {
        particles.push(new Heart(
            cursorX + (Math.random() - 0.5) * 20,
            cursorY + (Math.random() - 0.5) * 20,
            {
                size: Math.random() * 8 + 4,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -Math.random() * 2 - 1,
                decay: 0.02
            }
        ));
    }
}

// ==========================================
// ANIMATION LOOP
// ==========================================
function animate() {
    frameCount++;

    ctx.fillStyle = 'rgba(10, 2, 8, 0.12)';
    ctx.fillRect(0, 0, width, height);

    particles = particles.filter(p => !p.isDead());

    while (particles.length < 25) {
        particles.push(new Heart(
            Math.random() * width,
            height + 20,
            {
                size: Math.random() * 5 + 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.6 - 0.3,
                gravity: 0,
                decay: 0.002,
                opacity: Math.random() * 0.25 + 0.1
            }
        ));
    }

    spawnCursorHeart();

    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    if (particles.length > 150) {
        particles = particles.slice(-150);
    }

    requestAnimationFrame(animate);
}

// ==========================================
// AUDIO
// ==========================================
function initAudio() {
    const btn = document.getElementById('audioBtn');
    const music = document.getElementById('bgMusic');
    let isMuted = true;

    music.volume = 0.3;
    btn.classList.add('muted');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMuted = !isMuted;

        if (isMuted) {
            music.pause();
            btn.classList.add('muted');
        } else {
            music.play().catch(() => {
                isMuted = true;
                btn.classList.add('muted');
            });
            btn.classList.remove('muted');
        }
    });
}
