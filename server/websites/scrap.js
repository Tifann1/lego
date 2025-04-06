require('dotenv').config(); // Charge les variables d'environnement
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

const client = new MongoClient(MONGODB_URI);


const scrapeDealabs = require("./dealabs");
const fetchVintedItems = require("./vinted");

async function main() {
    try {
        await client.connect();
        console.log("Connexion réussie à MongoDB");

        const db = client.db(MONGODB_DB_NAME);
        const collectionDeals = db.collection('deals');
        const collectionSales = db.collection('sales');

       

        const deals = await scrapeDealabs();
        const sales = await fetchVintedItems('10425');

        console.log("Dans le fichier scrap");
        console.log("Deals récupérés :", deals.length);
        console.log("Ventes récupérées :", sales.length);

        // Suppression des anciennes données (si besoin)
        //await collectionDeals.deleteMany({});
        //await collectionSales.deleteMany({});
        console.log("Anciennes données supprimées avec succès !");

        // Insertion des nouvelles données
        await collectionDeals.insertMany([...deals]);
        await collectionSales.insertMany([...sales]);
        console.log("Données insérées avec succès !");

    } catch (error) {
        console.error("Erreur :", error);
    } finally {
        await client.close();
        console.log("Connexion MongoDB fermée");
    }
}


async function main2() {
    try {
        await client.connect();
        console.log("Connexion réussie à MongoDB");

        const db = client.db(MONGODB_DB_NAME);
        const collectionDeals = db.collection('deals');
        const collectionSales = db.collection('sales');

       

        for (const deal of await collectionDeals.find().toArray()) {
            const sales = await fetchVintedItems(deal.title);
            console.log("Ventes récupérées :", sales.length);
            await collectionSales.insertMany([...sales]);
            console.log("Données insérées avec succès !");
        }
        const sales = await fetchVintedItems('10425');
        console.log("Ventes récupérées :", sales.length);

        
    } catch (error) {
        console.error("Erreur :", error);
    } finally {
        await client.close();
        console.log("Connexion MongoDB fermée");
    }
}

async function main3() {
    try {
        await client.connect();
        console.log("Connexion réussie à MongoDB");

        const db = client.db(MONGODB_DB_NAME);
        const collectionSales = db.collection('sales');

        const sales = await fetchVintedItems('30690');

        console.log("Ventes récupérées :", sales.length);
        await collectionSales.insertMany([...sales]);
        console.log("Données insérées avec succès !");

    } catch (error) {
        console.error("Erreur :", error);
    } finally {
        await client.close();
        console.log("Connexion MongoDB fermée");
    }
}


main3();

