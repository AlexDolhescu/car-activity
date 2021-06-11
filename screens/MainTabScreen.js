import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';


import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import ActivityScreen from './ActivityScreen';
import ManageActivityScreen from './ManageActivityScreen';
import ManageCarScreen from './ManageCarScreen';

const Tab = createMaterialBottomTabNavigator();

const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ActivityStack = createStackNavigator();

const MainTabScreen = () => (
  <Tab.Navigator
    initialRouteName="Home"
    activeColor="#fff"
  >
    <Tab.Screen
      name="Home"
      component={HomeStackScreen}
      style={{ backgroundColor: 'tomato' }}
      options={{
        tabBarLabel: 'Home',
        tabBarColor: '#000000',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchStackScreen}
      title='Search'
      options={{
        tabBarLabel: 'Search',
        tabBarColor: '#000000',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="search-web" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="CarActivity"
      component={ActivityStackScreen}
      options={{
        tabBarLabel: 'Car activity',
        tabBarColor: '#000000',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="car" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={HomeStackScreen}
      listeners={({ navigation }) => ({
        tabPress: e => {
          e.preventDefault();
          navigation.openDrawer();
        }
      })}
      options={{
        tabBarLabel: 'Settings',
        tabBarColor: '#000000',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="account-arrow-left" color={color} size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default MainTabScreen;

const HomeStackScreen = ({ navigation }) => (
  <HomeStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{
      title: 'Acasa'
    }} />
    <HomeStack.Screen name="ManageCarScreen" component={ManageCarScreen} options={{
      title: 'Gestionează masină'
    }} />
  </HomeStack.Navigator>
);

const SearchStackScreen = ({ navigation }) => (
  <SearchStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <SearchStack.Screen name="SearchScreen" component={SearchScreen} options={{
      title: 'SearchScreen'
    }} />
  </SearchStack.Navigator>
);

const ActivityStackScreen = ({ navigation }) => (
  <ActivityStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <ActivityStack.Screen name="ActivityScreen" component={ActivityScreen} options={{
      title: 'CarScreen'
    }} />
    <ActivityStack.Screen name="ManageActivityScreen" component={ManageActivityScreen} options={{
      title: 'Gestionează activitate'
    }} />
  </ActivityStack.Navigator>
);
