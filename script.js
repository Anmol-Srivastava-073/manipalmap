// Typewriter effect
document.addEventListener("DOMContentLoaded", () => {
  const text = "Explore the vibrant life and architecture of Manipal University and its hostels with our one-stop map navigator.";
  const element = document.getElementById("typewriter");
  let index = 0;
  setTimeout(() => {
    const typing = setInterval(() => {
      element.textContent += text.charAt(index);
      index++;
      if (index === text.length) clearInterval(typing);
    }, 50);
  }, 2000);
});

// Mobile Menu Toggle
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("hidden");
});

// Counter animations
const counters = document.querySelectorAll('.counter');
let started = false;
const speed = 50;

function animateCounters() {
  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = Math.ceil(target / speed);
      if (count < target) {
        counter.innerText = count + increment;
        setTimeout(updateCount, 40);
      } else {
        counter.innerText = target + "+";
      }
    };
    updateCount();
  });
}

window.addEventListener("scroll", () => {
  const statsSection = document.getElementById("stats");
  if (!started) {
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      started = true;
      animateCounters();
    }
  }
});

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker failed:', err));
  }


