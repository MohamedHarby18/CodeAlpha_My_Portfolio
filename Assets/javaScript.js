// ========== CONFIGURATION ==========
const GITHUB_USERNAME = 'MohamedHarby18';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your Formspree ID

// ========== UTILITY: DEBOUNCE ==========
function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ========== UTILITY: THROTTLE ==========
function throttle(fn, limit = 100) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            fn(...args);
        }
    };
}

// ========== PAGE LOAD FADE-IN ==========
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.6s ease';
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initActiveNav();
    initTypingAnimation();
    initSearchFilter();
    initFormSubmission();
    initSectionObserver();
    initParallaxHero();
    initCursorGlow();
    fetchGitHubProjects();
});

// ========== SMOOTH SCROLLING ==========
function initSmoothScroll() {
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========== ACTIVE NAV HIGHLIGHT ==========
function initActiveNav() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section');

    const update = throttle(() => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }, 100);

    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ========== TYPING ANIMATION ==========
function initTypingAnimation() {
    const heading = document.querySelector('.info-box h1');
    if (!heading) return;

    const text = heading.innerText;
    heading.innerText = '';
    heading.style.borderRight = '2px solid rgba(255,255,255,0.7)';
    heading.style.display = 'inline-block';

    let index = 0;
    const type = () => {
        if (index < text.length) {
            heading.innerText += text.charAt(index++);
            setTimeout(type, 55);
        } else {
            // Blinking cursor fade out after typing
            heading.style.animation = 'cursorBlink 0.7s step-end 4 forwards';
            heading.addEventListener('animationend', () => {
                heading.style.borderRight = 'none';
            }, { once: true });
        }
    };
    type();

    // Inject cursor blink keyframe if not already present
    if (!document.getElementById('typingStyle')) {
        const style = document.createElement('style');
        style.id = 'typingStyle';
        style.textContent = `
            @keyframes cursorBlink {
                0%, 100% { border-color: rgba(255,255,255,0.7); }
                50% { border-color: transparent; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== PARALLAX HERO ==========
function initParallaxHero() {
    const hero = document.querySelector('.hero, header, .intro');
    if (!hero) return;

    window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY;
        hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    }, 16), { passive: true });
}

// ========== CURSOR GLOW EFFECT (glassmorphism style) ==========
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.id = 'cursorGlow';
    Object.assign(glow.style, {
        position: 'fixed',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(169, 100%, 50%, 0.56) 0%, transparent 70%)',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.08s ease, top 0.08s ease',
        zIndex: '0',
        mixBlendMode: 'screen',
    });
    document.body.appendChild(glow);

    document.addEventListener('mousemove', throttle((e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    }, 20), { passive: true });
}

// ========== SECTION FADE-IN OBSERVER ==========
function initSectionObserver() {
    // Inject fade-in styles once
    if (!document.getElementById('fadeStyle')) {
        const style = document.createElement('style');
        style.id = 'fadeStyle';
        style.textContent = `
            section {
                opacity: 0;
                transform: translateY(28px);
                transition: opacity 0.65s ease, transform 0.65s ease;
            }
            section.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .project-card {
                opacity: 0;
                transform: translateY(20px) scale(0.97);
                transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
            }
            .project-card.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            .project-card:hover {
                transform: translateY(-6px) scale(1.02);
                box-shadow: 0 20px 60px rgba(120, 80, 255, 0.25);
            }
        `;
        document.head.appendChild(style);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger cards inside sections
                if (entry.target.classList.contains('project-card')) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 80);
                } else {
                    entry.target.classList.add('visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(s => observer.observe(s));
    document.querySelectorAll('.project-card').forEach(c => observer.observe(c));
}

// ========== PROJECT MODAL ==========
function openProjectModal(element) {
    const card = element.closest('.project-card');
    if (!card) return;

    const title = card.querySelector('h3')?.innerText || '';
    const description = card.querySelector('p')?.innerText || '';
    const image = card.querySelector('img')?.src || '';
    const category = card.getAttribute('data-category') || '';
    const githubLink = card.querySelector('a[href*="github"]')?.href || '#';

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = description;
    document.getElementById('modalImg').src = image;
    document.getElementById('modalCategory').innerText = category.toUpperCase();
    document.getElementById('modalGithubLink').href = githubLink;

    const modal = document.getElementById('projectModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Animate modal entry
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.transform = 'scale(0.92) translateY(20px)';
        modalContent.style.opacity = '0';
        modalContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        requestAnimationFrame(() => {
            modalContent.style.transform = 'scale(1) translateY(0)';
            modalContent.style.opacity = '1';
        });
    }
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalContent = modal.querySelector('.modal-content');

    if (modalContent) {
        modalContent.style.transform = 'scale(0.93) translateY(16px)';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }, 280);
    } else {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('projectModal');
    if (e.target === modal) closeProjectModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
});

// ========== SEARCH & FILTER ==========
function initSearchFilter() {
    const searchInput = document.getElementById('projectSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function () {
            filterProjects(this.value.toLowerCase(), getCurrentFilter());
        }, 250));
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProjects(searchInput?.value.toLowerCase() || '', this.getAttribute('data-filter'));
        });
    });
}

function getCurrentFilter() {
    return document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
}

function filterProjects(searchTerm, category) {
    const cards = document.querySelectorAll('.project-card');
    const container = document.getElementById('projectsContainer');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category');
        const matches = title.includes(searchTerm) && (category === 'all' || cardCategory === category);

        if (matches) {
            card.style.display = 'block';
            setTimeout(() => card.classList.add('visible'), 50);
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // No-results message
    if (container) {
        let msg = container.parentElement.querySelector('.no-results');
        if (visibleCount === 0 && !msg) {
            msg = document.createElement('p');
            msg.className = 'no-results';
            Object.assign(msg.style, {
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '2em',
                fontSize: '1.05em',
                letterSpacing: '0.03em',
            });
            msg.innerText = 'No projects found matching your criteria.';
            container.parentElement.appendChild(msg);
        } else if (visibleCount > 0 && msg) {
            msg.remove();
        }
    }
}

// ========== FORM VALIDATION & FORMSPREE SUBMISSION ==========
function initFormSubmission() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearFormMessages();

        if (!validateForm()) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.innerText || 'Send';
        if (submitBtn) {
            submitBtn.innerText = 'Sending…';
            submitBtn.disabled = true;
        }

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action || FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' },
            });

            if (response.ok) {
                showSuccessMessage();
                form.reset();
            } else {
                const data = await response.json();
                const errorEl = document.getElementById('formError');
                if (errorEl) {
                    errorEl.innerText = data?.errors?.[0]?.message || 'Something went wrong. Please try again.';
                    errorEl.classList.add('active');
                }
            }
        } catch {
            const errorEl = document.getElementById('formError');
            if (errorEl) {
                errorEl.innerText = 'Network error. Please check your connection and try again.';
                errorEl.classList.add('active');
            }
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}

function validateForm() {
    let isValid = true;

    const fields = [
        {
            id: 'name',
            errorId: 'nameError',
            validate: v => v.trim().length >= 2,
            message: '* Name must be at least 2 characters',
        },
        {
            id: 'email',
            errorId: 'emailError',
            validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: '* Please enter a valid email address',
        },
        {
            id: 'message',
            errorId: 'messageError',
            validate: v => v.trim().length >= 5,
            message: '* Message must be at least 5 characters',
        },
    ];

    fields.forEach(({ id, errorId, validate, message }) => {
        const field = document.getElementById(id);
        const error = document.getElementById(errorId);
        if (field && error && !validate(field.value)) {
            error.innerText = message;
            error.classList.add('active');
            isValid = false;
        }
    });

    return isValid;
}

function clearFormMessages() {
    ['nameError', 'emailError', 'messageError', 'successMessage', 'formError'].forEach(id => {
        document.getElementById(id)?.classList.remove('active');
    });
}

function showSuccessMessage() {
    const msg = document.getElementById('successMessage');
    if (!msg) return;
    msg.classList.add('active');
    setTimeout(() => msg.classList.remove('active'), 5000);
}

// ========== GITHUB API INTEGRATION ==========
async function fetchGitHubProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    // Show skeleton loaders
    const skeletons = Array.from({ length: 6 }, () => {
        const el = document.createElement('div');
        el.className = 'project-card skeleton';
        Object.assign(el.style, {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            height: '200px',
            animation: 'skeletonPulse 1.4s ease-in-out infinite',
        });
        container.appendChild(el);
        return el;
    });

    // Inject skeleton animation
    if (!document.getElementById('skeletonStyle')) {
        const style = document.createElement('style');
        style.id = 'skeletonStyle';
        style.textContent = `
            @keyframes skeletonPulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: { Accept: 'application/vnd.github.v3+json' },
        });

        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const repos = await response.json();

        // Remove skeletons
        skeletons.forEach(s => s.remove());

        if (!repos.length) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;">No public repositories found.</p>';
            return;
        }

        repos
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6)
            .forEach((repo, i) => {
                const card = buildRepoCard(repo);
                container.appendChild(card);
                // Staggered entrance
                setTimeout(() => card.classList.add('visible'), i * 100);
            });

    } catch (error) {
        skeletons.forEach(s => s.remove());
        console.error('GitHub fetch failed:', error);

        const errMsg = document.createElement('p');
        errMsg.style.cssText = 'text-align:center;color:rgba(255,100,100,0.8);margin-top:1.5em;';
        errMsg.innerText = '⚠ Could not load GitHub projects. Please try again later.';
        container.appendChild(errMsg);
    }
}

function buildRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-title', repo.name.toLowerCase());
    card.setAttribute('data-category', repo.language?.toLowerCase() || 'other');

    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count;
    const forks = repo.forks_count;
    const description = repo.description || 'No description provided.';
    const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    card.innerHTML = `
        <div style="padding: 1.4em; display: flex; flex-direction: column; gap: 0.6em; height: 100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.75em; padding:0.25em 0.7em; border-radius:999px;
                    background:rgba(55, 237, 250, 0.2); color:rgba(180, 243, 255, 0.9); letter-spacing:0.04em;">
                    ${language}
                </span>
                <div style="display:flex; gap:0.9em; font-size:0.8em; color:rgba(255,255,255,0.5);">
                    <span title="Stars">⭐ ${stars}</span>
                    <span title="Forks">🍴 ${forks}</span>
                </div>
            </div>
            <h3 style="margin:0; font-size:1.05em; font-weight:600; color:#fff; letter-spacing:0.01em;">
                ${repo.name}
            </h3>
            <p style="margin:0; font-size:0.88em; color:rgba(255,255,255,0.6); flex:1; line-height:1.5;">
                ${description.length > 100 ? description.slice(0, 97) + '…' : description}
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                <span style="font-size:0.75em; color:rgba(255,255,255,0.35);">Updated ${updatedAt}</span>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
                    style="font-size:0.82em; color:rgba(160,130,255,0.9); text-decoration:none;
                    border:1px solid rgba(120,80,255,0.35); padding:0.25em 0.75em; border-radius:6px;
                    transition:background 0.2s, color 0.2s;"
                    onmouseover="this.style.background='rgba(120,80,255,0.25)'"
                    onmouseout="this.style.background='transparent'">
                    View →
                </a>
            </div>
        </div>
    `;

    return card;
}
