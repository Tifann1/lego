const fetch = require('node-fetch');
const cheerio = require('cheerio');

const baseUrl = "https://www.dealabs.com";

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object[]} deals - List of deals
 */
const parse = data => {
    const $ = cheerio.load(data);

    return $('article').map((i, element) => {
        const jsonText = $(element).find('.js-vue2').attr('data-vue2');
        if(!jsonText) return null;

        try {
            const json = JSON.parse(jsonText);
            
            if (json.name === "ThreadMainListItemNormalizer") {
                // 🎯 Création des raccourcis
                const thread = json.props.thread;
                
                // 📌 Infos générales
                const id = thread.threadId;
                const title = thread.title;
                const titleSlug = thread.titleSlug;
                const status = thread.status;
                const isExpired = thread.isExpired;
                const type = thread.type; // Deal, Code promo, etc.
                
                // 🔥 Popularité
                const temperature = thread.temperature;
                const temperatureLevel = thread.temperatureLevel;
                const isTrending = thread.isTrending;
                
                // 💰 Prix & Réduction
                const price = thread.price;
                const nextBestPrice = thread.nextBestPrice;
                const discountType = thread.discountType;
                
                // 📦 Livraison
                const shipping = {
                    isFree: thread.shipping.isFree === 1,
                    price: thread.shipping.price
                };
                
                // 📅 Dates
                const startDate = thread.startDate?.timestamp || null;
                const endDate = thread.endDate?.timestamp || null;                
                
                // 🔗 Liens
                const dealLink = thread.link;
                const shareableLink = thread.shareableLink;
                
                // 🛍️ Marchand
                const merchant = thread.merchant;
                
                // 👤 Utilisateur
                const user = {
                    id: thread.user.userId,
                    username: thread.user.username,
                    isBanned: thread.user.isBanned
                };
                
                // 🏷️ Catégorie
                const category = {
                    id: thread.mainGroup.threadGroupId,
                    name: thread.mainGroup.threadGroupName,
                    url: thread.mainGroup.threadGroupUrlName
                };
        
                // 🖼️ Image principale
                const image = thread.mainImage ? `https://static.dealabs.com/${thread.mainImage.path}` : null;
        
                // 🎯 Objet final pour stockage
                const deal = {
                    id,
                    title,
                    titleSlug,
                    status,
                    isExpired,
                    type,
                    temperature,
                    temperatureLevel,
                    isTrending,
                    price,
                    nextBestPrice,
                    discountType,
                    shipping,
                    startDate,
                    endDate,
                    dealLink,
                    shareableLink,
                    merchant,
                    user,
                    category,
                    image
                };
        
                return deal;}
        } catch (e) {
            console.error("❌ Erreur de parsing JSON:", e);
        }
    }).get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns {Promise<Object[]>} - List of deals
 */
module.exports.scrape = async url => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Referer": "https://www.google.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Cache-Control": "no-cache"
        }
    });
    if (response.ok) {
        const body = await response.text();
        return parse(body);
    }
    console.error("Error fetching page:", response.status);
    return null;
};


(async () => {
    const url = "https://www.dealabs.com"; 
    const deals = await module.exports.scrape(url);
    console.log("📢 Deals scrappés:");

    deals.forEach(deal => {
        if (deal) {
            console.log(`- ${deal.id} - ${deal.title} - ${deal.price} - ${deal.temperature}° - ${deal.category.name}`);
        }
    });})();


