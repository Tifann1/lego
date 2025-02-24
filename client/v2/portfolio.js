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
 * // Fonction pour récupérer les deals
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
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

/**
 * Render page selector
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
  console.log(deals);
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
const render = (deals, pagination) => {
  const sortedDeals = sortDeals(deals, selectSort.value); // Trie selon la sélection actuelle
  renderDeals(sortedDeals);
  renderPagination(pagination);
  renderLegoSetIds(deals);
  renderIndicators(pagination);
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



//Chargement Initial
document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});
