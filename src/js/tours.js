import { loadHeaderFooter } from './utilis.mjs';
import ShoppingCart from './shoppingCart.mjs';

loadHeaderFooter();

const toursContainer = document.querySelector('.tour-list');
const cart = new ShoppingCart('so-cart', null);
let tours = [];

// Handle adding tours to the cart
toursContainer?.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('[data-tour-id]');
    if (!button) return;

    const tour = tours.find(item => item.id === button.dataset.tourId);
    if (!tour) return;

    cart.addItem(tour);
    alert('Tour added to cart!');
    window.setTimeout(() => {
        button.textContent = 'Add to cart';
    }, 1200);
});

// Fetch and display tours from the JSON file
fetch('/json/tours.json')
    .then(response => response.json())
    .then(data => {
        tours = data;
        toursContainer.innerHTML = tours.map(tour => `
            <li class="tour-card">
                <img src="${tour.image}" alt="${tour.imageAlt}" />
                <div class="tour-card__content">
                    <p class="tour-card__category">${tour.category}</p>
                    <h2>${tour.title}</h2>
                    <p class="tour-card__description">${tour.description}</p>
                    <p class="tour-card__details">
                        <span>${tour.duration}</span>
                        <span>$${tour.price} per person</span>
                    </p>
                    <p class="tour-card__schedule">${tour.schedule}</p>
                    <button class="tour-card__book-button" type="button" data-tour-id="${tour.id}">Add to cart</button>
                </div>
            </li>
        `).join('');
    })
    .catch(error => {
        console.error('Error fetching tours:', error);
        toursContainer.innerHTML = '<p>Failed to load tours.</p>';
    });