import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, ShoppingCart } from 'lucide-react-native';

// Login Page
const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Implement login logic here
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

// Home Page
const HomePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Canteen</Text>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => navigation.navigate('InstantProducts')}
      >
        <Camera color="white" size={32} />
        <Text style={styles.optionText}>Instant Food</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => navigation.navigate('DelayedProducts')}
      >
        <Camera color="white" size={32} />
        <Text style={styles.optionText}>Delayed Food</Text>
      </TouchableOpacity>
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
    setCart(cart.filter((item) => item.id !== product.id));
  };

  const handleCheckout = () => {
    navigation.navigate('Payment', { cart });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
            <View style={styles.cartControls}>
              <Button
                title="-"
                onPress={() => handleRemoveFromCart(item)}
                disabled={!cart.find((i) => i.id === item.id)}
              />
              <Text style={styles.cartCount}>
                {cart.filter((i) => i.id === item.id).length}
              </Text>
              <Button title="+" onPress={() => handleAddToCart(item)} />
            </View>
          </View>
        )}
      />
      <Button title="Checkout" onPress={handleCheckout} />
    </View>
  );
};

// Payment Page
const PaymentPage = ({ navigation, route }) => {
  const { cart } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('gpay');

  const handlePayment = () => {
    // Implement payment logic here
    Alert.alert('Payment Successful', 'Your order is getting ready.');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Text style={styles.productTitle}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
            <Text style={styles.productCount}>x{cart.filter((i) => i.id === item.id).length}</Text>
          </View>
        )}
      />
      <Text style={styles.total}>Total: ${cart.reduce((acc, item) => acc + item.price, 0)}</Text>
      <TouchableOpacity
        style={[styles.paymentMethod, paymentMethod === 'gpay' ? styles.selectedPaymentMethod : null]}
        onPress={() => setPaymentMethod('gpay')}
      >
        <Camera color="white" size={32} />
        <Text style={styles.paymentMethodText}>Google Pay</Text>
      </TouchableOpacity>
      <Button title="Pay Now" onPress={handlePayment} />
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="InstantProducts" component={ProductsPage} initialParams={{ products: [
          { id: 1, name: 'Sandwich', price: 5 },
          { id: 2, name: 'Salad', price: 8 },
          { id: 3, name: 'Soup', price: 4 },
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007aff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cartCount: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
  selectedPaymentMethod: {
    backgroundColor: '#007aff',
  },
  paymentMethodText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
  },
});

export default App;