import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const CanteenDashboard = () => {
  const [instantOrders, setInstantOrders] = useState([]);
  const [delayedOrders, setDelayedOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('instant'); // Tabs: instant | delayed | past

  useEffect(() => {
    // Fetch initial orders from the API
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        const data = await response.json();

        const instant = data.filter((order) => order.type === 'instant' && order.status !== 'completed');
        const delayed = data.filter((order) => order.type === 'delayed' && order.status !== 'completed');
        const past = data.filter((order) => order.status === 'completed');

        setInstantOrders(instant);
        setDelayedOrders(delayed);
        setPastOrders(past);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();

    // Connect to WebSocket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for new orders
    newSocket.on('new_order', (order) => {
      console.log('Received new order:', order);
      if (order.type === 'instant') {
        setInstantOrders((prev) => [...prev, order]);
      } else {
        setDelayedOrders((prev) => [...prev, order]);
      }
    });

    // Listen for status updates
    newSocket.on('order_status_updated', (updatedOrder) => {
      console.log('Order status updated:', updatedOrder);

      // Move to Past Orders if completed
      if (updatedOrder.status === 'completed') {
        setPastOrders((prev) => [...prev, updatedOrder]);

        // Remove from current orders
        if (updatedOrder.type === 'instant') {
          setInstantOrders((prev) => prev.filter((order) => order._id !== updatedOrder._id));
        } else {
          setDelayedOrders((prev) => prev.filter((order) => order._id !== updatedOrder._id));
        }
      } else {
        // Update order in the respective tab
        if (updatedOrder.type === 'instant') {
          setInstantOrders((prev) =>
            prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
          );
        } else {
          setDelayedOrders((prev) =>
            prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
          );
        }
      }
    });

    return () => newSocket.close(); // Cleanup on component unmount
  }, []);

  const handleCompleteOrder = (orderId, type) => {
    // Send complete order event
    socket.emit('update_order_status', { orderId, status: 'completed' });
  };

  const renderOrders = (orders) => {
    return orders.map((order) => (
      <div key={order._id} className="border p-2 mb-2 rounded">
        <div>
          <strong>Order ID:</strong> {order._id}
        </div>
        {order.items.map((item) => (
          <div key={item.name}>
            {item.name} - Qty: {item.quantity}
          </div>
        ))}
        {order.status !== 'completed' && (
          <button
            onClick={() => handleCompleteOrder(order._id, order.type)}
            className="mt-2 bg-blue-500 text-white py-1 px-3 rounded"
          >
            Complete Order
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setActiveTab('instant')}
          className={`py-2 px-4 rounded ${activeTab === 'instant' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Instant Orders
        </button>
        <button
          onClick={() => setActiveTab('delayed')}
          className={`py-2 px-4 rounded ${activeTab === 'delayed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Delayed Orders
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-2 px-4 rounded ${activeTab === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Past Orders
        </button>
      </div>

      {/* Order Columns */}
      {activeTab === 'instant' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Instant Orders</h2>
          {renderOrders(instantOrders)}
        </div>
      )}
      {activeTab === 'delayed' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Delayed Orders</h2>
          {renderOrders(delayedOrders)}
        </div>
      )}
      {activeTab === 'past' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Past Orders</h2>
          {renderOrders(pastOrders)}
        </div>
      )}
    </div>
  );
};

export default CanteenDashboard;
