// Main JS file
console.log("Portfolio loaded");
// Add interactivity here

// Navbar event listeners
const hamburger = document.querySelector('.navbar-hamburger');
const mobileMenu = document.querySelector('.navbar-mobile');
const closeBtn = document.querySelector('.navbar-close');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('active');
  mobileMenu.setAttribute('aria-hidden', 'false');
});

closeBtn.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
  mobileMenu.setAttribute('aria-hidden', 'true');
});
