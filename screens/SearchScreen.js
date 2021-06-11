import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView } from 'react-native';
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
        querySnapshot.forEach((doc) => {
          setCarInfo(doc.data());
          setCarExists(true);
        });
      })
      .catch((error) => {
        console.log('Something went wrong with find car to firestore.', error);
      });
  }

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
          <View style={{ marginTop: 10 }}>
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
                <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 10 }}>
                  <View style={{ width: '48%', marginLeft: '4%' }}>
                    <Text>Marcă: {carInfo.brandId}</Text>
                    <Text>Model: {carInfo.modelId}</Text>
                    <Text>An: {carInfo.fabricationYear}</Text>
                  </View>
                  <View style={{ width: '44%' }}>
                    <Text>Km: {carInfo.km}</Text>
                    <Text>Culoare: {carInfo.color}</Text>
                    <Text>CP: {carInfo.hoursePower}</Text>
                    <Text>Motor: {carInfo.cilindricalCapacity} cm3</Text>
                  </View>
                </View>
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
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: 'center', marginTop: 10 }}>
              <Button style={{ width: 130, marginBottom: 20, marginRight: 20 }} mode="contained" color="black"
                // onPress={navigation.navigate("GalleryScreen")}
                disabled={!carInfo.showGallery}
              >Galierie</Button>
              <Button style={{ width: 130, marginBottom: 20 }} mode="contained" color="black"
                // onPress={navigation.navigate("ActivityScreen")}
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
