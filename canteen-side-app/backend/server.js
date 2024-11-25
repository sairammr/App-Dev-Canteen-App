const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Order Schema
const OrderSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  items: [{ 
    name: String, 
    quantity: Number,
    price: Number
  }],
  type: { 
    type: String, 
    enum: ['instant', 'delayed'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'completed'], 
    default: 'pending' 
  },
  totalPrice: Number,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Order = mongoose.model('Order', OrderSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001","http://localhost:8081"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/canteen_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle New Order Creation
  socket.on('create_order', async (orderData) => {
    try {
      const newOrder = new Order(orderData);
      await newOrder.save();
      
      // Broadcast to all canteen staff
      io.emit('new_order', newOrder);
    } catch (error) {
      console.error('Order creation error:', error);
      socket.emit('order_error', { message: 'Failed to create order' });
    }
  });

  // Handle Order Status Update
  // Handle Order Status Update
socket.on('update_order_status', async (data) => {
  try {
    const { orderId, status } = data;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );

    if (!updatedOrder) {
      console.error(`Order with ID ${orderId} not found`);
      return;
    }

    // Broadcast order status update to all clients
    io.emit('order_status_updated', updatedOrder);

    // Send notification to user app when order is completed
    if (status === 'completed') {
      io.emit('order_completed_notification', {
        message: `Order ${updatedOrder._id} for ${updatedOrder.studentName} has been completed.`,
        orderId: updatedOrder._id,
        studentName: updatedOrder.studentName,
        items: updatedOrder.items,
      });
    }
  } catch (error) {
    console.error('Order status update error:', error);
  }
});


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// REST API Endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/orders', async (req, res) => {
    try {
      const { studentName, items, type, totalPrice } = req.body;
  
      // Create a new order
      const newOrder = new Order({
        studentName,
        items,
        type,
        totalPrice,
        status: 'pending', // Default status
      });
  
      // Save the order to the database
      const savedOrder = await newOrder.save();
  
      // Emit the order to all WebSocket clients
      io.emit('new_order', savedOrder);
  
      // Send a response to the client
      res.status(200).json(savedOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;