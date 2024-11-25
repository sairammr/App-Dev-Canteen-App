const axios = require('axios');

const API_URL = 'http://localhost:5000/api/orders'; // Your backend API endpoint for adding orders

// Function to generate a random order
const generateOrder = () => {
  const types = ['instant', 'delayed'];
  const items = [
    { name: 'Burger', price: 150 },
    { name: 'Pizza', price: 200 },
    { name: 'Pasta', price: 180 },
    { name: 'Fries', price: 100 },
    { name: 'Salad', price: 120 },
  ];
  
  // Select random items for the order
  const selectedItems = Array.from({ length: Math.ceil(Math.random() * 3) }, () => {
    const item = items[Math.floor(Math.random() * items.length)];
    return { name: item.name, quantity: Math.ceil(Math.random() * 3), price: item.price };
  });

  const totalPrice = selectedItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return {
    studentName: `Student-${Math.floor(Math.random() * 1000)}`,
    items: selectedItems,
    type: types[Math.floor(Math.random() * types.length)],
    totalPrice,
  };
};

// Function to add an order to the database
const addOrder = async () => {
  const newOrder = generateOrder();
  try {
    const response = await axios.post(API_URL, newOrder);
    console.log('New order added:', response.data);
  } catch (error) {
    console.error('Error adding order:', error.response?.data || error.message);
  }
};

// Add a new order every 5 seconds
setInterval(addOrder, 5000);
