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
            // Cupid Arrow Animation
            setTimeout(() => {
                triggerCupidArrowSequence();
            }, 500);
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
        resetCupidArrowAnimation();
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
// CUPID ARROW ANIMATION (REALISTIC with MDI Arrow)
// ==========================================
let arrowCanvas, arrowCtx;
let arrowAnimationId = null;
let cupidArrow = null;

class CupidArrow {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 0;
        this.maxSpeed = 40;
        this.angle = 0;

        // State
        this.state = 'hidden'; // hidden, appearing, pulling, flying, hit
        this.pullProgress = 0;
        this.trail = [];
        this.trailLength = 30;

        // Arrow dimensions (more realistic proportions)
        this.length = 140;
        this.tipSize = 24;

        // Particles
        this.sparkles = [];
        this.glowIntensity = 0;
    }

    update() {
        switch (this.state) {
            case 'appearing':
                this.x += (this.startX + 60 - this.x) * 0.08;
                this.glowIntensity = Math.min(1, this.glowIntensity + 0.05);
                if (Math.abs(this.x - (this.startX + 60)) < 1) {
                    this.state = 'ready';
                }
                break;

            case 'pulling':
                this.pullProgress += 0.015;
                if (this.pullProgress >= 1) this.pullProgress = 1;

                // Shake slightly when fully pulled
                if (this.pullProgress >= 1) {
                    this.x = this.startX + 60 - 100 + (Math.random() - 0.5) * 4;
                    this.y = this.startY + (Math.random() - 0.5) * 3;
                    this.glowIntensity = 1 + Math.sin(Date.now() * 0.02) * 0.3;
                } else {
                    this.x = this.startX + 60 - (this.pullProgress * 100);
                    this.glowIntensity = 0.5 + this.pullProgress * 0.5;
                }
                break;

            case 'flying':
                // Add trail with glow effect
                this.trail.push({
                    x: this.x,
                    y: this.y,
                    angle: this.angle,
                    alpha: 1,
                    size: 1
                });
                if (this.trail.length > this.trailLength) {
                    this.trail.shift();
                }

                // Move arrow with slight wobble for realism
                const wobble = Math.sin(Date.now() * 0.01) * 0.5;
                this.x += this.vx;
                this.y += this.vy + wobble;

                // Add sparkles with heart shapes
                if (Math.random() > 0.3) {
                    this.sparkles.push({
                        x: this.x - Math.cos(this.angle) * 70,
                        y: this.y - Math.sin(this.angle) * 70,
                        vx: (Math.random() - 0.5) * 6 - this.vx * 0.1,
                        vy: (Math.random() - 0.5) * 6,
                        size: Math.random() * 6 + 3,
                        alpha: 1,
                        hue: Math.random() * 40 + 330,
                        isHeart: Math.random() > 0.5,
                        rotation: Math.random() * Math.PI * 2
                    });
                }

                // Check if hit target
                const dist = Math.hypot(this.targetX - this.x, this.targetY - this.y);
                if (dist < 60) {
                    this.state = 'hit';
                    return true;
                }
                break;
        }

        // Update sparkles with physics
        this.sparkles = this.sparkles.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.1; // gravity
            s.alpha -= 0.025;
            s.vx *= 0.98;
            s.vy *= 0.98;
            s.rotation += 0.05;
            return s.alpha > 0;
        });

        // Fade trail
        this.trail.forEach((t, i) => {
            t.alpha -= 0.035;
            t.size = (i / this.trail.length);
        });
        this.trail = this.trail.filter(t => t.alpha > 0);

        return false;
    }

    draw(ctx) {
        if (this.state === 'hidden') return;

        // Draw glowing trail
        if (this.trail.length > 1) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Multiple trail layers for glow effect
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);

                for (let i = 1; i < this.trail.length; i++) {
                    const t = this.trail[i];
                    ctx.lineTo(t.x, t.y);
                }

                const layerAlpha = (3 - layer) / 3;
                const layerWidth = 8 + layer * 6;
                ctx.strokeStyle = `rgba(255, 51, 102, ${0.3 * layerAlpha})`;
                ctx.lineWidth = layerWidth;
                ctx.stroke();
            }

            // Core trail
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = 'rgba(255, 200, 220, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        }

        // Draw sparkles (hearts and circles)
        this.sparkles.forEach(s => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.globalAlpha = s.alpha;

            if (s.isHeart) {
                // Draw mini heart
                const hs = s.size;
                ctx.beginPath();
                ctx.moveTo(0, hs * 0.3);
                ctx.bezierCurveTo(0, 0, -hs * 0.5, 0, -hs * 0.5, hs * 0.3);
                ctx.bezierCurveTo(-hs * 0.5, hs * 0.55, 0, hs * 0.8, 0, hs);
                ctx.bezierCurveTo(0, hs * 0.8, hs * 0.5, hs * 0.55, hs * 0.5, hs * 0.3);
                ctx.bezierCurveTo(hs * 0.5, 0, 0, 0, 0, hs * 0.3);
                ctx.fillStyle = `hsla(${s.hue}, 100%, 70%, 1)`;
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${s.hue}, 100%, 75%, 1)`;
            }

            ctx.shadowColor = `hsla(${s.hue}, 100%, 50%, 0.8)`;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
        });

        if (this.state === 'hit') return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Arrow glow effect
        const glowSize = 20 * this.glowIntensity;
        ctx.shadowColor = '#FF3366';
        ctx.shadowBlur = glowSize;

        // Arrow shaft with metallic gradient
        const shaftLength = this.length - this.tipSize;
        const shaftGradient = ctx.createLinearGradient(-shaftLength, 0, 0, 0);
        shaftGradient.addColorStop(0, '#654321');
        shaftGradient.addColorStop(0.3, '#8B6914');
        shaftGradient.addColorStop(0.5, '#D4A84B');
        shaftGradient.addColorStop(0.7, '#8B6914');
        shaftGradient.addColorStop(1, '#654321');

        ctx.strokeStyle = shaftGradient;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-shaftLength, 0);
        ctx.lineTo(-this.tipSize * 0.5, 0);
        ctx.stroke();

        // Arrow tip - Heart shape with gradient
        ctx.save();
        const tipGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.tipSize);
        tipGradient.addColorStop(0, '#FF6B9D');
        tipGradient.addColorStop(0.5, '#FF3366');
        tipGradient.addColorStop(1, '#CC0044');

        const s = this.tipSize;
        ctx.beginPath();
        // Heart-shaped arrowhead
        ctx.moveTo(s * 0.8, 0);
        ctx.lineTo(0, -s * 0.45);
        ctx.bezierCurveTo(-s * 0.2, -s * 0.5, -s * 0.4, -s * 0.25, -s * 0.2, 0);
        ctx.lineTo(-s * 0.4, 0);
        ctx.lineTo(-s * 0.2, 0);
        ctx.bezierCurveTo(-s * 0.4, s * 0.25, -s * 0.2, s * 0.5, 0, s * 0.45);
        ctx.lineTo(s * 0.8, 0);
        ctx.closePath();

        ctx.fillStyle = tipGradient;
        ctx.shadowColor = '#FF3366';
        ctx.shadowBlur = 25;
        ctx.fill();

        // Tip highlight
        ctx.beginPath();
        ctx.arc(s * 0.2, -s * 0.1, s * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();

        // Feathers with gradient
        const featherColors = [
            { base: '#FFB6C8', tip: '#FF8FAB' },
            { base: '#FF8FAB', tip: '#FF5C8D' },
            { base: '#FFB6C8', tip: '#FF8FAB' }
        ];

        for (let i = -1; i <= 1; i++) {
            ctx.save();
            ctx.translate(-shaftLength + 10, 0);
            ctx.rotate(i * 0.3);

            const featherGrad = ctx.createLinearGradient(0, 0, -35, i * 8);
            featherGrad.addColorStop(0, featherColors[i + 1].base);
            featherGrad.addColorStop(1, featherColors[i + 1].tip);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-15, i * 3, -35, i * 10);
            ctx.quadraticCurveTo(-25, i * 2, -25, 0);
            ctx.closePath();

            ctx.fillStyle = featherGrad;
            ctx.shadowColor = '#FF8FAB';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    shoot() {
        this.state = 'flying';
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        this.vx = Math.cos(this.angle) * this.maxSpeed;
        this.vy = Math.sin(this.angle) * this.maxSpeed;
    }
}

function initArrowCanvas() {
    arrowCanvas = document.getElementById('arrowCanvas');
    if (!arrowCanvas) return;

    arrowCtx = arrowCanvas.getContext('2d');
    resizeArrowCanvas();
}

function resizeArrowCanvas() {
    if (!arrowCanvas) return;
    const section = arrowCanvas.closest('.section-10');
    if (section) {
        arrowCanvas.width = section.offsetWidth;
        arrowCanvas.height = section.offsetHeight;
    }
}

function triggerCupidArrowSequence() {
    initArrowCanvas();
    if (!arrowCanvas) return;

    const heart = document.querySelector('.target-heart');
    const heartContainer = document.getElementById('targetHeartContainer');
    const hitFlash = document.querySelector('.hit-flash');
    const pulseRings = document.querySelector('.pulse-rings');

    // Get heart center position
    const heartRect = heartContainer.getBoundingClientRect();
    const canvasRect = arrowCanvas.getBoundingClientRect();
    const targetX = heartRect.left + heartRect.width / 2 - canvasRect.left;
    const targetY = heartRect.top + heartRect.height / 2 - canvasRect.top;

    // Create arrow starting from left
    cupidArrow = new CupidArrow(-100, arrowCanvas.height / 2, targetX, targetY);
    cupidArrow.state = 'appearing';

    // Show heart
    setTimeout(() => {
        heart.classList.add('visible');
    }, 500);

    // Start pulling
    setTimeout(() => {
        cupidArrow.state = 'pulling';
    }, 1200);

    // Shoot!
    setTimeout(() => {
        cupidArrow.shoot();
    }, 2500);

    // Start animation loop
    animateArrow(heart, hitFlash, pulseRings);
}

function animateArrow(heart, hitFlash, pulseRings) {
    if (!arrowCtx || !cupidArrow) return;

    arrowCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);

    const hit = cupidArrow.update();
    cupidArrow.draw(arrowCtx);

    if (hit) {
        // Impact!
        hitFlash.classList.add('active');

        // Heart explosion
        gsap.to(heart, {
            scale: 1.8,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                triggerExplosion();
                pulseRings.classList.add('active');
            }
        });

        // Continue drawing remaining sparkles
        const fadeOut = () => {
            arrowCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
            cupidArrow.sparkles = cupidArrow.sparkles.filter(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.alpha -= 0.02;
                return s.alpha > 0;
            });
            cupidArrow.sparkles.forEach(s => {
                arrowCtx.beginPath();
                arrowCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                arrowCtx.fillStyle = `hsla(${s.hue}, 100%, 70%, ${s.alpha})`;
                arrowCtx.fill();
            });
            if (cupidArrow.sparkles.length > 0) {
                requestAnimationFrame(fadeOut);
            }
        };
        fadeOut();
        return;
    }

    arrowAnimationId = requestAnimationFrame(() => animateArrow(heart, hitFlash, pulseRings));
}

function resetCupidArrowAnimation() {
    if (arrowAnimationId) {
        cancelAnimationFrame(arrowAnimationId);
        arrowAnimationId = null;
    }

    cupidArrow = null;

    if (arrowCtx && arrowCanvas) {
        arrowCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
    }

    const heart = document.querySelector('.target-heart');
    const hitFlash = document.querySelector('.hit-flash');
    const pulseRings = document.querySelector('.pulse-rings');

    if (heart) {
        heart.classList.remove('visible');
        gsap.set(heart, { scale: 1, opacity: 1 });
    }
    if (hitFlash) hitFlash.classList.remove('active');
    if (pulseRings) pulseRings.classList.remove('active');
}

// ==========================================
// REALISTIC LOVE EXPLOSION with Canvas Confetti
// ==========================================
function triggerExplosion() {
    const container = document.getElementById('explosionContainer');
    const section = document.querySelector('.section-10');
    if (!container || !section) return;

    container.innerHTML = '';

    // Get the center position for confetti
    const rect = section.getBoundingClientRect();
    const centerX = 0.5;
    const centerY = 0.5;

    // Create heart shape for confetti
    const heartShape = confetti.shapeFromPath({
        path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        matrix: [0.05, 0, 0, 0.05, -0.6, -0.6]
    });

    // Create star shape for confetti
    const starShape = confetti.shapeFromPath({
        path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        matrix: [0.04, 0, 0, 0.04, -0.5, -0.5]
    });

    // Main heart explosion burst
    const heartColors = ['#FF3366', '#FF5C8D', '#FF8FAB', '#FFB6C8', '#E91E63', '#FFD6E0'];

    // First burst - big hearts
    confetti({
        particleCount: 100,
        spread: 360,
        origin: { x: centerX, y: centerY },
        colors: heartColors,
        shapes: [heartShape],
        scalar: 2.5,
        gravity: 0.8,
        drift: 0,
        ticks: 300,
        startVelocity: 45
    });

    // Second burst - smaller hearts with delay
    setTimeout(() => {
        confetti({
            particleCount: 80,
            spread: 360,
            origin: { x: centerX, y: centerY },
            colors: heartColors,
            shapes: [heartShape],
            scalar: 1.8,
            gravity: 1,
            ticks: 250,
            startVelocity: 35
        });
    }, 100);

    // Third burst - mix of hearts and stars
    setTimeout(() => {
        confetti({
            particleCount: 60,
            spread: 360,
            origin: { x: centerX, y: centerY },
            colors: ['#FFD700', '#FFA500', '#FF6B9D', '#FF3366'],
            shapes: [starShape, heartShape],
            scalar: 1.5,
            gravity: 0.9,
            ticks: 200,
            startVelocity: 30
        });
    }, 200);

    // Side bursts for dramatic effect
    setTimeout(() => {
        // Left burst
        confetti({
            particleCount: 40,
            angle: 60,
            spread: 80,
            origin: { x: 0.2, y: 0.6 },
            colors: heartColors,
            shapes: [heartShape],
            scalar: 2,
            gravity: 1.2,
            ticks: 200,
            startVelocity: 40
        });

        // Right burst
        confetti({
            particleCount: 40,
            angle: 120,
            spread: 80,
            origin: { x: 0.8, y: 0.6 },
            colors: heartColors,
            shapes: [heartShape],
            scalar: 2,
            gravity: 1.2,
            ticks: 200,
            startVelocity: 40
        });
    }, 300);

    // Continuous gentle falling hearts
    let fallingInterval = setInterval(() => {
        confetti({
            particleCount: 3,
            spread: 180,
            origin: { x: Math.random(), y: -0.1 },
            colors: heartColors,
            shapes: [heartShape],
            scalar: 1.5,
            gravity: 1.5,
            drift: (Math.random() - 0.5) * 2,
            ticks: 400,
            startVelocity: 5
        });
    }, 100);

    // Stop falling hearts after 3 seconds
    setTimeout(() => {
        clearInterval(fallingInterval);
    }, 3000);

    // DOM-based explosion for additional visual effect
    const containerRect = container.getBoundingClientRect();

    // Create 3D-like heart explosion in DOM
    for (let i = 0; i < 80; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '♥';

        const size = Math.random() * 35 + 15;
        const color = heartColors[Math.floor(Math.random() * heartColors.length)];
        const depth = Math.random();
        const blur = depth < 0.3 ? 2 : 0;
        const brightness = 50 + depth * 50;

        heart.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            font-size: ${size}px;
            color: ${color};
            text-shadow: 0 0 ${size/2}px ${color}, 0 0 ${size}px ${color};
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: ${Math.floor(depth * 100)};
            filter: blur(${blur}px) brightness(${brightness}%);
        `;
        container.appendChild(heart);

        const angle = (Math.PI * 2 / 80) * i + (Math.random() - 0.5) * 0.8;
        const distance = Math.random() * 500 + 200;
        const gravity = Math.random() * 0.5 + 0.3;

        gsap.to(heart, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance + (gravity * 200),
            opacity: 0,
            scale: Math.random() * 2 + 0.3,
            rotation: Math.random() * 1080 - 540,
            duration: Math.random() * 2.5 + 2,
            ease: 'power2.out',
            onComplete: () => heart.remove()
        });
    }

    // Golden sparkle burst
    for (let i = 0; i < 40; i++) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✦';

        sparkle.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            font-size: ${Math.random() * 20 + 12}px;
            color: #FFD700;
            text-shadow: 0 0 15px #FFD700, 0 0 30px #FFA500;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 150;
        `;
        container.appendChild(sparkle);

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 350 + 150;

        gsap.to(sparkle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0,
            rotation: Math.random() * 720,
            duration: Math.random() * 1.5 + 1,
            ease: 'power2.out',
            onComplete: () => sparkle.remove()
        });
    }

    // Ring shockwave effect
    for (let i = 0; i < 4; i++) {
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 51, 102, 0.9);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 120;
            box-shadow: 0 0 20px rgba(255, 51, 102, 0.5), inset 0 0 20px rgba(255, 51, 102, 0.3);
        `;
        container.appendChild(ring);

        gsap.to(ring, {
            width: 900,
            height: 900,
            opacity: 0,
            borderWidth: 1,
            duration: 1.8,
            delay: i * 0.15,
            ease: 'power2.out',
            onComplete: () => ring.remove()
        });
    }

    // Screen shake effect
    gsap.to('.section-10 .content', {
        x: 8,
        duration: 0.05,
        yoyo: true,
        repeat: 8,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set('.section-10 .content', { x: 0 });
        }
    });

    // Canvas particles burst
    spawnHeartBurst(width / 2, height / 2, 100);

    // ===== AESTHETIC POST-EXPLOSION EFFECTS =====
    // Start aesthetic aftermath after initial explosion
    setTimeout(() => {
        createAestheticAftermath(container, heartShape, heartColors);
    }, 800);
}

