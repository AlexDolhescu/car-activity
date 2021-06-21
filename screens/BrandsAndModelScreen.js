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

const BrandsAndModelScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [brandId, setBrandId] = useState(null);
  const [isLoading, setIsLoaging] = useState(true);

  React.useEffect(() => {
    void async function fetchData() {
      loadBrands();
    }();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setBrandId(null);
      loadBrands();
      return () => loadBrands();
    }, [])
  );

  const loadBrands = () => {
    firestore()
      .collection('brand')
      .get()
      .then(async (querySnapshot) => {
        let brands = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
        setBrands(brands);
        setListItems(brands);
      })
      .catch((error) => {
        console.log('Something went wrong with find brands to firestore.', error);
      });
  };

  const getModelsByCarId = (brandId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('model')
        .where("brandId", "==", brandId)
        .get()
        .then(async (querySnapshot) => {
          let models = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
          setModels(models);
          resolve(models);
        })
        .catch((error) => {
          console.log('Something went wrong with find models to firestore.', error);
        });
    });
  };

  const selectItem = async (item) => {
    if (brandId == undefined) {
      setBrandId(item.id);
      let brands = await getModelsByCarId(item.id);
      setListItems(brands);
      return;
    }
    console.log(brandId);
    navigation.navigate("ManageModelScreen", { brandId: brandId, modelId: item.id });
  }
  const navigate = () => {
    if (brandId == null) {
      navigation.navigate("ManageBrandScreen", {});
      return;
    }
    navigation.navigate("ManageModelScreen", { brandId: brandId });
  }

  const getListName = () => {
    if (brandId == undefined) {
      return "Gestioneză mărci";
    }
    return "Gestionează modele"
  }

  const getListInfo = () => {
    if (brandId == undefined) {
      return "apasă lung pentru a ștege sau edita";
    }
    return "apasă lung pentru a ștege"
  }

  const backToBrands = () => {
    setListItems(brands);
    setBrandId(null)
  }


  const deleteModelById = (modelId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('model')
        .doc(modelId)
        .delete()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong to delete model to firestore.', error);
        });
    });
  };

  const deleteBrandById = (brandId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('brand')
        .doc(brandId)
        .delete()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong to delete brand to firestore.', error);
        });
    });
  };

  const deleteModel = async (model) => {
    let existingListItems = [...listItems];
    existingListItems = existingListItems.filter(item => item.id != model.id)
    await deleteModelById(model.id);
    if (model.data.image != undefined) {
      let photoRef = await storage().refFromURL(model.data.image);
      photoRef.delete().catch(function (error) {
        console.log(error);
      });
    }
    setListItems(existingListItems);
  };

  const deleteBrand = async (brand) => {
    let existingListItems = [...listItems];
    existingListItems = existingListItems.filter(item => item.id != brand.id)
    await deleteBrandById(brand.id);
    if (brand.data.image != undefined) {
      let photoRef = await storage().refFromURL(brand.data.image);
      photoRef.delete().catch(function (error) {
        console.log(error);
      });
    }
    setListItems(existingListItems);
  };

  const deleteSelectedItem = async (item) => {
    if (brandId == undefined) {
      deleteBrand(item);
      return;
    }
    deleteModel(item);
  }

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
        { text: "Șterge", onPress: () => deleteSelectedItem(item) }
      ]
    );
  }

  const longPress = async (item) => {
    if (brandId == undefined) {
      Alert.alert(
        "Operațiuni",
        "Alege operațiunea pentru această entitate",
        [
          { text: "Șterge", onPress: () => confirmDelete(item) },
          {
            text: "Anulează",
            onPress: () => { },
            style: "cancel"
          },
          {
            text: "Editează",
            onPress: () => navigation.navigate("ManageBrandScreen", { brandId: item.id })
          },
        ]
      );

      return;
    }
    confirmDelete(item);
  }


  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text h4 style={{ marginTop: 10, marginLeft: 10 }}>{getListName()}</Text>
        <Text style={{ marginLeft: 10, opacity: 0.5 }}>{getListInfo()}</Text>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ScrollView>
            {brandId != undefined ?
              <TouchableOpacity key={brandId} onPress={() => backToBrands()}>
                <View style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "flex-start", backgroundColor: "white",
                  width: windowWidth * 85 / 100, padding: 5, borderRadius: 20, marginTop: 10, borderWidth: 2
                }}>
                  <Icon size={25} name='chevron-left' color="black" style={{ marginRight: 5 }} />
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                    <Text h5>Înapoi la mărci</Text>
                  </View>

                </View>
              </TouchableOpacity>
              : null}
            {listItems.map(item => (
              <TouchableOpacity key={item.id}
                onLongPress={() => longPress(item)}
                onPress={() => selectItem(item)}>
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
        onPress={() => navigate()}
      />
    </View>
  );
};

export default BrandsAndModelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});
