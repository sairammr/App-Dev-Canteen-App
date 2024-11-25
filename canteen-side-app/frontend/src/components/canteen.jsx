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
      <div key={order._id} className="mb-4">
        <div className="bg-gray shadow-md rounded-lg p-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div ><h2 className="text-lg font-semibold text-gray-800">Name: {order.studentName}</h2>
            <h3 className="text-m font-normal text-gray-800">Order ID: {order._id}</h3>
            <h3 className="text-sm text-gray-500">Status: {order.status}</h3>

            </div>
            {order.status !== 'completed' && (
              <button
                onClick={() => handleCompleteOrder(order._id, order.type)}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full"
              >
                Complete Order
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-500">Qty: {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));
  };

  return (
    <div>
         <header className="bg-gray-700 text-white p-4 shadow-md">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">SmartBite</h1>
          {/* You can add additional links or buttons in the navbar here */}
        </div>
      </header>
    <div className="p-6">

      {/* Tabs */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveTab('instant')}
          className={`py-2 px-4 rounded-lg ${activeTab === 'instant' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Orders
        </button>
       
        <button
          onClick={() => setActiveTab('past')}
          className={`py-2 px-4 rounded-lg ${activeTab === 'past' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Past Orders
        </button>
      </div>

      {/* Order Columns */}
      {activeTab === 'instant' && (
  <div className="flex space-x-4">
    {/* Instant Orders Section */}
    <div className="border rounded shadow p-4 w-1/2 min-h-[300px] max-h-[800px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Instant Orders</h2>
      {renderOrders(instantOrders)}
    </div>

    {/* Delayed Orders Section */}
    <div className="border rounded shadow p-4 w-1/2 min-h-[300px] max-h-[800px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Delayed Orders</h2>
      {renderOrders(delayedOrders)}
    </div>
  </div>
)}
      
      {activeTab === 'past' && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-bold mb-4">Past Orders</h2>
          {renderOrders(pastOrders)}
        </div>
      )}
    </div></div>
  );
};

export default CanteenDashboard;
