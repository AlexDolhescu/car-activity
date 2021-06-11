import React, { useState, useContext } from 'react';
import { View, Alert, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from "react-native-modal-datetime-picker";
import { Icon } from 'react-native-elements'
import PickerSelect from 'react-native-picker-select';
import ImageView from "react-native-image-viewing";
import ImageList from "../utils/ImageList";
import ImageFooter from "../utils/ImageFooter";
import ImagePicker from 'react-native-image-crop-picker';
import { ImageComponent } from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const ManageActivityScreen = ({ navigation }) => {
  // intra cu carId - si eventual elementul
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    date: new Date(),
    categoryId: null,
    km: null,
    price: null,
    images: [],
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setImageIndex] = useState(0);
  const [refresh, setRefresh] = useState(false);
  // const [images, setImages] = useState([
  //   {
  //     uri: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4",
  //   },
  //   {
  //     uri: "https://images.unsplash.com/photo-1573273787173-0eb81a833b34",
  //   },
  //   {
  //     uri: "https://images.unsplash.com/photo-1569569970363-df7b6160d111",
  //   }
  // ]);


  // de luat categoriile din baza - nomenclatoare la fiecare
  const items = [
    { label: 'Revizie', value: '0' },
    { label: 'Tunning', value: '1' },
    { label: 'Altele', value: '2' },
  ];

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
      "Delete image",
      "Are you sure that you want to delete this image?",
      [
        {
          text: "Cancel",
          onPress: () => { },
          style: "cancel"
        },
        { text: "Delete", onPress: () => deletePhoto(image) }
      ]
    );
  };

  const deletePhoto = (image) => {
    let existingImages = [...activity.images];
    existingImages = existingImages.filter(img => img.uri != image.uri)
    setActivity({ ...activity, images: existingImages });
    setRefresh(!refresh);
  };

  const choosePhotoFromLibrary = () => {
    // TODO limiteaza pozele la un numar maxim de x (10 de ex)
    ImagePicker.openPicker({
      multiple: true
    }).then((choosedImages) => {
      let existingImages = [...activity.images];
      choosedImages.forEach(image => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        existingImages.push({ uri: imageUri });
      })
      setActivity({ ...activity, images: existingImages });
      setRefresh(!refresh);
    });
  };

  const saveActivity = () => {
    // TODO verifica fieldurile si da eroare daca nu completeaza 
    // sau disable la buton save - nu merge caci dupa fiecare modificare ar trebui sa dau refresh la buton
    if (activity.categoryId == null || activity.km == null) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
    }
    firestore()
      .collection('activity')
      .add({
        carId: 0,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        categoryId: activity.categoryId,
        km: activity.km,
        price: activity.price,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then((activitySaved) => {
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

  return (

    <View style={styles.container}>
      <TextInput
        label="Titlu"
        value={activity.title}
        mode="outlined"
        multiline
        onChangeText={title => setActivity({ ...activity, title: title })}
        theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
        style={{ width: '96%', marginTop: 10 }}
      />
      <PickerSelect
        onValueChange={(value) => setActivity({ ...activity, categoryId: value })}
        placeholder={{ label: "Selectează o categorie", value: null }}
        value={activity.categoryId}
        style={pickerSelectStyles}
        items={items}
      />
      <TextInput
        label="Descriere"
        value={activity.description}
        mode="outlined"
        multiline
        onChangeText={description => setActivity({ ...activity, description: description })}
        theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
        style={{ width: '96%', marginTop: 10 }}
      />

      <View style={{ width: '96%', marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
        {activity.images.length > 0 ?
          <Icon
            style={{ marginRight: 5 }}
            name='add-circle-outline'
            type='Ionicons'
            color='black'
            onPress={choosePhotoFromLibrary} /> : null}
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
            style={{ width: "96%", height: 50, marginLeft: 5, alignContent: "center", alignItems: "center" }}
          >
            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
              <Icon
                style={{ marginRight: 15 }}
                name='images'
                type='entypo'
                color='black'
                onPress={choosePhotoFromLibrary} />
              <Text style={{ marginLeft: 10 }}>Adaugă poze</Text>
            </View>
          </TouchableOpacity>
        }
        <ImageView
          images={activity.images}
          refresh={refresh}
          imageIndex={currentImageIndex}
          presentationStyle="overFullScreen"
          visible={isImageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          onLongPress={onLongPress}
          FooterComponent={({ imageIndex }) => (
            <ImageFooter imageIndex={imageIndex} imagesCount={activity.images.length} ></ImageFooter>
          )}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 10 }}>
        <Icon
          name='calendar'
          type='font-awesome'
          color='black'
          onPress={showDatePicker} />
        <Text style={{ marginLeft: 10 }} onPress={showDatePicker}>{activity.date.toDateString()}</Text>
        <DateTimePicker
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDatePicked}
          onCancel={hideDatePicker}
        />
      </View>
      <View style={{ width: '96%', marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
        <TextInput
          label="Număr km"
          value={activity.km}
          keyboardType='numeric'
          mode="outlined"
          onChangeText={km => setActivity({ ...activity, km: km })}
          maxLength={7}
          theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
          style={{ width: '65%', marginTop: 10, marginRight: '3%' }}
        />
        <TextInput
          label="Cost"
          value={activity.price}
          keyboardType='numeric'
          mode="outlined"
          onChangeText={price => setActivity({ ...activity, price: price })}
          maxLength={7}
          theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
          style={{ width: '32%', marginTop: 10 }}
        />
      </View>
      <Button style={{ marginTop: 10, width: 130 }} mode="contained" color="black" onPress={() => saveActivity()}>Salvează</Button>
    </View >

  );
};

export default ManageActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
