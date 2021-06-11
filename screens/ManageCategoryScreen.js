import React, { useState, useContext } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { Card, Icon } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const ManageCategoryScreen = () => {
  
  const [categoryName, setCategoryName] = useState(null);
  const [description, setDescriprion] = useState(null);
  const [image, setImage] = useState(null);

  const saveCategory = () => {
    if (categoryName == null || image == null) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
    }
    let filename = image.substring(image.lastIndexOf('/') + 1);
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    const storageRef = storage().ref(`category/${filename}`);
    const task = storageRef.putFile(image);
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    }, (error) => {
      console.log('Something went wrong on upload image.', error);
    }, async () => {
      const url = await storageRef.getDownloadURL();
      firestore()
      .collection('category')
      .add({
        name: categoryName,
        description: description,
        image: url,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        setCategoryName(null);
        setDescriprion(null);
        setImage(null);
        Alert.alert(
          'Succes',
          'Brandul a fost adaugat cu succes!',
        );
        // navigation.navigate("ActivityScreen")
      })
      .catch((error) => {
        console.log('Something went wrong with added car to firestore.', error);
      });
    });
  }

    return (
      <ScrollView>
      <View style={styles.container}>
        <View style={{ width: '100%', alignSelf: 'center', alignItems: 'center' }}>
          <TextInput
            label="Nume"
            value={categoryName}
            mode="outlined"
            onChangeText={name => setCategoryName(name)}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '96%' }}
          />
          <TextInput
            label="Descriere"
            value={description}
            mode="outlined"
            multiline
            onChangeText={value => setDescriprion(value)}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '96%' }}
          />
          {image != null ?
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={choosePhotoFromLibrary}
            >
              <Image source={{ uri: image }} style={{ height: 120, width: 120 }} />
            </TouchableOpacity>
            : <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={choosePhotoFromLibrary}
            >
              <Image source={require('../assets/plus_icon.png')} style={{ height: 120, width: 120 }} />
            </TouchableOpacity>
          }
          {image == null ?
            <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>Adaugă logo</Text>
            : <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>Editează logo</Text>}
          <Button style={{ marginTop: 20, width: 130 }} mode="contained" color="black" onPress={() => saveCategory()}>Salvează</Button>
        </View>
      </View>
    </ScrollView>
    );
};

export default ManageCategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
