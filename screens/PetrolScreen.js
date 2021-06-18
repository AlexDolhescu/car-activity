import React, { useState, useContext, useEffect } from 'react';
import { View, Button, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import { FlatList, ListItem, Avatar, Text, } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import ActionButton from 'react-native-action-button';
import Moment from 'moment'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { windowWidth, windowHeight } from "../utils/Dimensions";

const PetrolScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [carInformations, setCarInformations] = useState({});
  const [petrols, setPetrols] = useState([]);
  const [allPetrols, setAllPetrols] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showTimePeriod, setShowTimePeriod] = useState(false);
  const [timePeriod, setTimePeriod] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [timePeriodValues] = useState([
    { id: 1, name: "Ultima lună" },
    { id: 2, name: "Ultimul an" },
  ])


  React.useEffect(() => {
    void async function fetchData() {
      loadActivities();
    }();
  }, []);

  const loadActivities = () => {
    firestore()
      .collection('carUser')
      .where("userId", "==", user.uid)
      .where("isSelected", '==', true)
      .get()
      .then(async (querySnapshot) => {
        let chartData = querySnapshot.docs.map(doc => doc);
        // doar 1 in teorie
        for (const doc of chartData) {
          let car = await getCarById(doc.data().carId);
          let model = await getModelById(car.data().modelId);
          let brand = await getBrandById(car.data().brandId);
          let carToPush = { doc, car, model, brand };
          await getPetrols(car.id);
          setCarInformations(carToPush);
        };
      })
      .catch((error) => {
        console.log('Something went wrong with find carUser to firestore.', error);
      });
  };

  const getCarById = (carId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('car')
        .doc(carId)
        .get()
        .then((car) => {
          resolve(car);
        })
        .catch((error) => {
          console.log('Something went wrong with find car to firestore.', error);
        });
    });
  };

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

  const getPetrols = (carId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('petrol')
        .where("carId", "==", carId)
        .get()
        .then(async (querySnapshot) => {
          let petrols = [];
          let chartData = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
          for (const petrol of chartData) {
            let activityToAdd = { ...petrol.data, id: petrol.id };
            petrols.push(activityToAdd);
          };
          setPetrols(petrols);
          setAllPetrols(petrols);
          resolve(petrols);
        })
        .catch((error) => {
          console.log('Something went wrong with find petrols to firestore.', error);
        });
    });
  };

  const formatDate = (date) => {
    if (date == null) {
      return;
    }
    return Moment(date).format("DD/MM/YYYY");
  }

  const deleteFilters = () => {
    setTimePeriod(null);
    setPetrols(allPetrols);
    setShowFilter(!showFilter);
    setRefresh(!refresh);
  }

  const selectTimePeriod = (item) => {
    setTimePeriod({ ...item });
    let filteredPetrols = [...petrols];
    if (item.id == 1) {
      filteredPetrols = filteredPetrols.filter(petrol => Moment(petrol.date) >= Moment().subtract(1, 'months'));
    } else if (item.id == 2) {
      filteredPetrols = filteredPetrols.filter(petrol => Moment(petrol.date) >= Moment().subtract(1, 'years'));
    }
    setPetrols(filteredPetrols);
    setShowFilter(!showFilter);
    setShowTimePeriod(!showTimePeriod);
    setRefresh(!refresh);
  }

  const calculateCosts = () => {
    let cost = 0;
    petrols.forEach(petrol => {
      if (petrol.cost != null || petrol.cost != undefined) {
        cost += Number(petrol.cost);
      }
    });
    return cost;
  }


  return (
    <View style={styles.container} refresh={refresh}>
      <View style={{ flex: 1, width: '100%' }}>
        {carInformations.brand != undefined ? // verificare degeaba acum
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", justifyContent: "space-between", }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 10, marginLeft: 5 }}>
                <Image source={{ uri: carInformations.model.image != undefined ? carInformations.model.image : carInformations.brand.image }}
                  style={{ width: 25, height: 25, marginRight: 10, marginLeft: 5 }}></Image>
                <Text h4>{carInformations.brand.name + " " + carInformations.model.name}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginLeft: 5 }}>
                <Text style={{
                  marginTop: 5, borderColor: "black", borderRadius: 10, fontWeight: "bold",
                  borderWidth: 2, paddingLeft: 10, paddingRight: 5, paddingTop: 2
                }}>{carInformations.car.data().licencePlate}</Text>
              </View>
            </View>
            <View style={{ marginRight: 10, alignItems: "flex-end", justifyContent: "flex-start" }}>
              <View style={{ flexDirection: 'row', alignItems: "center" }}>
                <Text style={{ marginTop: 5, marginRight: 5 }}>{timePeriod != null ? timePeriod.name : null}</Text>
                <Icon size={25} name='calendar' color="black" onPress={() => setShowFilter(!showFilter)} style={{ marginTop: 5, marginRight: 5 }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: "center" }}>
                <Text style={{ marginTop: 10 }}>Total costuri: </Text>
                <Text style={{ fontWeight: "bold", marginTop: 10 }}>{calculateCosts()}</Text>
              </View>
            </View>
          </View>
          : null}
        {petrols.length > 0 && showFilter == false ?
          <ScrollView style={{ marginTop: 10 }}>
            <View style={{ alignItems: "center" }}>
              {petrols.map(petrol => (
                <TouchableOpacity key={petrol.id}  onPress={() => navigation.navigate("ManagePetrolScreen", { petrolId: petrol.id })}>
                  <View style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                    width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                  }}>
                    <View style={{}}>
                      <Text style={{ fontSize: 18, paddingLeft: 5 }}>{petrol.station}</Text>
                      <Text>{formatDate(petrol.date)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
                      <View style={{ flexDirection: "row", alignSelf: 'flex-end', marginRight: 5 }}>
                        <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>{petrol.cost}</Text>
                        <Text> lei</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          : null}
        {showFilter == true ?
          <View>
            <Text h5 style={{ marginTop: 10, marginLeft: 10 }}>Alege perioadă</Text>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {timePeriodValues.map(item => (
                <TouchableOpacity onPress={() => selectTimePeriod(item)}>
                  <View style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                    width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                      <Text style={{ fontSize: 18 }}>{item.name}</Text>
                    </View>
                    <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => deleteFilters()}>
                <View style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "black",
                  width: windowWidth * 85 / 100, padding: 5, borderRadius: 20, marginTop: 15
                }}>
                  <Text style={{ fontSize: 18, textAlign: "center", color: "white" }}>Șterge filtre</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          : null}

      </View>

      <ActionButton
        buttonColor="black"
        onPress={() => navigation.navigate("ManagePetrolScreen", { carId: carInformations.car.id })}
      />
    </View>

  );
};

export default PetrolScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
