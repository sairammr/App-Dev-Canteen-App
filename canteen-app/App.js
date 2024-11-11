import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Camera, ShoppingCart, Clock, Plus, Check, Minus } from 'lucide-react-native';

// Sample images for products (replace these with actual image URLs)
const productImages = {
  1: require('./assets/splash.png'), // Replace with actual paths
  2: require('./assets/1.jpeg'),
  3: require('./assets/splash.png'),
  4: require('./assets/splash.png'),
  5: require('./assets/splash.png'),
  6: require('./assets/splash.png'),
};

// Stack Navigator Setup
const Stack = createStackNavigator();

// Login Page
const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Reset the navigation stack and navigate to Home
    navigation.reset({
      index: 0, // Set the Home screen as the first screen in the stack
      routes: [{ name: 'SmartBite' }], // Navigate to the Home screen
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button style={styles.loginButton} title="Login" onPress={handleLogin} />
    </View>
  );
};

// Home Page
const HomePage = ({ navigation, route }) => {
  const [orderStatus, setOrderStatus] = useState(route.params?.orderStatus || null);
  const [orderTimer, setOrderTimer] = useState(600); // 10 minutes

  useEffect(() => {
    let interval;
    if (orderStatus) {
      interval = setInterval(() => {
        setOrderTimer((prevTimer) => {
          if (prevTimer <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderStatus]);

  useEffect(() => {
    if (route.params?.orderStatus) {
      setOrderStatus(true);
      setOrderTimer(600);
    }
  }, [route.params?.orderStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => navigation.navigate('InstantProducts')}
        >
          <Camera color="white" size={48} />
          <Text style={styles.optionText}>Instant Food</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => navigation.navigate('DelayedProducts')}
        >
          <Clock color="white" size={48} />
          <Text style={styles.optionText}>Delayed Food</Text>
        </TouchableOpacity>
      </View>

      {orderStatus && (
        <View style={styles.orderStatusContainer}>
          <View style={styles.orderStatusCard}>
            <Text style={styles.orderStatusTitle}>Your order is getting ready</Text>
            <View style={styles.orderStatusContent}>
              <Clock color="#FF8303" size={24} />
              <Text style={styles.orderTimer}>
                {Math.floor(orderTimer / 60)}:{String(orderTimer % 60).padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Products Page
const ProductsPage = ({ navigation, route }) => {
  const { products } = route.params;
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleRemoveFromCart = (product) => {
    const index = cart.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    navigation.navigate('Payment', { cart });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image source={productImages[item.id]} style={styles.productImage} />
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
            <View style={styles.cartControls}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleRemoveFromCart(item)}
                disabled={!cart.find((i) => i.id === item.id)}
              >
                <Text style={styles.cartButtonText}>
                  <Minus color="white" size={19}/>
                </Text>
              </TouchableOpacity>
              <Text style={styles.cartCount}>
                {cart.filter((i) => i.id === item.id).length}
              </Text>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleAddToCart(item)}
              >
                <Plus color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.checkoutContainer}>
        <Text style={styles.cartTotal}>
          Total: ${cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <ShoppingCart color="white" size={24} />
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Payment Page (unchanged)
const PaymentPage = ({ navigation, route }) => {
  const { cart } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('gpay');

  const handlePayment = () => {
    Alert.alert('Payment Successful', 'Your order is getting ready.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('SmartBite', { orderStatus: true }),
      },
    ]);
  };

  const cartItems = cart.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.paymentContainer}>
        <Text style={styles.title}>Payment</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItemContainer}>
              <Text style={styles.productTitle}>
                {item.name} ({item.quantity}x)
              </Text>
              <Text style={styles.productPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          )}
        />
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.paymentMethod, paymentMethod === 'gpay' && styles.selectedPaymentMethod]}
          onPress={() => setPaymentMethod('gpay')}
        >
          <Camera color="white" size={32} />
          <Text style={styles.paymentMethodText}>Google Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// App Component with Stack Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="SmartBite" component={HomePage} />
        <Stack.Screen name="InstantProducts" component={ProductsPage} initialParams={{ products: [
          { id: 1, name: 'Sandwich', price: 5 },
          { id: 2, name: 'Salad', price: 8 },
          { id: 3, name: 'Soup', price: 4 },
          { id: 4, name: 'Sandwich', price: 5 },
          { id: 5, name: 'Sandwich', price: 5 },
          { id: 6, name: 'Salad', price: 8 },
          { id: 7, name: 'Soup', price: 4 },
          { id: 8, name: 'Sandwich', price: 5 },

        ]}} />
        <Stack.Screen name="DelayedProducts" component={ProductsPage} initialParams={{ products: [
          { id: 4, name: 'Pasta', price: 12 },
          { id: 5, name: 'Pizza', price: 15 },
          { id: 6, name: 'Burger', price: 10 },
        ]}} />
        <Stack.Screen name="Payment" component={PaymentPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0E3CA', // Light beige background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1B1A17', // Dark brown text
  },
  input: {
    height: 40,
    borderColor: '#A35709', // Darker brown border color
    borderWidth: 0.3,
    marginBottom: 32,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  optionContainer: {
    alignItems: 'center',
    backgroundColor: '#FF8303', // Orange background for buttons
    padding: 20,
    borderRadius: 12,
    width: '100%', // Fixed width for button
    marginTop: 22,
  },
  loginButton:{
backgroundColor:"#FF8303"
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  orderStatusContainer: {
    marginTop: 24,
    padding: 16,
  },
  orderStatusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1A17', // Dark brown text for order status
  },
  orderStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
        color: '#FF8303', // Timer color (blue)

  },
  orderTimer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8303', // Timer color (blue)
    marginLeft: 8,
  },
  productList: {
    paddingVertical: 10,display:"flex",
    flexDirection:"column",
  },
  productContainer: {
    display:"flex",
    flex:1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B1A17', // Dark brown text
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#A35709', // Darker brown for prices
    marginVertical: 4,
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cartButton: {
    backgroundColor: '#FF8303', // Orange button for cart controls
    borderRadius: 50,
    padding: 6,
    marginBottom:8,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 18,
  },
  cartCount: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#1B1A17', // Dark brown for cart count
  },
  checkoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1A17', // Dark brown for total amount
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8303', // Orange background for checkout
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  paymentContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1B1A17', // Dark brown for total payment
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#F0E3CA', // Light beige for payment method buttons
  },
  selectedPaymentMethod: {
    backgroundColor: '#FF8303', // Orange highlight for selected payment method
  },
  paymentMethodText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#FF8303', // Orange for pay button
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});



export default App;
