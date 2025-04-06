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

        // Récupérer les nouveaux deals
        const deals = await scrapeDealabs();
        console.log("Deals récupérés :", deals.length);

        // Suppression des anciens deals dans la collection deals
        await collectionDeals.deleteMany({});
        console.log("Anciennes données de deals supprimées avec succès !");

        // Insertion des nouveaux deals dans la collection deals
        await collectionDeals.insertMany(deals);
        console.log("Nouveaux deals insérés avec succès !");

        // Récupérer et ajouter les ventes pour chaque deal
        for (let deal of deals) {
            const sales = await fetchVintedItems(deal.title); // On passe le titre du deal pour récupérer les ventes correspondantes
            console.log(`Ventes récupérées pour le deal "${deal.title}":`, sales.length);

            // Ajouter les ventes à la collection sales
            await collectionSales.insertMany(sales);
        }

        console.log("Toutes les ventes ont été ajoutées à la collection sales avec succès !");
        
    } catch (error) {
        console.error("Erreur :", error);
    } finally {
        await client.close();
        console.log("Connexion MongoDB fermée");
    }
}

main();
