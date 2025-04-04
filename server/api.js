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

console.log(`📡 Running on port ${PORT}`);



//Connexion a Mongo 
require('dotenv').config(); // Charge les variables d'environnement
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

const client = new MongoClient(MONGODB_URI);




//Fonctions de trie
async function findBestDiscountDeals(db) {
  return await db.collection('deals').find().sort({ discount: -1 }).toArray();
}

async function findMostCommentedDeals(db) {
  return await db.collection('deals').find().sort({ comments: -1 }).toArray();
}

async function findDealsSortedByPrice(db) {
  return await db.collection('deals').find().sort({ price: 1 }).toArray();
}

async function findDealsSortedByDate(db) {
  return await db.collection('deals').find().sort({ date: -1 }).toArray();
}

async function findSalesBySetId(db, setId) {
  return await db.collection('sales').find({ setId: setId }).toArray();
}

async function findSalesLessThan3WeeksOld(db) {
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  return await db.collection('sales').find({ scrapedAt: { $gte: threeWeeksAgo } }).toArray();
}






//ENDPOINTS
const deals = [
  {
      "_id": "9f778cb0-19f5-59d7-8e2a-4d945627d43e",
      "link": "https://www.dealabs.com/bons-plans/lego-harry-potter-le-chateau-et-le-domaine-de-poudlard-76419-via-3498-sur-la-carte-fidelite-3014312",
      "retail": 139.9,
      "price": 104.92,
      "discount": 25,
      "temperature": 159.27,
      "photo": "https://static-pepper.dealabs.com/threads/raw/atFEj/3014312_1/re/300x300/qt/60/3014312_1.jpg",
      "comments": 4,
      "published": 1741307146,
      "title": "Jeu de construction Lego Harry Potter - Le Château et le Domaine de Poudlard 76419",
      "id": "76419",
      "community": "dealabs"
  }
];

app.get('/deals/search', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);
  try {
      await client.connect();
      const db = client.db(DB_NAME);
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
  } finally {
      await client.close();
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
