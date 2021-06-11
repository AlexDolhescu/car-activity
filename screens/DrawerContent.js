import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import {
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
  Divider,
} from 'react-native-paper';
import { Icon } from 'react-native-elements'

import { AuthContext } from '../navigation/AuthProvider';

export function DrawerContent(props) {

  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const { logout } = useContext(AuthContext);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Avatar.Text
                label="AD"
                color="white"
                size={50}
                style={{ backgroundColor: "black" }}
              />
              <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                <Title style={styles.title}>Alex Dolhescu</Title>
                <Caption style={styles.caption}>alex.dolhescu@rpss.ro</Caption>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.section}>
                <Caption style={styles.caption}>Editează profilul</Caption>
              </View>
            </View>
          </View>
          <Divider />
        </View>
        <Divider style={{ marginTop: 10, marginBottom: -10 }} />
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="add-circle-outline" color={color} type='Ionicons' size={size} />
            )}
            label="Support"
            onPress={() => { props.navigation.navigate('SupportScreen') }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="add-circle-outline" color={color} type='Ionicons' size={size} />
            )}
            label="ManageBrand"
            onPress={() => { props.navigation.navigate('ManageBrandScreen') }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="add-circle-outline" color={color} type='Ionicons' size={size} />
            )}
            label="ManageModel"
            onPress={() => { props.navigation.navigate('ManageModelScreen') }}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="add-circle-outline" color={color} type='Ionicons' size={size} />
            )}
            label="ManageCategory"
            onPress={() => { props.navigation.navigate('ManageCategoryScreen') }}
          />
        </Drawer.Section>
        <Drawer.Section title="Preferences">
          <TouchableRipple onPress={() => { toggleTheme() }}>
            <View style={styles.preference}>
              <Text>Dark Theme</Text>
              <View pointerEvents="none">
                <Switch value={isDarkTheme} />
              </View>
            </View>
          </TouchableRipple>
        </Drawer.Section>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => logout()}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
