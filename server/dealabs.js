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

    return $('article.thread')
        .map((i, element) => {
            const title = $(element).find('a.cept-tt.thread-link').text().trim();
            const link = baseUrl + $(element).find('a.cept-tt.thread-link').attr('href');
            const price = $(element).find('.thread-price').text().trim();
            const temperature = parseInt($(element).find('span.overflow--wrap-off').text().trim());
            const merchant = $(element).find('.thread-merchant').text().trim();
            const image = $(element).find('.thread-image img').attr('src');

            return {
                title,
                link,
                price,
                temperature,
                merchant,
                image: image ? baseUrl + image : null,
            };
        })
        .get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns {Promise<Object[]>} - List of deals
 */
module.exports.scrape = async url => {
    const response = await fetch(url);
    if (response.ok) {
        const body = await response.text();
        return parse(body);
    }
    console.error("Error fetching page:", response.status);
    return null;
};
