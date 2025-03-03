// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const errorMessage = document.querySelector('#error-message');
const selectSort = document.querySelector('#sort-select');





// Fonction pour afficher les erreurs
const showError = (message) => {
  errorMessage.textContent = message;
};

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};





/**
 * Récupérations des deals DEALABS
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const baseUrl = `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`;

    const response = await fetch(baseUrl);
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    console.log(body.data);
    
    return body.data;

  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};


const fetchVintedDealsById = async (id) => {
  try {
    const baseUrl = `https://lego-api-blue.vercel.app/sales?id=${id}`;
    const response = await fetch(baseUrl);
    const body = await response.json();

    //console.log("Réponse complète de l'API :", JSON.stringify(body, null, 2));

    if (!body || !body.data) {
      console.error("Erreur lors de la récupération des données Vinted", body);
      return [];
    }

    return body.data;
  } catch (error) {
    console.error("Erreur lors du fetch Vinted :", error);
    return [];
  }
};



/**
 * 
 * @param {Array} deals 
 * @returns Affichage HTML des indicateurs de prix
 */
const renderPriceIndicators = (deals) => {
  if (deals.length === 0) {
    document.getElementById("indicators").innerHTML = "Aucune donnée de prix disponible.";
    return;
  }

  // Extraction des prix et tri croissant
  const prices = deals.map(deal => parseFloat(deal.price)).sort((a, b) => a - b);

  console.log("Prix triés :", prices);
  // Calcul des valeurs
  const average = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
  const p5 = getPercentile(prices, 5);
  const p25 = getPercentile(prices, 25);
  const p50 = getPercentile(prices, 50);

  // Mise à jour du DOM
  document.getElementById("indicators").innerHTML = `
  <h2>Indicators</h2>
    <p>Prix moyen : ${average.toFixed(2)}€</p>
    <p>P5 : ${p5}€</p>
    <p>P25 : ${p25}€</p>
    <p>P50 (médiane) : ${p50}€</p>
  `;
};

// Fonction pour récupérer un centile
const getPercentile = (sortedArray, percentile) => {
  const index = Math.floor((percentile / 100) * sortedArray.length);
  return sortedArray[index] || 0; // Si pas de valeur, on retourne 0
};


const renderLifetimeValue = (deals) => {
  if (deals.length === 0) {
    document.getElementById("indicators2").innerHTML = "Aucune donnée disponible.";
    return;
  }

  // Extraction et tri des dates
  const dates = deals.map(deal => new Date(deal.published)).sort((a, b) => a - b);

  const firstDate = dates[0];  // La plus ancienne
  const lastDate = dates[dates.length - 1]; // La plus récente

  const lifetimeDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)); // Différence en jours

  // Mise à jour du DOM
  document.getElementById("indicators2").innerHTML = `
  <h2>Indicators2</h2>
    <p>Première publication : ${firstDate.toLocaleDateString()}</p>
    <p>Dernière publication : ${lastDate.toLocaleDateString()}</p>
    <p>Durée de vie du marché: ${lifetimeDays} jours</p>
  `;
};












/**
 * Fonction pour afficher les deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

const renderDealsVinted = (deals) => {
  const container = document.getElementById("deals");
  container.innerHTML = "<h2>Deals :</h2>";

  deals.forEach(deal => {
    const dealElement = document.createElement("div");
    dealElement.classList.add("deal");

    dealElement.innerHTML = `
      <h3>Deal :</h3>
      <p><strong>Nom :</strong> ${deal.title}</p>
      <p><strong>Prix :</strong> ${deal.price}€</p>
      <p><strong>Date :</strong> ${new Date(deal.published).toLocaleDateString()}</p>
      <a href="${deal.link}" target="_blank">Voir l'annonce</a>
    `;

    container.appendChild(dealElement);
  });
};

/**
 * Render PAGINATION selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};


/**
 * Fonction pour trier les deals selon le critère sélectionné
 * @param {Array} deals - Liste des deals
 * @param {String} criterion - Critère de tri ('price-asc', 'price-desc', 'date-asc', 'date-desc')
 * @returns {Array} - Liste triée des deals
 */
const sortDeals = (deals, criterion) => {
  return deals.slice().sort((a, b) => {
    switch (criterion) {
      case 'price-asc':
        return a.price - b.price; // Moins cher en premier
      case 'price-desc':
        return b.price - a.price; // Plus cher en premier
      case 'date-asc':
        return new Date(a.published) - new Date(b.published); // Plus récent en premier
      case 'date-desc':
        return new Date(b.published) - new Date(a.published); // Plus ancien en premier
      default:
        return 0; // Aucun tri par défaut
    }
  });
};





/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Fonction pour afficher les indicateurs
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};


// Fonction principale RENDU
const render = (deals, pagination, byId = false) => {

  if (byId) {
    console.log("Rendu par ID");
    // const sortedDeals = sortDeals(deals, selectSort.value);
    // renderDeals(sortedDeals);
    renderPriceIndicators(deals); 
    renderLifetimeValue(deals);
    renderDealsVinted(deals);
  } else {
  const sortedDeals = sortDeals(deals, selectSort.value);
  renderDeals(sortedDeals);
  renderPagination(pagination);
  renderLegoSetIds(deals);
  renderIndicators(pagination);
  }
};





/**
 * Declaration of all Listeners
 */

/**
 * NUMBER of DEALS TO DISPLAY
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * PAGE TO DISPLAY
 */
selectPage.addEventListener('change', async (event) => {
  const newPage = parseInt(event.target.value); // Récupère la page sélectionnée
  console.log("Nouvelle page sélectionnée :", newPage);

  // Met à jour les données avec la nouvelle page
  const deals = await fetchDeals(newPage, selectShow.value); //prend en compte le nb de deals sur 1 page
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * SORT 
 */
selectSort.addEventListener('change', () => {
  render(currentDeals, currentPagination);
});


/**
 * LEGO SET ID
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const dealsVinted = await fetchVintedDealsById(event.target.value);

  currentDeals = dealsVinted.result;

  //Display number of deals
  spanNbDeals.innerHTML = currentDeals.length;

  console.log(currentDeals);
  render(currentDeals, null, true);
});


//Chargement Initial
document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();


  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
