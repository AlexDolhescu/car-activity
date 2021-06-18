
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { DrawerContent } from './DrawerContent';
import MainTabScreen from './MainTabScreen';
import SupportScreen from './SupportScreen';
import ManageModelScreen from './ManageModelScreen';
import ManageBrandScreen from './ManageBrandScreen';
import ManageCategoryScreen from './ManageCategoryScreen';

const Drawer = createDrawerNavigator();
const SupportStack = createStackNavigator();
const ManageModelStack = createStackNavigator();
const ManageBrandStack = createStackNavigator();
const ManageCategoryStack = createStackNavigator();

const AppStack = ({ navigation }) => (
    <Drawer.Navigator drawerPosition="right" drawerContent={props => <DrawerContent {...props} />}>
      <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
      <Drawer.Screen name="SupportScreen" component={SupportStackScreen} />
      <Drawer.Screen name="ManageModelScreen" component={ManageModelStackScreen} />
      <Drawer.Screen name="ManageBrandScreen" component={ManageBrandStackScreen} />
      <Drawer.Screen name="ManageCategoryScreen" component={ManageCategoryStackScreen} />
    </Drawer.Navigator>

);

const SupportStackScreen = ({ navigation }) => (
  <SupportStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <SupportStack.Screen name="SupportScreen" component={SupportScreen} options={{
      title: 'SupportScreen'
    }} />
  </SupportStack.Navigator>
);

const ManageModelStackScreen = ({ navigation }) => (
  <ManageModelStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <ManageModelStack.Screen name="ManageModelScreen" component={ManageModelScreen} options={{
      title: 'ManageModelScreen'
    }} />
  </ManageModelStack.Navigator>
);

const ManageBrandStackScreen = ({ navigation }) => (
  <ManageBrandStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <ManageBrandStack.Screen name="ManageBrandScreen" component={ManageBrandScreen} options={{
      title: 'ManageBrandScreen'
    }} />
  </ManageBrandStack.Navigator>
);

const ManageCategoryStackScreen = ({ navigation }) => (
  <ManageCategoryStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <ManageCategoryStack.Screen name="ManageCategoryScreen" component={ManageCategoryScreen} options={{
      title: 'ManageCategoryScreen'
    }} />
  </ManageCategoryStack.Navigator>
);

export default AppStack;
