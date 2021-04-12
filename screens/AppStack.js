
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

const Drawer = createDrawerNavigator();

const AppStack = ({navigation}) => (

<Drawer.Navigator drawerPosition="right" drawerContent={props => <DrawerContent { ... props} />}>
       <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
       <Drawer.Screen name="Support" component={SupportScreen} />
     </Drawer.Navigator>

   );

export default AppStack;
