// This script runs after the entire HTML document is fully loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const navItems = navLinks.querySelectorAll("a");

  // Toggle mobile menu on click
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("hidden");
    });
  }

  // Hide mobile menu when a navigation link is clicked
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.add("hidden");
    });
  });

  // Typewriter effect for the hero section
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement) {
    const text =
      "Explore the vibrant life and architecture of Manipal University and its hostels with our one-stop map navigator.";
    let index = 0;

    const typing = setInterval(() => {
      typewriterElement.textContent += text.charAt(index);
      index++;
      if (index === text.length) {
        clearInterval(typing);
      }
    }, 50); // Adjust typing speed here
  }

  // Counter animation using Intersection Observer
  const counters = document.querySelectorAll(".counter");
  const speed = 200; // The total number of steps to reach the target

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
              setTimeout(updateCount, 1);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
          observer.unobserve(counter); // Stop observing after animation
        }
      });
    },
    { threshold: 0.5 }
  ); // Trigger when 50% of the element is visible

  counters.forEach((counter) => {
    observer.observe(counter);
  });

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker failed:', err));
  }
});
