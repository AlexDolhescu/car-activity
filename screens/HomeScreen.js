import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Alert, StyleSheet, ScrollView, SafeAreaView, TouchableHighlight } from 'react-native';
import { TextInput, Title, Button } from 'react-native-paper';
import { Icon, Text, Card, Image } from 'react-native-elements'
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import Carousel from 'react-native-snap-carousel';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import Moment from 'moment'

const HomeScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carInfo, setCarInfo] = useState({});
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [carsToUser, setCarsToUser] = useState([]);
  const [refreshCarousel, setRefreshCarousel] = useState(false);
  const [petrolInfo, setPetrolInfo] = useState({});

  React.useEffect(() => {
    void async function fetchData() {
      loadCars();
    }();
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     setCarsToUser([]);
  //     return () => loadCars();
  //   }, [])
  // );


  const changeCar = async (index) => {
    setActiveIndex(index);
    setCarInformations(carsToUser[index].car);
    await firestore().collection('carUser').doc(carsToUser[index].doc.id).update({ isSelected: true });
    carsToUser.forEach(async (carUser) => {
      if(carUser.doc.id != carsToUser[index].doc.id) {
        await firestore().collection('carUser').doc(carUser.doc.id).update({ isSelected: false });
      }
    })
    //save carUser cu is selected si celelate cu false :)
  }

  const loadCars = () => {
    firestore()
      .collection('carUser')
      .where("userId", "==", user.uid)
      .get()
      .then(async (querySnapshot) => {
        let chartData = querySnapshot.docs.map(doc => doc)
        for (const doc of chartData) {
          let selectedIndex = 0;
          let carToPush = {};
          let car = await getCarById(doc.data().carId);
          let model = await getModelById(car.data().modelId);
          let brand = await getBrandById(car.data().brandId);
          carToPush = { doc, car, model, brand };
          if (doc.data().isSelected == true) {
            setActiveIndex(selectedIndex);
            setCarInformations(car);
          }
          let _carsToUser = carsToUser;
          _carsToUser.push(carToPush);
          setCarsToUser(_carsToUser);
          selectedIndex++;
        };
        setRefreshCarousel(!refreshCarousel)
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

  const setCarInformations = (car) => {
    setSelectedCarId(car.id);
    getPetrolData(car.id);
    setCarInfo(car.data());
  }

  const getPetrolData = (carId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('petrol')
        .where("carId", "==", carId)
        .get()
        .then(async (querySnapshot) => {
          let chartData = querySnapshot.docs.map(doc => doc.data())
          let filteredPetrols = chartData.filter(petrol => Moment(petrol.date) >= Moment(new Date()).subtract(1, 'months'));
          let cost = 0;
          for (const petrol of filteredPetrols) {
            cost += Number(petrol.cost);
          };
          setPetrolInfo({numberOfRefils: chartData.length, cost: cost})
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong with find petrols to firestore.', error);
        });
    });
  };

  /**
   * Moment() -> now
   * Returneaza statusul in functie de data: nesetat - negru, verde daca este in viitor (nu este expirat), rosu altfel
   * @param {*} date 
   * @returns 
   */
  const getStatusColor = (date) => {
    if (date == null) {
      return "black";
    }
    if (Moment(new Date(date)).isAfter(Moment(new Date())) == true) {
      return "green";
    }
    return "red";
  }

  const formatDate = (date) => {
    if (date == null) {
      return;
    }
    return Moment(new Date(date)).format("DD/MM/YYYY");
  }

  const deleteCarUserById = (carUserId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('carUser')
        .doc(carUserId)
        .delete()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong to delete user to firestore.', error);
        });
    });
  };

  const deleteCarById = (carId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('car')
        .doc(carId)
        .delete()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong to delete car to firestore.', error);
        });
    });
  };

  const getCarUserIdsByCarId = (carId) => {
    return new Promise((resolve, reject) => {
    firestore()
      .collection('carUser')
      .where("carId", "==", carId)
      .get()
      .then(async (querySnapshot) => {
        let chartData = querySnapshot.docs.map(doc => doc.id)
        resolve(chartData);
      })
      .catch((error) => {
        console.log('Something went wrong with find carUser to firestore.', error);
      });
    });
  }

  const deleteCar = async () => {
    let existingUsers = [...carsToUser];
    existingUsers = existingUsers.filter(carToUser => carToUser.car.id != carsToUser[activeIndex].car.id)
    await deleteCarById(carsToUser[activeIndex].car.id);
    let carUserIdsToDelete = await getCarUserIdsByCarId(carsToUser[activeIndex].car.id);
    for (let carUserId of carUserIdsToDelete) {
      await deleteCarUserById(carUserId);
    }
    setActiveIndex(0);
    setCarsToUser(existingUsers);
    setRefreshCarousel(!refreshCarousel);
  };

  const confirmDeleteCar = () => {
    Alert.alert(
      'Confirm',
      'Sunteți sigur că vreți să ștergeți mașina selectată?',
      [
        {
          text: "Anulează",
          onPress: () => { },
          style: "cancel"
        },
        { text: "Șterge", onPress: () => deleteCar() }
      ]
    );
  }

  const isAdminToCar = () => {
    if (carsToUser.length > 0) {
      if (carsToUser[activeIndex].doc.data().isAdmin == true) {
        return true;
      }
    }
    return false;
  }

  const getNumberOfDays = (date) => {
    return Moment(new Date(date)).diff(Moment(new Date()), 'days').toString();
  }

  const _renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideInnerContainer}>
          <Text style={{
            fontWeight: 'bold', fontSize: 18, backgroundColor: "black",
            borderRadius: 50, paddingLeft: 10, paddingRight: 10, color: "white", paddingBottom: 2,
          }}>{item.brand.name} {item.model != null ? item.model.name : null}</Text>
          <Image source={{
            uri: item.brand.image,
          }}
            style={{
              resizeMode: "center", width: 100, height: 100, marginTop: 5
            }} />
          <View>
            <Text style={{
              marginTop: 10, borderColor: "black", borderRadius: 10,
              borderWidth: 2, paddingLeft: 10, paddingRight: 5, paddingTop: 2
            }}>{item.car.data().licencePlate}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView refresh={refreshCarousel}>
      {carsToUser.length == 0 ?
        <SafeAreaView>
          <Image source={require('../assets/logo/logo.png')} style={{
            resizeMode: 'contain', width: windowWidth, height: 200,
            marginTop: -25, marginBottom: -40, opacity: 0.3
          }} />
          <Text h5 style={{ color: 'gray', textAlign: "center", marginTop: -10 }}>- nu aveți nicio mașină asignată -</Text>
        </SafeAreaView>
        : null}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        {carsToUser.length != 0 ?
          <View style={{ marginTop: 10, height: 180 }}>
            <Carousel
              ref={(c) => { _carousel = c; }}
              layout={"default"}
              renderItem={_renderItem}
              data={carsToUser}
              sliderWidth={windowWidth}
              itemWidth={150}
              firstItem={2}
              initialNumToRender={100}
              onSnapToItem={index => changeCar(index)}
            />
          </View>
          : null}
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
          <Button style={{ marginTop: 10, marginRight: '2%' }} mode="outlined" color="black" icon="plus"
            onPress={() => navigation.navigate("ManageCarScreen", { carId: null })}
          >Adaugă</Button>
          <Button style={{ marginTop: 10, marginRight: '2%' }} mode="outlined" color="black" icon="car-settings" disabled={carsToUser.length==0}
            onPress={() => navigation.navigate("CarActionsScreen", { carId: carsToUser[activeIndex].car.id })}
          >Acțiuni</Button>
          <Button style={{ marginTop: 10 }} mode="outlined" color="black" icon="delete" disabled={!isAdminToCar()}
            onPress={() => confirmDeleteCar()}
          >Șterge</Button>
        </View>
        <Card >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
            <View style={{ width: '50%', alignItems: "center", justifyContent: "flex-start", }}>
              <View style={{
                borderRadius: 75 / 2, width: 75, height: 75, borderWidth: 4, borderColor: 'green',
                marginRight: 5,
                justifyContent: 'center', alignItems: 'center',
              }} >
                <Text style={{ fontWeight: 'bold' }}>{petrolInfo.numberOfRefils} </Text>
              </View>
              <Text style={{ textAlign: 'center' }}>Plinuri carburant în ultimele 30 de zile</Text>
            </View>
            <View style={{ width: '50%', alignItems: "center", justifyContent: "flex-start", }}>
              <View style={{
                borderRadius: 75 / 2, width: 75, height: 75, borderWidth: 4, borderColor: 'green',
                marginRight: 5,
                justifyContent: 'center', alignItems: 'center'
              }} >
                <View>
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{petrolInfo.cost}</Text>
                  <Text style={{ opacity: 0.4, marginTop: -5, textAlign: 'center' }}>lei</Text>
                </View>
              </View>
              <Text style={{ textAlign: 'center' }}>Costuri carburant în ultimele 30 zile</Text>
            </View>
          </View>
        </Card>
        <TouchableOpacity onPress={() => navigation.navigate("CarAlertsScreen", { carId: selectedCarId })} >
          <Card >
            <Card.Title>ALERTE</Card.Title>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: windowWidth * 85 / 100 }}>
              <View style={{
                borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: getStatusColor(carInfo.rcaAlertDate), marginRight: 5
              }}
              />
              <Text style={{ fontWeight: 'bold' }}>RCA </Text>
              <Text>• {carInfo.rcaAlertDate != undefined ? formatDate(carInfo.rcaAlertDate) : "adaugă dată"} •  </Text>
              <Text style={{ color: getStatusColor(carInfo.rcaAlertDate) }}>{getNumberOfDays(carInfo.rcaAlertDate)} zile</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <View style={{
                borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: getStatusColor(carInfo.itpAlertDate), marginRight: 5
              }}
              />
              <Text style={{ fontWeight: 'bold' }}>ITP </Text>
              <Text>• {carInfo.itpAlertDate != undefined ? formatDate(carInfo.itpAlertDate) : "adaugă dată"} •  </Text>
              <Text style={{ color: getStatusColor(carInfo.itpAlertDate) }}>{getNumberOfDays(carInfo.itpAlertDate)} zile</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <View style={{
                borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: getStatusColor(carInfo.rovinietaAlertDate), marginRight: 5
              }}
              />
              <Text style={{ fontWeight: 'bold' }}>Roviniera </Text>
              <Text>• {carInfo.rovinietaAlertDate != undefined ? formatDate(carInfo.rovinietaAlertDate) : "adaugă dată"} •  </Text>
              <Text style={{ color: getStatusColor(carInfo.rovinietaAlertDate) }}>{getNumberOfDays(carInfo.rovinietaAlertDate)} zile</Text>
            </View>
            <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 5 }}>apasă pentru a configura</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ServiceIntervalScreen", { carId: selectedCarId })} >
          <Card >
            <Card.Title>INTERVAL SERVICE</Card.Title>
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
              <View style={{ width: '20%', marginLeft: '25%', marginRight: '10%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{carInfo.kmToService ? carInfo.kmToService : '-'}</Text>
                <Text>(km)</Text>
              </View>
              <View style={{ width: '20%', marginRight: '25%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{carInfo.daysToService ? getNumberOfDays(carInfo.daysToService) : '-'}</Text>
                <Text>(zile)</Text>
              </View>
            </View>
            <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 5 }}>apasă pentru a reseta perioada service</Text>
          </Card>
        </TouchableOpacity>
      </View >
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  slide: {
    width: 200,
    height: 200,
    paddingHorizontal: 20,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  slideInnerContainer: {
    width: 280,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10
  }
});