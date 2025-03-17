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

app.get('/deals/:id', (req, res) => {
  const deal = deals.find(d => d._id === req.params.id);
  
  if (deal) {
      res.json(deal);
  } else {
      res.status(404).json({ error: "Deal not found" });
  }
});
