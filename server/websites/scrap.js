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

        // Insérer des deals (exemple)
        // const deals = [
        //     { setId: 1, name: "Millennium Falcon", price: 129.99, discount: 20, comments: 15, date: new Date("2024-02-20"), scrapedAt: new Date() },
        //     { setId: 2, name: "Death Star", price: 499.99, discount: 10, comments: 30, date: new Date("2024-02-25"), scrapedAt: new Date() },
        //     { setId: 3, name: "AT-AT", price: 199.99, discount: 25, comments: 5, date: new Date("2024-02-18"), scrapedAt: new Date() },
        //     { setId: 4, name: "X-Wing", price: 79.99, discount: 15, comments: 8, date: new Date("2024-02-22"), scrapedAt: new Date() },
        //     { setId: 5, name: "Tie Fighter", price: 64.99, discount: 30, comments: 12, date: new Date("2024-02-21"), scrapedAt: new Date("2024-02-10") },
        //     { setId: 6, name: "Imperial Star Destroyer", price: 699.99, discount: 5, comments: 50, date: new Date("2024-02-26"), scrapedAt: new Date() },
        // ];

        // await collection.deleteMany({});
        // await collection.insertMany(deals);
        // console.log("Deals insérés avec succès : ", await collection.countDocuments());



        const deals = await scrapeDealabs();
        const sales = await fetchVintedItems();

        console.log("Dans le fichier scrap");
        console.log("Deals récupérés :", deals.length);
        console.log("Ventes récupérées :", sales.length);

        // Suppression des anciennes données (si besoin)
        await collectionDeals.deleteMany({});
        await collectionSales.deleteMany({});
        console.log("Anciennes données supprimées avec succès !");

        // Insertion des nouvelles données
        await collectionDeals.insertMany([...deals]);
        await collectionSales.insertMany([...sales]);
        console.log("Données insérées avec succès !");

        
        // Appel des méthodes pour tester
        // console.log("\nBest Discounts : ", await findBestDiscountDeals(db));
        // console.log("\nMost Commented : ", await findMostCommentedDeals(db));
        // console.log("\nSorted by Price : ", await findDealsSortedByPrice(db));
        // console.log("\nSorted by Date : ", await findDealsSortedByDate(db));
        // console.log("\nSales for Set ID 3 : ", await findSalesBySetId(db, 3));
        // console.log("\nSales < 3 weeks : ", await findSalesLessThan3WeeksOld(db));

    } catch (error) {
        console.error("Erreur :", error);
    } finally {
        await client.close();
        console.log("Connexion MongoDB fermée");
    }
}

async function findBestDiscountDeals(db) {
    return await db.collection('lego').find().sort({ discount: -1 }).toArray();
}

async function findMostCommentedDeals(db) {
    return await db.collection('lego').find().sort({ comments: -1 }).toArray();
}

async function findDealsSortedByPrice(db) {
    return await db.collection('lego').find().sort({ price: 1 }).toArray();
}

// Du plus récent au plus ancien
async function findDealsSortedByDate(db) {
    return await db.collection('lego').find().sort({ date: -1 }).toArray();
}


async function findSalesBySetId(db, setId) {
    return await db.collection('lego').find({ setId: setId }).toArray();
}


async function findSalesLessThan3WeeksOld(db) {
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    return await db.collection('lego').find({ scrapedAt: { $gte: threeWeeksAgo } }).toArray();
}

main();

