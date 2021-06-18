import React, { useState, useContext, useEffect } from 'react';
import { View, Button, StyleSheet, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import { FlatList, ListItem, Avatar, Text, } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import ActionButton from 'react-native-action-button';
import Moment from 'moment'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ActivityScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [carInformations, setCarInformations] = useState({});
  const [activities, setActivities] = useState([]);

  React.useEffect(() => {
    void async function fetchData() {
      loadActivities()
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
          await getCarActivities(car.id);
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
            let categoryImage = await getCategoryImageById(activity.data.categoryId);
            activity = [...activity, { categoryImage: categoryImage }]
            activities.push(activity);
          };
          setActivities(activities);
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
        .then((car) => {
          resolve(car.data().image);
        })
        .catch((error) => {
          console.log('Something went wrong with find car to firestore.', error);
        });
    });
  };

  const choosePhotoFromLibrary = () => {


    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const submitPost = async () => {
    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);
    console.log('Post: ', post);

    firestore()
      .collection('activity')
      .add({
        userId: user.uid,
        post: "test",
        postImg: imageUrl,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        console.log('Post Added!');
        Alert.alert(
          'Post published!',
          'Your post has been published Successfully!',
        );
        setPost(null);
      })
      .catch((error) => {
        console.log('Something went wrong with added post to firestore.', error);
      });
  }

  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
        100,
      );

    });
    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      Alert.alert(
        'Image uploaded!',
        'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }
  }

  const list = [
    {
      name: 'Rezivie',
      subtitle: '-'
    },
    {
      name: 'Service spate',
      subtitle: 'Schimbat amortizoare, flanse, etc',
      avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg'
    },
  ];

  const formatDate = (date) => {
    if (date == null) {
      return;
    }
    return Moment(date).format("DD/MM/YYYY");
  }

  const filter = () => {

  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        {carInformations.brand != undefined ? // verificare degeaba acum
          <View style={{ flexDirection: "row", alignItems: "center", alignContent:"center", justifyContent: "space-between", }}>
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
            <View style={{ marginRight: 10 }}>
              <Icon size={25} name='filter-plus-outline' color="black" onPress={() => filter()} style={{ marginRight: 5 }} />
            </View>
          </View>
          : null}
        {
          activities.map(activity => (
            <ListItem key={i} bottomDivider style={{ width: '100%' }}
              Component={TouchableScale}
              friction={95} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              onPress={() => navigation.navigate("ManageActivityScreen", { activityId: activity.id })}
              activeScale={0.95} >
              <Avatar source={{ uri: activity.categoryImage }} />
              <ListItem.Content>
                <ListItem.Title>{activity.data.title}</ListItem.Title>
                <ListItem.Subtitle>{activity.data.description}</ListItem.Subtitle>
                <Text>{formatDate(activity.data.date)}</Text>
                <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>{activity.data.cost}</Text>
              </ListItem.Content>
              <ListItem.Chevron size={30} />
            </ListItem>
          ))
        }
      </View>

      <ActionButton
        buttonColor="black"
        onPress={() => navigation.navigate("ManageActivityScreen", { carId: carInformations.car.id })}
      />
    </View>

  );
};

export default ActivityScreen;



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
