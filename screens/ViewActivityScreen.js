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

const ViewActivityScreen = ({ route, navigation }) => {

  const { carId, onlyView } = route.params;

  const { user, logout } = useContext(AuthContext);
  const [carInformations, setCarInformations] = useState({});
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showTimePeriod, setShowTimePeriod] = useState(false);
  const [category, setCategory] = useState(null);
  const [timePeriod, setTimePeriod] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [apiActivities, setApiActivities] = useState([]);
  const [timePeriodValues] = useState([
    { id: 1, name: "Ultima lună" },
    { id: 2, name: "Ultimul an" },
  ])


  React.useEffect(() => {
    void async function fetchData() {
      loadCategories();
      loadActivities();
    }();
  }, []);

  const loadApiData = () => {
    fetch(`https://caractivity2.free.beeceptor.com/services?vin=${encodeURIComponent("WVWZZZ1KZ03214TEST")}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.length > 0) {
          setApiActivities(json);
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const loadActivities = async () => {
    let car = await getCarById(carId);
    let model = await getModelById(car.data().modelId);
    let brand = await getBrandById(car.data().brandId);
    let carToPush = { car, model, brand };
    await getCarActivities(car.id);
    setCarInformations(carToPush);
  };

  const loadCategories = () => {
    firestore()
      .collection('category')
      .get()
      .then(async (querySnapshot) => {
        let categoties = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
        setCategories(categoties);
      })
      .catch((error) => {
        console.log('Something went wrong with find categoties to firestore.', error);
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

  const getCarActivities = (carId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('activity')
        .where("carId", "==", carId)
        .get()
        .then(async (querySnapshot) => {
          let activities = [];
          let chartData = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
          for (const activity of chartData) {
            let activityToAdd = {};
            let categoryImage = await getCategoryImageById(activity.data.categoryId);
            activityToAdd = { ...activity.data, id: activity.id, categoryImage: categoryImage };
            activities.push(activityToAdd);
          };
          setActivities(activities);
          setAllActivities(activities);
          resolve(activities);
        })
        .catch((error) => {
          console.log('Something went wrong with find activities to firestore.', error);
        });
    });
  };

  const getCategoryImageById = (categoryId) => {
    return new Promise((resolve, reject) => {
      firestore()
        .collection('category')
        .doc(categoryId)
        .get()
        .then((category) => {
          resolve(category.data().image);
        })
        .catch((error) => {
          console.log('Something went wrong with find category to firestore.', error);
        });
    });
  };

  const formatDate = (date) => {
    if (date == null) {
      return;
    }
    return Moment(date).format("DD/MM/YYYY");
  }

  const selectCategory = (item) => {
    setCategory({ ...item });
    let filteredActivities = [...activities];
    filteredActivities = filteredActivities.filter(activity => activity.categoryId == item.id);
    console.log(filteredActivities);
    setActivities(filteredActivities);
    setShowCategories(!showCategories);
    setShowFilter(!showFilter);
    setRefresh(!refresh);
  }

  const deleteFilters = () => {
    setCategory(null);
    setTimePeriod(null);
    setActivities(allActivities);
    setShowFilter(!showFilter);
    setRefresh(!refresh);
  }

  const selectTimePeriod = (item) => {
    setTimePeriod({ ...item });
    let filteredActivities = [...activities];
    if (item.id == 1) {
      filteredActivities = filteredActivities.filter(activity => Moment(activity.date) >= Moment(new Date()).subtract(1, 'months'));
    } else if (item.id == 2) {
      filteredActivities = filteredActivities.filter(activity => Moment(activity.date) >= Moment(new Date()).subtract(1, 'years'));
    }
    setActivities(filteredActivities);
    setShowFilter(!showFilter);
    setShowTimePeriod(!showTimePeriod);
    setRefresh(!refresh);
  }

  const calculateCosts = () => {
    let cost = 0;
    activities.forEach(activity => {
      if (activity.cost != null || activity.cost != undefined) {
        cost += Number(activity.cost);
      }
    });
    apiActivities.forEach(activity => {
      if (activity.cost != null || activity.cost != undefined) {
        cost += Number(activity.cost);
      }
    });
    return cost;
  }


  return (
    <View style={styles.container} refresh={refresh}>
      <View style={{ flex: 1, width: '100%' }}>
        {carInformations.brand != undefined ?
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", justifyContent: "space-between", }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 10, marginLeft: 5 }}>
                <Image source={{ uri: carInformations.model.image != undefined ? carInformations.model.image : carInformations.brand.image }}
                  style={{ width: 25, height: 25, marginRight: 10, marginLeft: 5 }}></Image>
                <Text h4>{carInformations.brand.name + " " + carInformations.model.name}</Text>
              </View>
              <TouchableOpacity onPress={() => loadApiData()}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginLeft: 5 }}>
                  <Text style={{
                    marginTop: 5, borderColor: "black", borderRadius: 10, fontWeight: "bold",
                    borderWidth: 2, paddingLeft: 10, paddingRight: 5, paddingTop: 2
                  }}>{carInformations.car.data().licencePlate}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ marginRight: 10, alignItems: "flex-end", justifyContent: "flex-start" }}>
              <Icon size={25} name='filter-plus-outline' color="black" onPress={() => setShowFilter(!showFilter)} style={{ marginTop: 5, marginRight: 5 }} />
              <View style={{ flexDirection: 'row', alignItems: "center" }}>
                <Text style={{ marginTop: 10 }}>Total costuri: </Text>
                <Text style={{ fontWeight: "bold", marginTop: 10 }}>{calculateCosts()}</Text>
              </View>

            </View>
          </View>
          : null}
        {activities.length > 0 && showFilter == false ?
          <ScrollView style={{ marginTop: 10 }}>
            {activities.map(activity => (
              <ListItem bottomDivider key={activity.id} style={{ width: '100%' }}
                Component={TouchableScale}
                friction={95} //
                tension={100}
                activeScale={0.95} >
                <Avatar source={{ uri: activity.categoryImage }} />
                <ListItem.Content>
                  <ListItem.Title>{activity.title}</ListItem.Title>
                  <ListItem.Subtitle>{activity.description}</ListItem.Subtitle>
                  <Text>{formatDate(activity.date)}</Text>
                  {activity.cost != undefined ?
                    <View style={{ flexDirection: "row", alignSelf: 'flex-end' }}>
                      <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>{activity.cost}</Text>
                      <Text> lei</Text>
                    </View>
                    : null}
                </ListItem.Content>
                <ListItem.Chevron size={30} />
              </ListItem>
            ))}
            {apiActivities.length > 0 ?
              <View style={{ alignItems: "center" }}>
                {apiActivities.map(activity => (
                  <View style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                    width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                  }}>
                    <View style={{}}>
                      <Text style={{ fontSize: 18, paddingLeft: 5 }}>{activity.title}</Text>
                      <Text style={{ paddingLeft: 5, opacity: 0.5 }}>{activity.description}</Text>
                      <Text>{formatDate(activity.date)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
                      <View style={{ flexDirection: "row", alignSelf: 'flex-end', marginRight: 5 }}>
                        <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>{activity.cost}</Text>
                        <Text> lei</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              : null}
          </ScrollView>
          : null}
        {showFilter == true && showCategories == false && showTimePeriod == false ?
          <View style={{ alignItems: "center" }}>
            <Text h5 style={{ marginTop: 10, marginLeft: 10 }}>Alege filtru</Text>
            <TouchableOpacity onPress={() => setShowCategories(!showCategories)}>
              <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                  <Text style={{ fontSize: 18 }}>Categorie: </Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>{category != null ? category.data.name : null}</Text>
                </View>
                <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePeriod(!showTimePeriod)}>
              <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", }}>
                  <Text style={{ fontSize: 18 }}>Perioadă: </Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>{timePeriod != null ? timePeriod.name : null}</Text>
                </View>
                <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteFilters()}>
              <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "black",
                width: windowWidth * 85 / 100, padding: 5, borderRadius: 20, marginTop: 15
              }}>
                <Text style={{ fontSize: 18, textAlign: "center", color: "white" }}>Șterge filtre</Text>
              </View>
            </TouchableOpacity>
          </View>
          : null}
        {showFilter == true && showCategories == true ?
          <View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setShowCategories(!showCategories)}>
                <View style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "white",
                  width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                }}>
                  <Text style={{ fontSize: 16 }}>Înapoi</Text>
                </View>
              </TouchableOpacity>
              {categories.map(item => (
                <TouchableOpacity onPress={() => selectCategory(item)}>
                  <View style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "white",
                    width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", }}>
                      <Image source={{ uri: item.data.image }} style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5 }}></Image>
                      <Text style={{ fontSize: 18 }}>{item.data.name}</Text>
                    </View>
                    <Icon size={25} name='chevron-right' color="black" style={{ marginRight: 5 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          : null}
        {showFilter == true && showTimePeriod == true ?
          <View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setShowTimePeriod(!showTimePeriod)}>
                <View style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "white",
                  width: windowWidth * 85 / 100, padding: 10, borderRadius: 20, marginTop: 10
                }}>
                  <Text style={{ fontSize: 16 }}>Înapoi</Text>
                </View>
              </TouchableOpacity>
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
            </View>
          </View>
          : null}
        { activities.length == 0 ?
          <View style={{
            alignItems: "center", justifyContent: "center", opacity: 0.2,
            alignContent: "center", alignSelf: "center", flex: 1
          }}>
            <Icon name='cancel' color='black' size={150} />
            <Text h3 style={{ marginTop: 20 }}>Nu există activitați</Text>
          </View>
          : null}
      </View>
    </View>

  );
};

export default ViewActivityScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  img: {
    width: '100%',
    height: 250,
    marginBottom: 15
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
});
