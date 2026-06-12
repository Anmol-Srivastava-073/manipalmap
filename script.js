document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navItems = navLinks.querySelectorAll("a");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("hidden");
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.add("hidden");
    });
  });

  // Smooth Header Background on Scroll
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-lg', 'bg-black/80');
      header.classList.remove('bg-black/60');
    } else {
      header.classList.remove('shadow-lg', 'bg-black/80');
      header.classList.add('bg-black/60');
    }
  });

  // Typewriter effect logic
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement) {
    const text = "Explore the life and architecture of Manipal University with a high-performance map navigator.";
    let index = 0;

    const typing = setInterval(() => {
      typewriterElement.textContent += text.charAt(index);
      index++;
      if (index === text.length) {
        clearInterval(typing);
      }
    }, 40); // Slightly faster for a snappier feel
  }

  // Counter animation logic
  const counters = document.querySelectorAll(".counter");
  const speed = 150; 

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute("data-target");
          
          const updateCount = () => {
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
              counter.innerText = Math.ceil(count + increment);
              setTimeout(updateCount, 10);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
          observer.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully'))
      .catch(err => console.log('Service Worker failed:', err));
  }
});
