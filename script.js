document.addEventListener("DOMContentLoaded", () => {

  // ---- Navbar scroll state ----
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  // ---- Mobile menu toggle ----
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  // Close mobile menu on link click
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll("section[id], div[id='hero']");
  const navAnchors = document.querySelectorAll(".nav-links a");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  document.querySelectorAll("section[id]").forEach(s => sectionObserver.observe(s));

  // ---- Reveal on scroll ----
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // ---- Counter animation ----
  const counters = document.querySelectorAll(".counter");

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = +el.getAttribute("data-target");
          const duration = 1400;
          const step = Math.ceil(target / (duration / 16));
          let current = 0;

          const tick = () => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString();
            if (current < target) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => counterObserver.observe(c));

  // ---- Service Worker ----
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("SW registered:", reg))
      .catch(err => console.log("SW failed:", err));
  }
});
