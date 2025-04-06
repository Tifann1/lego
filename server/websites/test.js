import { saveCookiesToFile, fetchItemsUsingCookies } from './vintedV2.js';

const main = async () => {
    await saveCookiesToFile();  // si tu veux d’abord rafraîchir les cookies
    const items = await fetchItemsUsingCookies("lego");
    console.log(items);
};

main();
