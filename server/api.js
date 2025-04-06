const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`Running on port ${PORT}`);



const { MongoClient } = require('mongodb');
require('dotenv').config(); // Charger les variables d'environnement

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

let client;

async function getMongoClient() {
    if (!client) {
        client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect(); // Connexion unique et réutilisable
    }
    return client;
}




//Endpoints 

app.get('/deals/search', async (req, res) => {
    try {
        const mongoClient = await getMongoClient(); // Obtenir la connexion persistante
        const db = mongoClient.db(DB_NAME);

        let query = {};
        let sort = {};

        // Filtres optionnels
        if (req.query.price) {
            query.price = { $lte: parseFloat(req.query.price) };  // Prix max
        }
        if (req.query.date) {
            const fromDate = new Date(req.query.date);
            query.date = { $gte: fromDate };  // Deals publiés après cette date
        }
        if (req.query.filterBy === "best-discount") {
            sort.discount = -1;
        } else if (req.query.filterBy === "most-commented") {
            sort.comments = -1;
        } else if (req.query.filterBy === "cheapest") {
            sort.price = 1;
        }

        const limit = parseInt(req.query.limit) || 12;

        const deals = await db.collection('deals').find(query).sort(sort).limit(limit).toArray();
        res.json(deals);

    } catch (error) {
        console.error("Erreur MongoDB :", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.get('/sales/search', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      await client.connect();
      const db = client.db(DB_NAME);
      let query = {};
      
      // Filtre par ID du set LEGO
      if (req.query.legoSetId) {
          query.setId = req.query.legoSetId;
      }

      const limit = parseInt(req.query.limit) || 12;

      const sales = await db.collection('sales').find(query).sort({ scrapedAt: -1 }).limit(limit).toArray();
      res.json(sales);

  } catch (error) {
      console.error("Erreur MongoDB :", error);
      res.status(500).json({ error: "Internal Server Error" });
  } finally {
      await client.close();
  }
});



app.get('/deals/:id', (req, res) => {
  const deal = deals.find(d => d.id === req.params.id);
  
  if (deal) {
      res.json(deal);
  } else {
      res.status(404).json({ error: "Deal not found" });
  }
});


app.get('/update-deals', async (req, res) => {
    try {
        const scrapeDealabs = require("./websites/dealabs.js");
        const mongoClient = await getMongoClient(); 
        const db = mongoClient.db(DB_NAME); 

        const collectionDeals = db.collection('deals');
        const deals = await scrapeDealabs();

        console.log("Dans le fichier scrap");
        console.log("Deals récupérés :", deals.length);

        // Suppression des anciennes données (si besoin)
        await collectionDeals.deleteMany({});
        console.log("Anciennes données supprimées avec succès !");

        // Insertion des nouvelles données
        await collectionDeals.insertMany([...deals]);
        console.log("Données insérées avec succès !");

        res.status(200).json({ success: true, message: 'Deals mis à jour avec succès' });
    } catch (error) {
        console.error("Erreur dans /update-deals :", error);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour des deals' });
    }
});





//Endpoint TEST CONNEXION MONGO
app.get('/test-db-connection', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      console.log("Connexion à MongoDB...");
      await client.connect();
      res.json({ message: "Connexion à MongoDB réussie" });
  } catch (error) {
      console.error("Erreur de connexion MongoDB :", error);
      res.status(500).json({ error: "Erreur de connexion MongoDB" });
  } finally {
      await client.close();
  }
});

app.get('/check-deals-count', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      await client.connect();
      const db = client.db(DB_NAME);
      const count = await db.collection('deals').countDocuments();
      console.log("Nombre de documents dans deals :", count);
      res.json({ count });
  } catch (error) {
      console.error("Erreur de requête MongoDB :", error);
      res.status(500).json({ error: "Erreur de requête MongoDB" });
  } finally {
      await client.close();
  }
});


app.get('/test-deals-query', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      await client.connect();
      const db = client.db(DB_NAME);
      const top5Deals = await db.collection('deals').find({}).limit(5).toArray();
      console.log("Top 5 deals récupérés :", top5Deals);
      res.json(top5Deals);
  } catch (error) {
      console.error("Erreur de requête MongoDB :", error);
      res.status(500).json({ error: "Erreur de requête MongoDB" });
  } finally {
      await client.close();
  }
});

app.get('/test-sales-query', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      await client.connect();
      const db = client.db(DB_NAME);
      const top5Deals = await db.collection('sales').find({}).limit(5).toArray();
      console.log("Top 5 sales récupérés :", top5Deals);
      res.json(top5Deals);
  } catch (error) {
      console.error("Erreur de requête MongoDB :", error);
      res.status(500).json({ error: "Erreur de requête MongoDB" });
  } finally {
      await client.close();
  }
});