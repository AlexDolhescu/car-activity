import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Alert, StyleSheet, ScrollView, Image, TextInput as TextInputRN, Switch } from 'react-native';
import { Button } from 'react-native-paper';
import { Text } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButton from 'react-native-action-button';
import storage from '@react-native-firebase/storage';

const CategoriesScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [isLoading, setIsLoaging] = useState(true);
  const [isNewPhoho, setIsNewPhoto] = useState(false);

  React.useEffect(() => {
    void async function fetchData() {
      loadBrands();
    }();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBrands();
      return () => loadBrands();
    }, [])
  );

  const loadBrands = () => {
    firestore()
      .collection('category')
      .get()
      .then(async (querySnapshot) => {
        let categories = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
        setCategories(categories);
        setListItems(categories);
      })
      .catch((error) => {
        console.log('Something went wrong with find categories to firestore.', error);
      });
  };


  const deleteCategoryById = (category) => {
    let existingListItems = [...listItems];
    existingListItems = existingListItems.filter(item => item.id != category.id)
    setListItems(existingListItems);
    firestore()
      .collection('category')
      .doc(category.id)
      .delete()
      .then(async () => {
        if (category.data.image != undefined) {
          let photoRef = await storage().refFromURL(category.data.image);
          photoRef.delete().catch(function (error) {
            console.log(error);
          });
        }
        resolve();
      })
      .catch((error) => {
        console.log('Something went wrong to delete category to firestore.', error);
      });

  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Confirm',
      'Sunteți sigur că vreți să ștergeți această entitate?',
      [
        {
          text: "Anulează",
          onPress: () => { },
          style: "cancel"
        },
        { text: "Șterge", onPress: () => deleteCategoryById(item) }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ScrollView>
            {listItems.map(item => (
              <TouchableOpacity key={item.id}
                onLongPress={() => confirmDelete(item)}
                onPress={() => navigation.navigate("ManageCategoryScreen", { categoryId: item.id })}>
                <View style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                  width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", }}>
                    <Image source={{ uri: item.data.image }} style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5 }}></Image>
                    <Text h4>{item.data.name}</Text>
                  </View>
                  <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <ActionButton
        buttonColor="black"
        onPress={() => navigation.navigate("ManageCategoryScreen", {})}
      />
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});
