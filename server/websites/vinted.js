const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');  // Importation de chrome-aws-lambda
const fs = require('fs');
const cookiesFilePath = './cookies.json';

let storedCookies = null;

/**
 * Fonction pour récupérer et sauvegarder les cookies dans un fichier.
 */
async function getCookies() {
    console.log("Fonction de récupération des cookies");
    
    // Utilisation de chromium pour lancer le navigateur sur Vercel
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: await chromium.executablePath, // Utilisation du chemin de Chromium fourni par chrome-aws-lambda
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    // Va sur la page de connexion de Vinted
    await page.goto('https://www.vinted.fr/');

    // Attends que la page suivante soit chargée (tu peux attendre un élément visible après connexion)
    await page.waitForSelector('body');

    const cookies = await page.cookies();

    // Sauvegarde les cookies dans un fichier JSON
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));

    console.log('Cookies récupérés et sauvegardés.');
    storedCookies = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    // Ferme le navigateur
    await browser.close();
}

/**
 * Fonction pour charger les cookies depuis le fichier.
 */
function loadCookiesFromFile() {
    if (fs.existsSync(cookiesFilePath)) {
        console.log('Chargement des cookies depuis le fichier...');
        const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
        storedCookies = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        console.log('Cookies chargés depuis le fichier.');
    }
}

/**
 * Fonction de récupération des cookies avec gestion d'erreur
 */
async function fetchWithRetry(url, options) {
    let response = await fetch(url, options);

    // Si une erreur 401, 402, 403, ou 404 est rencontrée, on récupère les cookies et réessaye
    if (response.status === 401 || response.status === 402 || response.status === 403 || response.status === 404) {
        console.log('Erreur d\'authentification, tentative de récupération des cookies...');

        // Si les cookies ne sont pas déjà stockés, on tente de les récupérer
        if (!storedCookies) {
            console.log('Cookies non stockés, récupération...');
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

/**
 * Fonction pour récupérer les articles depuis l'API Vinted avec gestion des cookies
 */
async function fetchVintedItems(searchText, page = 1, perPage = 96) {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=${perPage}&search_text=${encodeURIComponent(searchText)}`;
    const options = {
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }
    };

    try {
        // Avant de faire l'appel, on charge les cookies depuis le fichier
        loadCookiesFromFile();

        const response = await fetchWithRetry(url, options);

        if (response.ok) {
            const data = await response.json();
            return data.items;  // Retourne les articles récupérés
        } else {
            console.log("Erreur lors de la récupération des articles:", response.status);
            return [];  // Retourne un tableau vide en cas d'erreur
        }
    } catch (error) {
        console.error("Erreur dans fetchVintedItems:", error);
        return [];  // Retourne un tableau vide en cas d'erreur réseau
    }
}

module.exports = fetchVintedItems;
