import React, { useState, useContext } from 'react';
import { View, Alert, Text, StyleSheet, Image, TouchableOpacity, TextInput as TextInputRN, Switch, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from "react-native-modal-datetime-picker";
import PickerSelect from 'react-native-picker-select';
import ImageView from "react-native-image-viewing";
import ImageList from "../utils/ImageList";
import ImageFooter from "../utils/ImageFooter";
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Moment from 'moment'

const ManageActivityScreen = ({ route, navigation }) => {

  const { activityId, carId } = route.params;
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    date: new Date(),
    categoryId: null,
    km: null,
    cost: null,
    images: [],
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setImageIndex] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [updateKm, setUpdateKm] = useState(true);
  const [categoties, setCategories] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [info, setInfo] = useState(false);

  React.useEffect(() => {
    void async function fetchData() {
      if (activityId == undefined) {
        loadCategories();
      } else {
        loadActivity(activityId);
      }
    }();
  }, []);

  const loadCategories = () => {
    firestore()
      .collection('category')
      .get()
      .then(async (querySnapshot) => {
        let categoties = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
        setCategories(categoties);
        setListItems(categoties);
      })
      .catch((error) => {
        console.log('Something went wrong with find categoties to firestore.', error);
      });
  };

  const loadActivity = (activityId) => {
    firestore()
      .collection('activity')
      .doc(activityId)
      .get()
      .then(async (activity) => {
        let images = await loadPhotos();
        setActivity({ ...activity.data(), images: images });
      })
      .catch((error) => {
        console.log('Something went wrong with find car to firestore.', error);
      });
  };

  const loadPhotos = () => {
    return new Promise((resolve, reject) => {
      const images = storage().ref().child(`activitiesImages/${activityId}`);
      images.listAll().then(async (res) => {
        let photos = [];
        for (let itemRef of res.items) {
          let url = await itemRef.getDownloadURL();
          photos.push({ uri: url });
        };
        resolve(photos);
      });
    });
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDatePicked = (date) => {
    { setActivity({ ...activity, date: date }) }
    hideDatePicker();
  };

  const onSelect = (images, index) => {
    setImageIndex(index);
    setImageViewerVisible(true);
  };

  const onLongPress = (image) => {
    Alert.alert(
      "Confirm",
      "Sunteți sigur că vreți să ștergeți poza? Se va șterge direct din bază, fără posibilitate de anulare.",
      [
        {
          text: "Anulează",
          onPress: () => { },
          style: "cancel"
        },
        { text: "Șterge", onPress: () => deletePhoto(image) }
      ]
    );
  };

  const deletePhoto = async (image) => {
    let existingImages = [...activity.images];
    existingImages = existingImages.filter(img => img.uri != image.uri)
    let photoRef = await storage().refFromURL(image.uri);
    photoRef.delete().then(function () {
      Alert.alert(
        'Succes',
        'Poza a fost ștearsă cu succes!',
      );
    }).catch(function (error) {
      console.log(error);
    });
    setActivity({ ...activity, images: existingImages });
    setRefresh(!refresh);
  };

  const choosePhotoFromLibrary = () => {
    // TODO limiteaza pozele la un numar maxim de x (10 de ex)
    ImagePicker.openPicker({
      multiple: true
    }).then((choosedImages) => {
      if (choosedImages.length + activity.images.length > 5) {
        Alert.alert(
          'Atenție',
          'Puteți adăuga maxim 5 poze!',
        );
        return;
      }
      let existingImages = [...activity.images];
      choosedImages.forEach(image => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        existingImages.push({ uri: imageUri });
      })
      setActivity({ ...activity, images: existingImages });
      setRefresh(!refresh);
    })
    .catch((err) => {
      console.log(err);
    })
  };

  const saveActivity = () => {
    if (activity.categoryId == null || activity.km == null || activity.title == null) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
    }
    if (activityId != undefined) {
      updateActivity();
      return;
    }
    firestore()
      .collection('activity')
      .add({
        carId: carId,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        categoryId: activity.categoryId,
        km: activity.km,
        cost: activity.cost,
        createdDate: firestore.Timestamp.fromDate(new Date()),
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(async (activitySaved) => {
        let imagesUrl = [];
        activity.images.forEach(img => {
          // TODO de facut in utils filename
          let filename = img.uri.substring(img.uri.lastIndexOf('/') + 1);
          const extension = filename.split('.').pop();
          const name = filename.split('.').slice(0, -1).join('.');
          filename = name + Date.now() + '.' + extension;
          const storageRef = storage().ref(`activitiesImages/${activitySaved.id}/${filename}`);
          const task = storageRef.putFile(img.uri);
          task.on('state_changed', (taskSnapshot) => {
            console.log(
              `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
            );
          }, (error) => {
            console.log('Something went wrong on upload image.', error);
          }, async () => {
            const url = await storageRef.getDownloadURL();
            imagesUrl.push(url);
          });
        })
        if (updateKm) {
          await firestore().collection('car').doc(carId).update(
            {
              km: activity.km
            }
          );
        }
        Alert.alert(
          'Succes',
          'Activitatea a fost salvată cu succes!',
        );
        navigation.navigate("ActivityScreen")
      })
      .catch((error) => {
        console.log('Something went wrong with added activity to firestore.', error);
      });
  };

  const updateActivity = () => {
    firestore()
      .collection('activity')
      .doc(activityId)
      .update({
        carId: activity.carId,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        categoryId: activity.categoryId,
        km: activity.km,
        cost: activity.cost,
        createdDate: activity.createdDate,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(async () => {
        let imagesUrl = [];
        activity.images.forEach(img => {
          let filename = img.uri.substring(img.uri.lastIndexOf('/') + 1);
          const extension = filename.split('.').pop();
          const name = filename.split('.').slice(0, -1).join('.');
          filename = name + Date.now() + '.' + extension;
          const storageRef = storage().ref(`activitiesImages/${activityId}/${filename}`);
          const task = storageRef.putFile(img.uri);
          task.on('state_changed', (taskSnapshot) => {
            console.log(
              `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
            );
          }, (error) => {
            console.log('Something went wrong on upload image.', error);
          }, async () => {
            const url = await storageRef.getDownloadURL();
            imagesUrl.push(url);
          });
        })
        Alert.alert(
          'Succes',
          'Activitatea a fost salvată cu succes!',
        );
        navigation.navigate("ActivityScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with update activity to firestore.', error);
      });
  }

  const formatDate = (date) => {
    if (date == null) {
      return;
    }
    return Moment(date).format("DD/MM/YYYY");
  }

  return (
    <View>
      {activityId == undefined && activity.categoryId == undefined && listItems.length > 0 ?
        <View>
          <Text h4 style={{ marginTop: 10, marginLeft: 10 }}>Alege o categorie</Text>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            {listItems.map(item => (
              <TouchableOpacity onPress={() => setActivity({ ...activity, categoryId: item.id })}>
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
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold" }}>*Titlu </Text>
              <TextInputRN
                onChangeText={title => setActivity({ ...activity, title: title })}
                maxLength={17}
                multiline
                placeholder="Revizie ulei și filtre"
                value={activity.title}
                style={{color:"black"}}
              />
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold" }}>*Descriere </Text>
              <TextInputRN style={{ width: windowWidth * 60 / 100 }}
                onChangeText={description => setActivity({ ...activity, description: description })}
                multiline
                placeholder={"Am schimbat și filtrele.\nManopera 200 lei\nTrebuie schimbat și ..."}
                value={activity.description}
                style={{color:"black"}}
              />
            </View>
            <View style={{ width: '90%', marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
              {activity.images.length > 0 ?
                <ImageList
                  refresh={refresh}
                  images={activity.images.map((image) => image.uri)}
                  imageIndex={currentImageIndex}
                  onPress={(index) => onSelect(activity.images, index)}
                  shift={0.25}
                />
                :
                <TouchableOpacity
                  onPress={choosePhotoFromLibrary}
                  style={{ width: "90%", height: 50, marginLeft: 5, alignContent: "center", alignItems: "center" }}
                >
                  <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
                    <Icon size={25} name='image' color="black" onPress={choosePhotoFromLibrary} style={{ marginRight: 5 }} />
                    <Text style={{ marginLeft: 10 }}>Adaugă poze</Text>
                  </View>
                </TouchableOpacity>
              }
              {activity.images.length > 0 ?
                <View>
                  <Icon size={25} name='plus-circle-outline' color="black" onPress={choosePhotoFromLibrary} style={{ marginRight: 5 }} />
                  <Icon size={25} name='information' color="black" onPress={() => setInfo(!info)} style={{ marginRight: 5 }} />
                </View>
                : null}
              <ImageView
                images={activity.images}
                refresh={refresh}
                imageIndex={currentImageIndex}
                presentationStyle="overFullScreen"
                visible={isImageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
                onLongPress={onLongPress}
                FooterComponent={({ imageIndex }) => (
                  <ImageFooter imageIndex={imageIndex} imagesCount={activity.images.length} >sss</ImageFooter>
                )}
              />
            </View>
            {info == true ?
              <Text style={{ marginTop: -5, opacity: 0.5, marginBottom: 5 }}>apasă lung în vizualizarea pozei pentru a șterge</Text>
              : null}
            <TouchableOpacity onPress={showDatePicker}>
              <View style={{
                backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start"
              }}>
                <Text style={{ fontWeight: "bold", marginRight: 10 }} onPress={showDatePicker}>*Data</Text>
                <Text style={{ paddingTop: 15, paddingBottom: 15 }} onPress={showDatePicker}>{formatDate(activity.date)}</Text>
              </View>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDatePicked}
              onCancel={hideDatePicker}
            />
            <View style={{ flexDirection: "row", alignItems: "center", alignContent: 'center', justifyContent: 'center' }}>
              <View style={{
                backgroundColor: "white", width: windowWidth * 55 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginRight: windowWidth * 3 / 100
              }}>
                <Text style={{ fontWeight: "bold" }}>*Km </Text>
                <TextInputRN
                  onChangeText={km => setActivity({ ...activity, km: km })}
                  keyboardType="numeric"
                  placeholder="120 356"
                  value={activity.km}
                  style={{color:"black"}}
                />
              </View>
              <View style={{ marginTop: 20, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                <Text>Actualizează km</Text>
                <Switch
                  style={{}}
                  trackColor={{ false: "#767577", true: "#767577" }}
                  thumbColor={updateKm ? "#f54b63" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setUpdateKm(!updateKm)}
                  value={updateKm}
                />
              </View>
            </View>
            <View style={{
              backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
              flexDirection: "row", alignItems: "center", alignContent: "flex-start"
            }}>
              <Text style={{ fontWeight: "bold" }}>Cost </Text>
              <TextInputRN
                onChangeText={cost => setActivity({ ...activity, cost: cost })}
                keyboardType="numeric"
                placeholder="300 lei"
                value={activity.cost}
                style={{color:"black"}}
              />
            </View>
            <Button style={{ width: 300, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
              onPress={() => saveActivity()}
            >Salvează</Button>
          </View >
        </ScrollView>
      }
    </View>
  );
};

export default ManageActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '96%',
    alignSelf: "center",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    width: '96%',
    alignSelf: "center",
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 10,
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
