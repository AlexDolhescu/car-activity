import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TextInput as TextInputRN, Switch } from 'react-native';
import { Button} from 'react-native-paper';
import { Text } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Moment from 'moment';

const ManageCarScreen = ({ route, navigation }) => {

  const { carId } = route.params;
  const { user, logout } = useContext(AuthContext);
  const [car, setCar] = useState({
    kmIntervalService: "15000",
    daysIntervalService: "365",
    showGeneralData: true,
    showGallery: true,
    showActivities: true,
  });
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [listItems, setListItems] = useState([]);

  React.useEffect(() => {
    void async function fetchData() {
      if (carId == undefined) {
        loadBrands();
      } else {
        loadCarData(carId)
      }
    }();
  }, []);

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

  const loadCarData = (carId) => {
    firestore()
      .collection('car')
      .doc(carId)
      .get()
      .then((car) => {
        setCar({ ...car, ...car.data() });
      })
      .catch((error) => {
        console.log('Something went wrong with find car to firestore.', error);
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

  const showPublicCar = () => {
    if (car.showGeneralData && car.showGallery && car.showActivities) {
      return 'checked';
    }
    return 'unchecked';
  }

  const showPublicCarPress = () => {
    if (showPublicCar() == 'checked') {
      setCar({ ...car, showGeneralData: false, showGallery: false, showActivities: false })
    } else {
      setCar({ ...car, showGeneralData: true, showGallery: true, showActivities: true })
    }
  }

  const showGeneralDataPress = () => {
    setCar({ ...car, showGeneralData: !car.showGeneralData })
  }

  const showGalleryPress = () => {
    setCar({ ...car, showGallery: !car.showGallery })
  }

  const showActivitiesPress = () => {
    setCar({ ...car, showActivities: !car.showActivities })
  }

  const addCar = () => {
    firestore()
      .collection('car')
      .add({
        brandId: car.brandId,
        modelId: car.modelId,
        vin: car.vin,
        km: car.km,
        licencePlate: car.licencePlate,
        fabricationYear: car.fabricationYear,
        cilindricalCapacity: car.cilindricalCapacity,
        kw: car.kw,
        hoursePower: car.hoursePower,
        kmToService: car.kmToService,
        daysToService: Moment(new Date()).add(Number(car.daysToService), 'days').toString(),
        kmIntervalService: car.kmIntervalService,
        daysIntervalService: car.daysIntervalService,
        showGeneralData: car.showGeneralData,
        showGallery: car.showGallery,
        showActivities: car.showActivities,
        rcaAlertDate: null,
        itpAlertDate: null,
        rovinietaAlertDate: null,
        createdDate: firestore.Timestamp.fromDate(new Date()),
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(async () => {
        if (carId == undefined) {
          let findCar = await getCarByVin(car.vin);
          await saveCarUser(findCar[0].id, user.uid);
          Alert.alert(
            'Succes',
            'Mașina a fost salvată cu succes!',
          );
        }
        navigation.navigate("HomeScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with added car to firestore.', error);
      });
  }

  const updateCar = () => {
    firestore()
      .collection('car')
      .doc(carId)
      .update({
        brandId: car.brandId,
        modelId: car.modelId,
        vin: car.vin,
        km: car.km,
        licencePlate: car.licencePlate,
        fabricationYear: car.fabricationYear,
        cilindricalCapacity: car.cilindricalCapacity,
        kw: car.kw,
        hoursePower: car.hoursePower,
        kmToService: car.kmToService,
        daysToService: Moment(new Date()).add(Number(car.daysToService), 'days').toString(),
        kmIntervalService: car.kmIntervalService,
        daysIntervalService: car.daysIntervalService,
        showGeneralData: car.showGeneralData,
        showGallery: car.showGallery,
        showActivities: car.showActivities,
        rcaAlertDate: car.rcaAlertDate,
        itpAlertDate: car.itpAlertDate,
        rovinietaAlertDate: car.rovinietaAlertDate,
        createdDate: car.createdDate,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(async () => {
        Alert.alert(
          'Succes',
          'Mașina a fost salvată cu succes!',
        );
        navigation.navigate("HomeScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with update car to firestore.', error);
      });
  }

  const saveCar = async () => {
    if (car.brandId == null || car.modelId == null || car.vin == null || car.licencePlate == null || car.fabricationYear == null || car.vin.length < 17) {
      Alert.alert(
        'Atenție',
        'Există câmpuri obligatorii necompletate!',
      );
      return;
    }
    if (carId == undefined) {
      let existCar = await getCarByVin(car.vin);
      if (existCar.length > 0) {
        Alert.alert(
          'Atenție',
          'Există deja o mașină cu această serie de caroserie ! Dacă aveți probleme contactați-ne în secțiunea de Suport !',
        );
        return;
      }
      addCar();
      return;
    }
    updateCar();
  };

  const getCarByVin = (carVin) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('car')
        .where("vin", "==", carVin)
        .get()
        .then((querySnapshot) => {
          let chartData = querySnapshot.docs.map(doc => doc)
          if (chartData.length > 0) {
            resolve(chartData);
          }
          resolve([]);
        })
        .catch((error) => {
          console.log('Something went wrong with find user to firestore.', error);
        });
    });
  };

  const saveCarUser = (carId, userId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('carUser')
        .add({
          carId: carId,
          userId: userId,
          isSelected: true,
          isAdmin: true
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log('Something went wrong with add carUser to firestore.', error);
        });
    });
  };

  const selectItem = async (item) => {
    if (carId == undefined && car.brandId == undefined) {
      setCar({ ...car, brandId: item.id })
      let brands = await getModelsByCarId(item.id);
      setListItems(brands);
      return;
    }
    setCar({ ...car, modelId: item.id })
  }

  const getNumberOfDays = (date) => {
    return Moment(new Date(date)).diff(Moment(new Date()), 'days').toString();
  }

  return (
    <View>
      {(car.brandId == undefined || car.modelId == undefined) && listItems.length > 0 ?
        <View>
          <Text h4 style={{ marginTop: 10, marginLeft: 10 }}>{carId == undefined ? "Alege o marcă" : "Alege un model"}</Text>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            {listItems.map(item => (
              <TouchableOpacity onPress={() => selectItem(item)}>
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
          </View>
        </View>
        :
        <ScrollView>
          <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
              <View>
                <Text style={{ width: 100, textAlign: 'center' }}>Date mașină</Text>
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold" }}>*Serie caroserie (VIN) </Text>
              <TextInputRN
                onChangeText={vin => setCar({ ...car, vin: vin })}
                maxLength={17}
                autoCapitalize="characters"
                placeholder="WVWZZZ1KZ8U40245"
                value={car.vin}
              />
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold", }}>*Km actuali </Text>
              <TextInputRN
                onChangeText={value => setCar({ ...car, km: value })}
                maxLength={7}
                placeholder="120366"
                keyboardType="numeric"
                value={car.km}
              />
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold", }}>*Număr înmatriculare </Text>
              <TextInputRN
                onChangeText={value => setCar({ ...car, licencePlate: value })}
                placeholder="IS 84 DOL"
                autoCapitalize="characters"
                value={car.licencePlate}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
              <View style={{
                backgroundColor: "white", width: windowWidth * 40 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginRight: 10
              }}>
                <Text style={{ fontWeight: "bold", }}>*An fabricație </Text>
                <TextInputRN
                  onChangeText={value => setCar({ ...car, fabricationYear: value })}
                  maxLength={4}
                  placeholder="2021"
                  keyboardType="numeric"
                  value={car.fabricationYear}
                />
              </View>
              <View style={{
                backgroundColor: "white", width: windowWidth * 40 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start"
              }}>
                <Text style={{ fontWeight: "bold", }}>Motor </Text>
                <TextInputRN
                  onChangeText={value => setCar({ ...car, cilindricalCapacity: value })}
                  maxLength={4}
                  placeholder="1998 cm3"
                  keyboardType="numeric"
                  value={car.cilindricalCapacity}
                />
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
              <View style={{
                backgroundColor: "white", width: windowWidth * 40 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginRight: 10
              }}>
                <Text style={{ fontWeight: "bold", }}>Kw stock </Text>
                <TextInputRN
                  onChangeText={value => setCar({ ...car, kw: value })}
                  maxLength={4}
                  placeholder="77 kw"
                  keyboardType="numeric"
                  value={car.kw}
                />
              </View>
              <View style={{
                backgroundColor: "white", width: windowWidth * 40 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start"
              }}>
                <Text style={{ fontWeight: "bold", }}>CP actuali </Text>
                <TextInputRN
                  onChangeText={value => setCar({ ...car, hoursePower: value })}
                  maxLength={4}
                  placeholder="210 CP"
                  keyboardType="numeric"
                  value={car.hoursePower}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
              <View>
                <Text style={{ width: 120, textAlign: 'center' }}>Interval service</Text>
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
            </View>

            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold", }}>Km până la revizie </Text>
              <TextInputRN
                onChangeText={value => setCar({ ...car, kmToService: value })}
                placeholder="12500 km"
                maxLength={5}
                keyboardType="numeric"
                value={car.kmToService}
              />
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold", }}>Zile până la revizie </Text>
              <TextInputRN
                onChangeText={value => setCar({ ...car, daysToService: value })}
                placeholder="280 zile"
                keyboardType="numeric"
                maxLength={3}
                value={getNumberOfDays(car.daysToService)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
              <View>
                <Text style={{ width: 200, textAlign: 'center' }}>Setări afișare mașină public</Text>
              </View>
              <View style={{ flex: 1, height: 1, backgroundColor: 'black' }} />
            </View>
            <View style={{ width: '96%', marginTop: 10 }}>
              <TouchableOpacity onPress={() => showPublicCarPress()} style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
                <Switch
                  trackColor={{ false: "#767577", true: "#767577" }}
                  thumbColor={showPublicCar() == "checked" ? "#f54b63" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => showPublicCarPress()}
                  value={showPublicCar() == "checked" ? true : false}
                />
                <Text>Afișează mașina public</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: '92%', marginLeft: '4%' }}>
              <TouchableOpacity onPress={() => showGeneralDataPress()}>
                <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
                  <Text>Afișează date generale</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#767577" }}
                    thumbColor={car.showGeneralData ? "#f54b63" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => showGeneralDataPress()}
                    value={car.showGeneralData}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showGalleryPress()}>
                <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
                  <Text>Afișează galerie</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#767577" }}
                    thumbColor={car.showGallery ? "#f54b63" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => showGalleryPress()}
                    value={car.showGallery}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => showActivitiesPress()}>
                <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
                  <Text>Afișează activități</Text>
                  <Switch
                    trackColor={{ false: "#767577", true: "#767577" }}
                    thumbColor={car.showActivities ? "#f54b63" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => showActivitiesPress()}
                    value={car.showActivities}
                  />
                </View>

              </TouchableOpacity>

            </View>
            <Button style={{ width: 300, marginBottom: 20, marginTop: 20, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
              onPress={() => saveCar()}
            >Salvează</Button>
          </View>
        </ScrollView >
      }
    </View>
  );
};

export default ManageCarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});
