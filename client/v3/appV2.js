'use strict';

const API_BASE_URL = 'https://lego-ki20kta5j-tifanns-projects.vercel.app';

/**
 * Fetch deals from the API
 */
const fetchDeals = async () => {
  try {
    console.log('Fetching deals...');
    const response = await fetch(`${API_BASE_URL}/deals/search`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

/**
 * Fetch sales from the API
 */
const fetchSales = async () => {
  try {
    console.log('Fetching sales...');
    const response = await fetch('https://lego-ki20kta5j-tifanns-projects.vercel.app/sales/search')//(`${API_BASE_URL}/sales/search`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

/**
 * Render deals
 */
const renderDeals = (deals) => {
  const container = document.getElementById('deals-list');
  console.log('Rendering deals:', deals);
  container.innerHTML = deals.map(deal => `
    <div class="deal">
      <h3>${deal.title}</h3>
      <p>Prix: ${deal.price}€</p>
      <a href="${deal.link}" target="_blank">Voir l'annonce</a>
    </div>
  `).join('');
};

/**
 * Render sales
 */
const renderSales = (sales) => {
  const container = document.getElementById('sales-list');
  console.log('Rendering sales:', sales);
  container.innerHTML = sales.map(sale => `
    <div class="sale">
      <h3>${sale.title}</h3>
      <p>Prix: ${sale.price}€</p>
      <a href="${sale.link}" target="_blank">Voir l'article vendu</a>
    </div>
  `).join('');
};

/**
 * Initialize the app
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initialized');
  const deals = await fetchDeals();
  const sales = await fetchSales();
  renderDeals(deals);
  renderSales(sales);
});