// ==========================================
// AESTHETIC POST-EXPLOSION ATMOSPHERE
// ==========================================
function createAestheticAftermath(container, heartShape, heartColors) {
    // Create ambient glow overlay
    const ambientGlow = document.createElement('div');
    ambientGlow.className = 'ambient-glow-overlay';
    ambientGlow.style.cssText = `
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center,
            rgba(255, 51, 102, 0.15) 0%,
            rgba(255, 143, 171, 0.08) 40%,
            transparent 70%);
        pointer-events: none;
        z-index: 5;
        opacity: 0;
    `;
    container.appendChild(ambientGlow);

    gsap.to(ambientGlow, {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out'
    });

    // Floating dreamy hearts - slow and gentle
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            createDreamyHeart(container, heartColors);
        }, i * 150);
    }

    // Continuous dreamy hearts floating up
    const dreamyInterval = setInterval(() => {
        if (document.querySelector('.section-10.active')) {
            createDreamyHeart(container, heartColors);
        } else {
            clearInterval(dreamyInterval);
        }
    }, 400);

    // Soft bokeh particles
    for (let i = 0; i < 20; i++) {
        createBokehParticle(container);
    }

    // Gentle sparkle dust
    createSparkleDust(container);

    // Pulsing center glow
    createPulsingGlow(container);

    // Gentle confetti rain with hearts
    setTimeout(() => {
        gentleHeartRain(heartShape, heartColors);
    }, 1000);
}

