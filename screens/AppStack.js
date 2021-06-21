
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

import { DrawerContent } from './DrawerContent';
import MainTabScreen from './MainTabScreen';
import SupportScreen from './SupportScreen';
import ManageModelScreen from './ManageModelScreen';
import ManageBrandScreen from './ManageBrandScreen';
import ManageCategoryScreen from './ManageCategoryScreen';
import EditProfileScreen from './EditProfileScreen';
import BrandsAndModelScreen from './BrandsAndModelScreen';
import CategoriesScreen from './CategoriesScreen';
import UsersScreen from './UsersScreen';
import AdminSupportScreen from './AdminSupportScreen';

const Drawer = createDrawerNavigator();
const SupportStack = createStackNavigator();
const BrandsAndModelStack = createStackNavigator();
const ManageCategoryStack = createStackNavigator();
const UsersStack = createStackNavigator();
const AdminSupportStack = createStackNavigator();

const AppStack = ({ navigation }) => (
  <Drawer.Navigator drawerPosition="right" drawerContent={props => <DrawerContent {...props} />}>
    <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
    <Drawer.Screen name="SupportScreen" component={SupportStackScreen} />
    <Drawer.Screen name="BrandsAndModelScreen" component={BrandsAndModelStackScreen} />
    <Drawer.Screen name="CategoriesScreen" component={ManageCategoryStackScreen} />
    <Drawer.Screen name="UsersScreen" component={UsersScreenStackScreen} />
    <Drawer.Screen name="EditProfileScreen" component={EditProfileScreen}/>
    <Drawer.Screen name="AdminSupportScreen" component={AdminSupportStackScreen} />
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

const BrandsAndModelStackScreen = ({ navigation }) => (
  <BrandsAndModelStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <BrandsAndModelStack.Screen name="BrandsAndModelScreen" component={BrandsAndModelScreen} options={{
      title: 'Gestionează mărci și modele'
    }} />
    <BrandsAndModelStack.Screen name="ManageBrandScreen" component={ManageBrandScreen} options={{
      title: 'Gestionează marcă'
    }} />
    <BrandsAndModelStack.Screen name="ManageModelScreen" component={ManageModelScreen} options={{
      title: 'Gestionează model'
    }} />
  </BrandsAndModelStack.Navigator>
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
        <ManageCategoryStack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{
      title: 'Gestiune categorii'
    }} />
    <ManageCategoryStack.Screen name="ManageCategoryScreen" component={ManageCategoryScreen} options={{
      title: 'Gestiune categorie'
    }} />
  </ManageCategoryStack.Navigator>
);

const UsersScreenStackScreen = ({ navigation }) => (
  <UsersStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <UsersStack.Screen name="UsersScreen" component={UsersScreen} options={{
      title: 'Utilizatori'
    }} />
  </UsersStack.Navigator>
);

const AdminSupportStackScreen = ({ navigation }) => (
  <AdminSupportStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <AdminSupportStack.Screen name="AdminSupportScreen" component={AdminSupportScreen} options={{
      title: 'Sesizări utilizatori'
    }} />
  </AdminSupportStack.Navigator>
);

export default AppStack;
