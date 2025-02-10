const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

const BASE_URL = "https://www.vinted.fr/api/v2/catalog/items";

let storedCookies = null;

async function getCookies() {
    // Lance Puppeteer et ouvre un navigateur
    const browser = await puppeteer.launch({ headless: false }); // 'headless: false' pour voir ce que le navigateur fait
    const page = await browser.newPage();

    // Va sur la page de connexion de Vinted
    await page.goto('https://www.vinted.fr/');

    // Attends que la page suivante soit chargée (tu peux attendre un élément visible après connexion)
    await page.waitForNavigation();  // Attends que la page après la connexion soit chargée

    // Récupère les cookies du navigateur
    const cookies = await page.cookies();

    console.log('Cookies récupérés:', cookies); // Affiche les cookies

    storedCookies = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    console.log('Cookies récupérés et stockés:', storedCookies);

    // Ferme le navigateur
    await browser.close();
}
getCookies().catch(console.error);



//Fonction pour la requête avec gestion erreurs COOKIES
async function fetchWithRetry(url, options) {
    let response = await fetch(url, options);

    // Si une erreur 401, 402, 403, ou 404 est rencontrée, on récupère les cookies et réessaye
    if (response.status === 401 || response.status === 402 || response.status === 403 || response.status === 404) {
        console.log('Erreur d\'authentification, tentative de récupération des cookies...');

        if (!storedCookies) {
            console.log('cookies non stockés, récupération...');
            await getCookies();  
        }

        // Réessayer la requête avec les cookies récupérés
        const retryOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Cookie': storedCookies  // Ajouter les cookies récupérés
            }
        };

        response = await fetch(url, retryOptions);  // Réessaie la requête
    }

    return response;
}




async function fetchVintedItems(searchText, page = 1, perPage = 96) {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=${perPage}&search_text=${encodeURIComponent(searchText)}`;
    const options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }
    };

    const response = await fetchWithRetry(url, options);

    if (response.ok) {
        const data = await response.json();
        console.log("Articles récupérés:", data.items.slice(0, 5));
    } else {
        console.log("Erreur lors de la récupération des articles:", response.status);
    }
}

// Exemple d'utilisation
async function fetchVintedItems(searchText, page = 1, perPage = 96) {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=${perPage}&search_text=${encodeURIComponent(searchText)}`;
    const options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }
    };

    const response = await fetchWithRetry(url, options);

    if (response.ok) {
        const data = await response.json();
        console.log("Articles récupérés:", data.items.slice(0, 5));
    } else {
        console.log("Erreur lors de la récupération des articles:", response.status);
    }
}

// Appel pour récupérer les articles
fetchVintedItems("lego").catch(console.error);




