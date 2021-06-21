import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Paragraph, Drawer, Text, TouchableRipple, Switch, Divider, } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

import { AuthContext } from '../navigation/AuthProvider';

export function DrawerContent(props) {

  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const { user, logout } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState({});

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  }

  React.useEffect(() => {
    void async function fetchData() {
      loadUser();
    }();
  }, []);

  const loadUser = async () => {
    firestore()
      .collection('user')
      .doc(user.uid)
      .get()
      .then((user) => {
        setUserProfile(user.data());
      })
      .catch((error) => {
        console.log('Something went wrong with find user to firestore.', error);
      });
  }

  const avatarLabel = (user) => {
    if (user.email == undefined) {
      return;
    }
    return user.firstName != undefined ?
      user.lastName != undefined ?
        user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
        : user.firstName.charAt(0).toUpperCase()
      : user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase()
  }

  const getUserName = () => {
    let name = null;
    if (userProfile.firstName != null) {
      name = userProfile.firstName;
    }
    if (userProfile.lastName != null) {
      name = name + " " + userProfile.lastName;
    }
    return name;
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Avatar.Text
                label={avatarLabel(userProfile)}
                color="white"
                size={50}
                style={{ backgroundColor: "black" }}
              />
              <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                <Title style={styles.title}>{getUserName()}</Title>
                <Caption style={[styles.caption, { width: 200 }]}>{userProfile.email}</Caption>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.section}>
                <TouchableOpacity onPress={() => { props.navigation.navigate('EditProfileScreen') }}>
                  <Caption style={styles.caption}>Editează profilul</Caption>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Divider />
        </View>
        <Divider style={{ marginTop: 10, }} />

        <Drawer.Section style={[styles.drawerSection, {}]}>
          <DrawerItem
            icon={({ color, size }) => (
              <Icon name="help-network" color={color} size={size} />
            )}
            label="Suport"
            onPress={() => { props.navigation.navigate('SupportScreen') }}
          />
        </Drawer.Section>
        {userProfile.isAdmin ?
          <View>
            <Drawer.Section style={styles.drawerSection} title="Nomenclatoare">
              <DrawerItem
                icon={({ color, size }) => (
                  <Icon name="car-cog" color={color} size={size} />
                )}
                label="Mărci si modele"
                onPress={() => { props.navigation.navigate('BrandsAndModelScreen') }}
              />
              <DrawerItem
                icon={({ color, size }) => (
                  <Icon name="gamepad-left" color={color} size={size} />
                )}
                label="Categorii"
                onPress={() => { props.navigation.navigate('CategoriesScreen') }}
              />
            </Drawer.Section>
            <Drawer.Section style={styles.drawerSection} title="Utilizatori">
              <DrawerItem
                icon={({ color, size }) => (
                  <Icon name="account-supervisor" color={color} size={size} />
                )}
                label="Utilizatori"
                onPress={() => { props.navigation.navigate('UsersScreen') }}
              />
            </Drawer.Section>
            <Drawer.Section style={styles.drawerSection} title="Sesizări utilizatori">
              <DrawerItem
                icon={({ color, size }) => (
                  <Icon name="chat-alert-outline" color={color} size={size} />
                )}
                label="Sesizări utilizatori"
                onPress={() => { props.navigation.navigate('AdminSupportScreen') }}
              />
            </Drawer.Section>
          </View>
          : null}
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