function createDreamyHeart(container, colors) {
    const heart = document.createElement('div');
    heart.innerHTML = '♥';

    const size = Math.random() * 20 + 12;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 100;

    heart.style.cssText = `
        position: absolute;
        left: ${startX}%;
        bottom: -50px;
        font-size: ${size}px;
        color: ${color};
        text-shadow: 0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color};
        pointer-events: none;
        z-index: 50;
        opacity: 0;
        filter: blur(${Math.random() > 0.7 ? 1 : 0}px);
    `;
    container.appendChild(heart);

    const duration = Math.random() * 6 + 5;

    gsap.to(heart, {
        y: -(window.innerHeight + 100),
        x: drift,
        opacity: 0.8,
        rotation: (Math.random() - 0.5) * 60,
        duration: duration,
        ease: 'none',
        onUpdate: function() {
            // Gentle swaying motion
            const progress = this.progress();
            const sway = Math.sin(progress * Math.PI * 4) * 20;
            gsap.set(heart, { x: drift + sway });

            // Fade in at start, fade out at end
            if (progress < 0.2) {
                gsap.set(heart, { opacity: progress * 4 });
            } else if (progress > 0.7) {
                gsap.set(heart, { opacity: (1 - progress) * 3.33 });
            }
        },
        onComplete: () => heart.remove()
    });

    // Gentle pulsing
    gsap.to(heart, {
        scale: 1.2,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
    });
}

