import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';


import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';

const Tab = createMaterialBottomTabNavigator();

const HomeStack = createStackNavigator();
const DetailsStack = createStackNavigator();

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
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="home" color={color} size={26} />
         ),
       }}
     />
     <Tab.Screen
       name="DetailsScreen"
       component={DetailsStackScreen}
       options={{
         tabBarLabel: 'Updates',
         tabBarColor: '#d02860',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="bell" color={color} size={26} />
         ),
       }}
     />
     <Tab.Screen
       name="Profile"
       component={DetailsStackScreen}
       options={{
         tabBarLabel: 'Profile',
         tabBarColor: '#009387',
         tabBarIcon: ({ color }) => (
           <MaterialCommunityIcons name="account" color={color} size={26} />
         ),
       }}
     />
   </Tab.Navigator>
);

export default MainTabScreen;

const HomeStackScreen = ({navigation}) => (
  <HomeStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
      <HomeStack.Screen name="Home"component={HomeScreen} options = {{
        title: 'Acasa',
        headerLeft: () => (
          <Icon.Button name="menu" size={25} backgroundColor="#009387" onPress={() =>
            navigation.openDrawer()}
        ></Icon.Button>
      )
      }} />
    </HomeStack.Navigator>
);

const DetailsStackScreen = ({navigation}) => (
  <DetailsStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
      <DetailsStack.Screen name="DetailsScreen"component={DetailsScreen} options = {{
        title: 'DetailsScreen',
        headerLeft: () => (
          <Icon.Button name="menu" size={25} backgroundColor="#009387" onPress={() =>
            navigation.openDrawer()}
        ></Icon.Button>
      )
      }} />
    </DetailsStack.Navigator>
);
