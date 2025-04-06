'use strict';

const API_BASE_URL = 'https://lego-k462x38nh-tifanns-projects.vercel.app';

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
    const response = await fetch(`${API_BASE_URL}/sales/search`);
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
    <li>
      ${deal.image ? `<img src="${deal.image}" alt="Image du deal" style="max-width: 100%; height: auto;"/>` : ''}
      <h3>${deal.title}</h3>
      <p><strong>Prix :</strong> ${deal.price}€</p>
      <p><strong>Température :</strong> ${deal.temperature}°</p>
      ${deal.merchant?.merchantName ? `<p><strong>Fournisseur :</strong> ${deal.merchant.merchantName}</p>` : ''}
      ${deal.nextBestPrice ? `<p><strong>Prochain meilleur prix :</strong> ${deal.nextBestPrice}€</p>` : ''}
      <a href="${deal.dealLink}" target="_blank">👉 Voir l'annonce</a>
    </li>
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
      <p>Prix: ${sale.price.amount} ${sale.price.currency_code}</p>
      <div class="photos">
        ${sale.photos.map(photo => `<img src="${photo.url}" alt="${sale.title}" />`).join('')}
      </div>
      <p>Nombre de vues: ${sale.view_count}</p>
      <a href="${sale.url}" target="_blank">Voir la vente</a>
    </div>
  `).join('');
};



/**
 * UPDATE DEALS
 */
async function updateDealsBeforeFetch() {
  try {
    const response = await fetch(`${API_BASE_URL}/update-deals`);
    const result = await response.json();
    if (result.success) {
      console.log('Deals mis à jour !');
    } else {
      console.error('Erreur lors de l actualisation :', result.message);
    }
  } catch (error) {
    console.error('Erreur réseau update-deals :', error);
  }
}

/**
 * Initialize the app
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initialized');
    await updateDealsBeforeFetch();
    const deals = await fetchDeals();
    const sales = await fetchSales();
    renderDeals(deals);
    renderSales(sales);
});
