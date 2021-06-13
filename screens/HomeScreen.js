import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Alert, StyleSheet, ScrollView, SafeAreaView, TouchableHighlight } from 'react-native';
import { TextInput, Title, Button } from 'react-native-paper';
import { Icon, Text, Card, Image } from 'react-native-elements'
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import Carousel from 'react-native-snap-carousel';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carInfo, setCarInfo] = useState({});
  const [carsToUser, setCarsToUser] = useState([]);
  const [refreshCarousel, setRefreshCarousel] = useState(false);
  const [carouselItems, setCarouselItems] = useState([
    {
      title: "Vw Golf",
      icon: "vw"
    },
    {
      title: "Bmw Seria 3",
      icon: "vw.png"
    },
    {
      title: "Audi RS6",
      icon: "vw.png"
    },
    {
      title: "Vw Passat",
      icon: "vw.png"
    },
    {
      title: "Ford Focus",
      icon: "vw.png"
    },
  ]);

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


  const changeCar = (index) => {
    setActiveIndex(index)
    console.log(carouselItems[index])
  }

  const loadCars = () => {
    firestore()
      .collection('carUser')
      .where("userId", "==", user.uid)
      .get()
      .then(async (querySnapshot) => {
        let chartData = querySnapshot.docs.map(doc => doc.data())
        for (const doc of chartData) {
          let selectedIndex = 0;
          let carToPush = {};
          let car = await getCarById(doc.carId);
          car.id = doc.carId; //merge?
          let model = await getModelById(car.data().modelId);
          let brand = await getBrandById(car.data().brandId);
          carToPush = { doc, car, model, brand };
          if (doc.isSelected == true) {
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

  /**
   * returneaza sursa imaginii modelului masinii daca exista, altfel sursa brandului masinii
   * @param {*} modelId 
   * @param {*} brandId 
   */
  const getCarLogoByCarId = (modelId, brandId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('model')
        .doc(modelId)
        .get()
        .then((model) => {
          if (model.image != null) {
            resolve(model.image);
          }
        })
        .catch((error) => {
          console.log('Something went wrong with find model to firestore.', error);
        });
      firestore()
        .collection('brand')
        .doc(brandId)
        .get()
        .then((brand) => {
          resolve(brand.image);
        })
        .catch((error) => {
          console.log('Something went wrong with find brand to firestore.', error);
        });
    });
  };

  const setCarInformations = (car) => {
    // TODO de luat toate alertele - date despre plin, costuri, etc
    // car.id -> uid
    // car este un document
    setCarInfo(car.data());
  }




  const _renderItem = ({ item, index }) => {
    var icon = index == 1
      ? require('../assets/golf.png')
      : require('../assets/vw.png');
    return (
      <View style={styles.slide}>
        <View style={styles.slideInnerContainer}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.brand.name} | {item.model ? item.mode.name : null}</Text>
          <Image source={{
            uri: item.brand.image,
          }}
            style={{
              resizeMode: "contain", width: 150, height: 200,
              marginTop: -20
            }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView refresh={refreshCarousel}>
      { carsToUser.length == 0 ?
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
          <View style={{ marginTop: 10, height: 200 }}>
            <Carousel
              ref={(c) => { _carousel = c; }}
              layout={"default"}
              renderItem={_renderItem}
              data={carsToUser}
              sliderWidth={windowWidth}
              itemWidth={200}
              firstItem={2}
              initialNumToRender={100}
              onSnapToItem={index => changeCar(index)}
            />
          </View>
          : null}
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
          <Button style={{ width: 200, marginBottom: 10, marginTop: 10, marginRight: '2%' }} mode="outlined" color="black"
            onPress={() => navigation.navigate("ManageCarScreen")}
          >Adaugă o mașină</Button>
          <Button style={{ width: 150, marginBottom: 10, marginTop: 10 }} mode="outlined" color="black"
            onPress={() => navigation.navigate("CarActionsScreen", {carId: carsToUser[activeIndex].car.id})}
          >Gestionează</Button>
        </View>
        <Card >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
            <View style={{ width: '50%', alignItems: "center", justifyContent: "flex-start", }}>
              <View style={{
                borderRadius: 75 / 2, width: 75, height: 75, borderWidth: 4, borderColor: 'green',
                marginRight: 5,
                justifyContent: 'center', alignItems: 'center',
              }} >
                <Text style={{ fontWeight: 'bold' }}>1 </Text>
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
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>900</Text>
                  <Text style={{ opacity: 0.4, marginTop: -5, textAlign: 'center' }}>lei</Text>
                </View>
              </View>
              <Text style={{ textAlign: 'center' }}>Costuri carburant în ultimele 30 zile</Text>
            </View>
          </View>
        </Card>

        <Card >
          <Card.Title>ALERTE</Card.Title>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: windowWidth * 85 / 100 }}>
            <View style={{
              borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: 'green', marginRight: 5
            }}
            />
            <Text style={{ fontWeight: 'bold' }}>RCA </Text>
            <Text>• 06/08/2021  • 52 zile</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <View style={{
              borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: 'green', marginRight: 5
            }}
            />
            <Text style={{ fontWeight: 'bold' }}>ITP </Text>
            <Text>• 11/02/2023  • 483 zile</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <View style={{
              borderRadius: 44 / 2, width: 15, height: 15, backgroundColor: '#f00', marginRight: 5
            }}
            />
            <Text style={{ fontWeight: 'bold' }}>Roviniera </Text>
            <Text>• 06/08/2020  • 0 zile</Text>
          </View>
          <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 5 }}>apasă pentru a configura</Text>
        </Card>
        <Card >
          <Card.Title>INTERVAL SERVICE</Card.Title>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
            <View style={{ width: '20%', marginLeft: '25%', marginRight: '10%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>15000</Text>
              <Text>(km)</Text>
            </View>
            <View style={{ width: '20%', marginRight: '25%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>200</Text>
              <Text>(zile)</Text>
            </View>
          </View>
          <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 5 }}>apasă pentru a reseta perioada service</Text>
        </Card>
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