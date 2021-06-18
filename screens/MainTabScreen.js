import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import ActivityScreen from './ActivityScreen';
import ManageActivityScreen from './ManageActivityScreen';
import ManageCarScreen from './ManageCarScreen';
import CarActionsScreen from './CarActionsScreen';
import CarGalleryScreen from './CarGalleryScreen';
import CarUsersScreen from './CarUsersScreen';
import ServiceIntervalScreen from './ServiceIntervalScreen';
import CarAlertsScreen from './CarAlertsScreen';
import MileageUpdateScreen from './MileageUpdateScreen';
import PetrolScreen from './PetrolScreen';

const Tab = createMaterialTopTabNavigator();

const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ActivityStack = createStackNavigator();
const PetrolStack = createStackNavigator();

const MainTabScreen = () => (
  <Tab.Navigator
    initialRouteName="Home"
    activeColor="#fff"
    tabBarPosition="bottom"
  >
    <Tab.Screen
      name="Home"
      component={HomeStackScreen}
      style={{ backgroundColor: 'tomato' }}
      options={{
        tabBarLabel: ({ focused, tintColor: color }) => (
          focused ?
            <View style={{ justifyContent: "center", alignItems: "center", width: 50, marginBottom: 5 }}>
              <Icon name="home" size={25} color={color} />
              <Text>Acasă</Text>
            </View>
            :
            <View style={{ justifyContent: "center", alignItems: "center", width: 50 }}>
              <Icon name="home" size={30} color={color} />
            </View>
        )
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchStackScreen}
      title='Search'
      options={{
        tabBarLabel: ({ focused, tintColor: color }) => (
          focused ?
            <View style={{ justifyContent: "center", alignItems: "center", width: 50, marginBottom: 5 }}>
              <Icon name="search-web" size={25} color={color} />
              <Text>Caută</Text>
            </View>
            :
            <View style={{ justifyContent: "center", alignItems: "center", width: 50 }}>
              <Icon name="search-web" size={30} color={color} />
            </View>
        )
      }}
    />
    <Tab.Screen
      name="CarActivity"
      component={ActivityStackScreen}
      options={{
        tabBarLabel: ({ focused, tintColor: color }) => (
          focused ?
            <View style={{ justifyContent: "center", alignItems: "center", width: 60, marginBottom: 5 }}>
              <Icon name="layers-outline" size={25} color={color} />
              <Text>Activități</Text>
            </View>
            :
            <View style={{ justifyContent: "center", alignItems: "center", width: 60}}>
              <Icon name="layers-outline" size={30} color={color} />
            </View>
        )
      }}
    />
    <Tab.Screen
      name="Settings"
      component={PetrolStackScreen}
      options={{
        tabBarLabel: ({ focused, tintColor: color }) => (
          focused ?
            <View style={{ justifyContent: "center", alignItems: "center", width: 70, marginBottom: 5 }}>
              <Icon name="gas-station" size={25} color={color} />
              <Text>Alimentare</Text>
            </View>
            :
            <View style={{ justifyContent: "center", alignItems: "center", width: 70 }}>
              <Icon name="gas-station" size={30} color={color} />
            </View>
        )
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
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{
      title: 'Acasă',
      headerRightContainerStyle: { marginRight: 10 },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
        >
          <Icon size={25} name='menu' color="white" onPress={() => navigation.openDrawer()} style={{ marginRight: 5 }} />
        </TouchableOpacity>
      )
    }} />
    <HomeStack.Screen name="ManageCarScreen" component={ManageCarScreen} options={{
      title: 'Gestionează masină'
    }} />
    <HomeStack.Screen name="CarActionsScreen" component={CarActionsScreen} options={{
      title: 'Acțiuni masină'
    }} />
    <HomeStack.Screen name="CarGalleryScreen" component={CarGalleryScreen} options={{
      title: 'Galerie masină'
    }} />
    <HomeStack.Screen name="CarUsersScreen" component={CarUsersScreen} options={{
      title: 'Utilizatori masină'
    }} />
    <HomeStack.Screen name="ServiceIntervalScreen" component={ServiceIntervalScreen} options={{
      title: 'Interval service'
    }} />
    <HomeStack.Screen name="CarAlertsScreen" component={CarAlertsScreen} options={{
      title: 'Alerte mașină'
    }} />
    <HomeStack.Screen name="MileageUpdateScreen" component={MileageUpdateScreen} options={{
      title: 'Actualizează kilometraj'
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
      title: 'Caută',
      headerRightContainerStyle: { marginRight: 10 },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
        >
          <Icon size={25} name='menu' color="white" onPress={() => navigation.toggleDrawer()} style={{ marginRight: 5 }} />
        </TouchableOpacity>
      )
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
      title: 'Activități',
      headerRightContainerStyle: { marginRight: 10 },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
        >
          <Icon size={25} name='menu' color="white" onPress={() => navigation.openDrawer()} style={{ marginRight: 5 }} />
        </TouchableOpacity>
      )
    }} />
    <ActivityStack.Screen name="ManageActivityScreen" component={ManageActivityScreen} options={{
      title: 'Gestionează activitate'
    }} />
  </ActivityStack.Navigator>
);


const PetrolStackScreen = ({ navigation }) => (
  <PetrolStack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#000000'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  }}>
    <PetrolStack.Screen name="PetrolScreen" component={PetrolScreen} options={{
      title: 'Alimentări',
      headerRightContainerStyle: { marginRight: 10 },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
        >
          <Icon size={25} name='menu' color="white" onPress={() => navigation.openDrawer()} style={{ marginRight: 5 }} />
        </TouchableOpacity>
      )
    }} />
  </PetrolStack.Navigator>
);
