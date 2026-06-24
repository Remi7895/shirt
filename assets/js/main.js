// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Intersection Observer — features fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${i * 0.1}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.feature-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  // Re-trigger observer for already-visible items
  document.querySelectorAll('.feature-item').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  });
});

// Add .visible class handler
const style = document.createElement('style');
style.textContent = `.feature-item.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// Subtle parallax on hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroTitle.style.transform = `translateY(${y * 0.12}px)`;
    heroTitle.style.opacity = `${1 - y / 500}`;
  }, { passive: true });
}
