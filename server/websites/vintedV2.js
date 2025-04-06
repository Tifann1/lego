const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // à ajouter si ce n'est pas déjà dans ton projet

const cookiesFilePath = path.resolve(__dirname, './cookies.json');

let storedCookies = null;

/**
 * Sauvegarde les cookies dans un fichier à partir de la page Vinted.
 */
async function saveCookiesToFile() {
    console.log("Récupération et sauvegarde des cookies...");

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto('https://www.vinted.fr/');
    await page.waitForSelector('body');

    const cookies = await page.cookies();
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
    console.log("Cookies sauvegardés dans le fichier.");

    await browser.close();
}

/**
 * Charge les cookies depuis le fichier, les stocke dans `storedCookies`.
 */
function loadCookies() {
    if (fs.existsSync(cookiesFilePath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
        storedCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    } else {
        console.warn("Fichier de cookies introuvable.");
    }
}

/**
 * Récupère les articles Vinted avec les cookies. 
 * Si les cookies échouent, affiche une erreur claire.
 */
async function fetchItemsUsingCookies(searchText, page = 1, perPage = 96) {
    loadCookies();

    const url = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=${perPage}&search_text=${encodeURIComponent(searchText)}`;

    const headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    };

    if (storedCookies) {
        headers["Cookie"] = storedCookies;
    }

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (response.ok) {
            const data = await response.json();
            return data.items;
        } else {
            console.error(`Erreur HTTP (${response.status}) — Problème de cookie probable.`);
            return [];
        }
    } catch (err) {
        console.error("Erreur réseau lors de la récupération des articles :", err);
        return [];
    }
}


saveCookiesToFile()


module.exports = {
    saveCookiesToFile,
    fetchItemsUsingCookies
};
