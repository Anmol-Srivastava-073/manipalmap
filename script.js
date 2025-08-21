// Get references to the buttons and the iframe
const campusButton = document.getElementById('campus-button');
const hostelButton = document.getElementById('hostel-button');
const mapFrame = document.getElementById('map-frame');

// Points of Interest cards
const poiCards = document.querySelectorAll('.poi-card');

// Contact form elements
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

// Example map URLs (replace with your own)
const campusMapUrl = "YOUR_CAMPUS_MAP_URL";
const hostelMapUrl = "YOUR_HOSTEL_MAP_URL";

// Map Buttons
if (campusButton && hostelButton && mapFrame) {
    campusButton.addEventListener('click', () => {
        mapFrame.src = campusMapUrl;
    });

    hostelButton.addEventListener('click', () => {
        mapFrame.src = hostelMapUrl;
    });
}

// Points of Interest Cards
poiCards.forEach(card => {
    card.addEventListener('click', () => {
        const location = card.dataset.location;
        console.log(`Clicked on ${location}.`);
        // Example: mapFrame.src = getMapUrlForLocation(location);
    });
});

// Contact Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (name && email && message) {
            console.log('Form submitted:', { name, email, message });

            formMessage.classList.remove('hidden');
            contactForm.reset();

            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        } else {
            console.log('Please fill out all fields.');
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const text = "Explore the vibrant life and architecture of Manipal University and its hostels with our one-stop map navigator.";
    const element = document.getElementById("typewriter");
    let index = 0;

    setTimeout(() => {
        const typing = setInterval(() => {
            element.textContent += text.charAt(index);
            index++;
            if (index === text.length) {
                clearInterval(typing);
            }
        }, 50); // speed of typing in ms
    }, 2000); // delay before typing starts
});

document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("nav-links").classList.toggle("hidden");
});


document.addEventListener("DOMContentLoaded", () => {
    const map = document.querySelector(".glow-map");

    map.addEventListener("click", (e) => {
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = `${e.clientX - map.getBoundingClientRect().left}px`;
        ripple.style.top = `${e.clientY - map.getBoundingClientRect().top}px`;
        map.parentElement.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});
