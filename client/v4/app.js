'use strict';

const API_BASE_URL = 'https://lego-k462x38nh-tifanns-projects.vercel.app';

let allDeals = [];
let allSales = [];

const fetchDeals = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/deals/search`);
    return await res.json();
  } catch (err) {
    console.error('Erreur récupération deals', err);
    return [];
  }
};

const fetchSales = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/search`);
    return await res.json();
  } catch (err) {
    console.error('Erreur récupération sales', err);
    return [];
  }
};

const renderDeals = (deals) => {
  const container = document.getElementById('deals-list');
  container.innerHTML = deals.map(deal => `
    <li>
      ${deal.image ? `<img src="${deal.image}" alt="image">` : ''}
      <div>
        <h3>${deal.title}</h3>
        <p><strong>Prix :</strong> ${deal.price}€</p>
        <p><strong>Température :</strong> ${deal.temperature}°</p>
        ${deal.merchant?.merchantName ? `<p><strong>Fournisseur :</strong> ${deal.merchant.merchantName}</p>` : ''}
        ${deal.nextBestPrice ? `<p><strong>Prochain meilleur prix :</strong> ${deal.nextBestPrice}€</p>` : ''}
        <a href="${deal.dealLink}" target="_blank">👉 Voir l'annonce</a>
      </div>
    </li>`).join('');
};

const renderSales = (sales) => {
  const container = document.getElementById('sales-list');
  container.innerHTML = sales.map(sale => `
    <li class="sale">
    ${Array.isArray(sale.photos) && sale.photos.length > 0 ? 
        `<img src="${photo.url}" alt="${sale.title}" />` : 
        `<div style="width:100px;height:100px;background:#ccc;border-radius:8px;"></div>`
      }
      <div>
        <h3>${sale.title}</h3>
        <p>Prix: ${sale.price.amount} ${sale.price.currency_code}</p>
        <a href="${sale.url}" target="_blank">Voir la vente</a>
      </div>
    </li>`).join('');
};

const setupFilters = () => {
  const minPrice = Math.min(...allDeals.map(d => d.price));
  const maxPrice = Math.max(...allDeals.map(d => d.price));
  const minTemp = Math.min(...allDeals.map(d => d.temperature));
  const maxTemp = Math.max(...allDeals.map(d => d.temperature));

  const priceMinInput = document.getElementById('priceMin');
  const priceMaxInput = document.getElementById('priceMax');
  const tempMinInput = document.getElementById('tempMin');
  const tempMaxInput = document.getElementById('tempMax');

  priceMinInput.min = tempMinInput.min = minPrice;
  priceMaxInput.max = tempMaxInput.max = maxPrice;

  priceMinInput.value = minPrice;
  priceMaxInput.value = maxPrice;
  tempMinInput.value = minTemp;
  tempMaxInput.value = maxTemp;

  const updateFilters = () => {
    const priceMin = parseFloat(priceMinInput.value);
    const priceMax = parseFloat(priceMaxInput.value);
    const tempMin = parseFloat(tempMinInput.value);
    const tempMax = parseFloat(tempMaxInput.value);

    document.getElementById('priceRangeLabel').textContent = `${priceMin}€ - ${priceMax}€`;
    document.getElementById('tempRangeLabel').textContent = `${tempMin}° - ${tempMax}°`;

    const selectedMerchants = [...document.querySelectorAll('#merchantFilter input:checked')].map(e => e.value);
    const sort = document.getElementById('dealSort').value;

    let filtered = allDeals.filter(d =>
      d.price >= priceMin && d.price <= priceMax &&
      d.temperature >= tempMin && d.temperature <= tempMax &&
      (selectedMerchants.length === 0 || selectedMerchants.includes(d.merchant?.merchantName))
    );

    if (sort === 'price') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'temperature') filtered.sort((a, b) => b.temperature - a.temperature);
    else if (sort === 'merchant') filtered.sort((a, b) => (a.merchant?.merchantName || '').localeCompare(b.merchant?.merchantName || ''));

    renderDeals(filtered);
  };

  [priceMinInput, priceMaxInput, tempMinInput, tempMaxInput, document.getElementById('dealSort')].forEach(input => input.addEventListener('input', updateFilters));
  document.getElementById('merchantFilter').addEventListener('change', updateFilters);
  document.getElementById('resetFilters').addEventListener('click', () => {
    priceMinInput.value = minPrice;
    priceMaxInput.value = maxPrice;
    tempMinInput.value = minTemp;
    tempMaxInput.value = maxTemp;
    document.querySelectorAll('#merchantFilter input').forEach(c => c.checked = false);
    document.getElementById('dealSort').value = '';
    updateFilters();
  });

  updateFilters();
};

const setupMerchantFilter = () => {
  const uniqueMerchants = [...new Set(allDeals.map(d => d.merchant?.merchantName).filter(Boolean))];
  const container = document.getElementById('merchantFilter');
  container.innerHTML = uniqueMerchants.map(m => `<label><input type="checkbox" value="${m}"> ${m}</label>`).join('');
};

const setupSaleSearch = () => {
  const input = document.getElementById('saleSearch');
  input.addEventListener('input', () => {
    const search = input.value.toLowerCase();
    const filtered = allSales.filter(s => s.title.toLowerCase().includes(search));
    filtered.sort((a, b) => a.price.amount - b.price.amount);
    renderSales(filtered);
  });
};

const init = async () => {
  allDeals = await fetchDeals();
  allSales = await fetchSales();
  setupMerchantFilter();
  setupFilters();
  setupSaleSearch();
  renderSales(allSales.sort((a, b) => a.price.amount - b.price.amount));
};

document.addEventListener('DOMContentLoaded', init);
