const express = require('express')
const router = express.Router()

/**
 * Fake Order Storage
 */
let orderStorage = [
  {
    id: 0,
    title: '1 Mountain Bikes & 1 Helmet'
  },
  {
    id: 1,
    title: '2 City Bikes'
  }
];
// Index of the order 
let orderStoreSequence = 2;


// Read Order
router.get('/order', function (req, res) {
  res.send(orderStorage);
})
// Read Order
router.get('/order/:id', function (req, res) {
  const orderId = parseInt(req.params.id);
  const currentOrderIndex = orderStorage.findIndex((element) => { return element.id === orderId; });
  if (currentOrderIndex > -1) {
    res.send(orderStorage[currentOrderIndex]);
  } else {
    res.status(404);
    res.send('Order not found.');
  }
})


// Create Order
router.post('/order', function (req, res) {

  const orderTitle = req.body['title'];
  if (orderTitle) {

    const orderObject = {
      id: orderStoreSequence,
      title: orderTitle
    };
    orderStorage.push(orderObject);
    orderStoreSequence++;
    res.send(orderObject);

  } else {
    res.status(400);
    res.send('The property "title" is missing.');
  }
})


// Update Order
router.put('/order/:id', function (req, res) {

  const orderId = parseInt(req.params.id);
  const orderTitle = req.body['title'];
  if (orderTitle) {

    const currentOrderIndex = orderStorage.findIndex((element) => { return element.id === orderId; });

    if (currentOrderIndex > -1) {
      const orderObject = {
        id: currentOrderIndex,
        title: orderTitle
      };
      orderStorage[currentOrderIndex] = orderObject;
      res.send(orderObject);

    } else {
      res.status(404);
      res.send('Order not found.');
    }

  } else {
    res.status(400);
    res.send('The property "title" or "id" is missing.');
  }
})


// Delete Order
router.delete('/order/:id', function (req, res) {

  const orderId = parseInt(req.params.id);
  const currentOrderIndex = orderStorage.findIndex((element) => { return element.id === orderId; });

  if (currentOrderIndex > -1) {
    const orderObject = orderStorage[currentOrderIndex];
    orderStorage = orderStorage.filter((element) => { return element.id !== orderId; });
    res.send(orderObject);

  } else {
    res.status(404);
    res.send('Order not found.');
  }
})


module.exports = router