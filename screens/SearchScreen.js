import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Title, Button } from 'react-native-paper';
import { Icon, Text, Card } from 'react-native-elements'
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { set } from 'react-native-reanimated';

const SearchScreen = ({ navigation }) => {

  const [vin, setVin] = useState(null);
  const [carInfo, setCarInfo] = useState({});
  const [carExists, setCarExists] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [carSearchButtonPressed, setCarSearchButtonPressed] = useState(false);
  const [carInformations, setCarInformations] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = () => {
        setVin(null);
        setCarInfo({});
        setCarExists(false);
        setRefresh(!refresh);
        setCarSearchButtonPressed(false);
      }
      return () => unsubscribe();
    }, [])
  );

  const searchCar = () => {
    setCarSearchButtonPressed(true);
    firestore()
      .collection('car')
      .where("vin", "==", vin)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          // doar unu
          setCarInfo(doc.data());
          let model = await getModelById(doc.data().modelId);
          let brand = await getBrandById(doc.data().brandId);
          let carToPush = { doc, model, brand };
          setCarInformations(carToPush);
          setCarExists(true);
        });
      })
      .catch((error) => {
        console.log('Something went wrong with find car to firestore.', error);
      });
  }

  const getModelById = (modelId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('model')
        .doc(modelId)
        .get()
        .then((model) => {
          resolve(model.data());
        })
        .catch((error) => {
          console.log('Something went wrong with find model to firestore.', error);
        });
    });
  };

  const getBrandById = (brandId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('brand')
        .doc(brandId)
        .get()
        .then((brand) => {
          resolve(brand.data());
        })
        .catch((error) => {
          console.log('Something went wrong with find brand to firestore.', error);
        });
    });
  };

  return (
    <ScrollView>
      <View style={styles.container} refresh={refresh}>
        <Text h3 style={{ marginTop: 20 }}>Caută o mașină</Text>
        <Icon
          name='car-alt'
          type='font-awesome-5'
          color='black'
          size={150} />
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center" }}>
          <TextInput
            label="Serie caroserie (VIN)"
            value={vin}
            mode="outlined"
            maxLength={17}
            onChangeText={vin => setVin(vin)}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '81%', marginTop: 10, marginRight: '2%' }}
          />
          <View style={{ marginTop: 15 }}>
            <Icon
              name='search'
              type='font-awesome-5'
              color='black'
              size={20}
              style={{ marginTop: 20 }}
              onPress={searchCar} />
          </View>
        </View>
        {carExists == true ?
          <View>
            {carInfo.showGeneralData ?
              <Card >
                <Card.Title>DATE MAȘINĂ</Card.Title>
                {/* TODO - icon + model + brand + licence palte */}
                <View style={{ alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 10, marginLeft: 5 }}>
                    <Image source={{ uri: carInformations.model.image != undefined ? carInformations.model.image : carInformations.brand.image }}
                      style={{ width: 25, height: 25, marginRight: 10, marginLeft: 5 }}></Image>
                    <Text h4>{carInformations.brand.name + " " + carInformations.model.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginLeft: 5 }}>
                    <Text style={{
                      marginTop: 5, borderColor: "black", borderRadius: 10, fontWeight: "bold",
                      borderWidth: 2, paddingLeft: 10, paddingRight: 5, paddingTop: 2
                    }}>{carInformations.doc.data().licencePlate}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "flex-start", alignContent: "flex-start", marginTop: 10 }}>
                  <View style={{ width: '48%', marginLeft: '4%' }}>
                    <Text>An: {carInfo.fabricationYear != undefined ? carInfo.fabricationYear : "-"}</Text>
                    <Text>Kw: {carInfo.kw != undefined ? carInfo.kw : "-"}</Text>
                  </View>
                  <View style={{ width: '44%' }}>
                    <Text>Km: {carInfo.km != undefined ? carInfo.km : "-"}</Text>
                    <Text>CP: {carInfo.hoursePower != undefined ? carInfo.hoursePower : "-"}</Text>
                  </View>
                </View>
                <Text style={{ marginLeft: '4%' }}>Capacitate cilindrica: {carInfo.cilindricalCapacity ? carInfo.cilindricalCapacity + ' cm3' : "-"}</Text>
              </Card>
              :
              <View>
                <Icon
                  name='x'
                  type='feather'
                  color='gray'
                  size={100} />
                <Text style={{ fontWeight: 'bold' }}>Proprietarul nu are datele mașinii publice</Text>
              </View>
            }
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: 'center', marginTop: 20 }}>
              <Button style={{ width: 130, marginBottom: 20, marginRight: 20, borderRadius: 20 }} mode="contained" color="black"
                onPress={() => navigation.navigate("CarGalleryScreen", { carId: carInformations.doc.id, onlyView: true })}
                disabled={!carInfo.showGallery}
              >Galierie</Button>
              <Button style={{ width: 130, marginBottom: 20, borderRadius: 20 }} mode="contained" color="black"
                onPress={() => navigation.navigate("ViewActivityScreen", { carId: carInformations.doc.id, onlyView: true })}
                disabled={!carInfo.showActivities}
              >Activități</Button>
            </View>
          </View>
          : null}
        {(carExists == false && carSearchButtonPressed == true) ?
          <View style={{ marginTop: 20 }}>
            <Icon
              name='slash'
              type='feather'
              color='gray'
              size={100} />
            <Text h5 style={{ color: 'gray', textAlign: "center" }}>- nu s-a găsit mașina cu seria introdusă -</Text>
          </View>
          : null}
      </View>
    </ScrollView >
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
