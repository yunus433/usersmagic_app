import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Complete from './components/auth/Complete';

import Loading from './components/index/Loading';
import Index from './components/index/Index';

import History from './components/history/History';

import Profile from './components/profile/Profile';

import Test from './components/campaign/Test';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        headerMode = "none"
        screenOptions={{animationEnabled: false}}
      >
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Complete" component={Complete} />
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Test" component={Test} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