function createBokehParticle(container) {
    const bokeh = document.createElement('div');
    const size = Math.random() * 80 + 40;
    const colors = [
        'rgba(255, 51, 102, 0.15)',
        'rgba(255, 143, 171, 0.12)',
        'rgba(255, 182, 200, 0.1)',
        'rgba(255, 214, 224, 0.08)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    bokeh.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 3;
        opacity: 0;
    `;
    container.appendChild(bokeh);

    // Gentle floating animation
    gsap.to(bokeh, {
        opacity: 1,
        duration: 2,
        delay: Math.random() * 2,
        ease: 'power2.out'
    });

    gsap.to(bokeh, {
        y: (Math.random() - 0.5) * 100,
        x: (Math.random() - 0.5) * 100,
        scale: Math.random() * 0.5 + 0.8,
        duration: Math.random() * 8 + 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}

function createSparkleDust(container) {
    const dustContainer = document.createElement('div');
    dustContainer.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 60;
        overflow: hidden;
    `;
    container.appendChild(dustContainer);

    // Create multiple sparkle dust particles
    for (let i = 0; i < 40; i++) {
        const dust = document.createElement('span');
        const symbols = ['✦', '✧', '·', '°', '∘'];
        dust.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];

        const size = Math.random() * 10 + 5;
        const colors = ['#FFD700', '#FFF', '#FF8FAB', '#FFB6C8'];

        dust.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            font-size: ${size}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            opacity: 0;
            text-shadow: 0 0 10px currentColor;
            pointer-events: none;
        `;
        dustContainer.appendChild(dust);

        // Twinkling animation
        gsap.to(dust, {
            opacity: Math.random() * 0.8 + 0.2,
            scale: Math.random() * 0.5 + 0.8,
            duration: Math.random() * 2 + 1,
            delay: Math.random() * 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
        });

        // Gentle drifting
        gsap.to(dust, {
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 50,
            duration: Math.random() * 10 + 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

function createPulsingGlow(container) {
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle,
            rgba(255, 51, 102, 0.3) 0%,
            rgba(255, 143, 171, 0.15) 30%,
            transparent 60%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 4;
        opacity: 0;
    `;
    container.appendChild(glow);

    // Fade in
    gsap.to(glow, {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
    });

    // Continuous pulsing
    gsap.to(glow, {
        scale: 1.5,
        opacity: 0.6,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
    });
}

function gentleHeartRain(heartShape, heartColors) {
    // Gentle confetti falling
    const rainInterval = setInterval(() => {
        if (!document.querySelector('.section-10.active')) {
            clearInterval(rainInterval);
            return;
        }

        confetti({
            particleCount: 2,
            spread: 60,
            origin: { x: Math.random(), y: -0.1 },
            colors: heartColors,
            shapes: [heartShape],
            scalar: 1.2,
            gravity: 0.4,
            drift: (Math.random() - 0.5) * 1,
            ticks: 500,
            startVelocity: 3
        });
    }, 250);

    // Stop after 10 seconds
    setTimeout(() => {
        clearInterval(rainInterval);
    }, 10000);
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
