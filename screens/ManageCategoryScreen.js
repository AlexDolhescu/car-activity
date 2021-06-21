import React, { useState } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, Image, TextInput as TextInputRN, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const ManageCategoryScreen = ({ route, navigation }) => {

  const { categoryId } = route.params;
  const [categoryName, setCategoryName] = useState(null);
  const [description, setDescriprion] = useState(null);
  const [image, setImage] = useState(null);
  const [isNewPhoto, setIsNewPhoto] = useState(false);
  const [oldPhoto, setOldPhoto] = useState(null);

  React.useEffect(() => {
    void async function fetchData() {
      if (categoryId != undefined) {
        loadCategory();
      }
    }();
  }, []);

  const loadCategory = () => {
    firestore()
      .collection('category')
      .doc(categoryId)
      .get()
      .then(async (category) => {
        setCategoryName(category.data().name);
        setDescriprion(category.data().description);
        setImage(category.data().image);
      })
      .catch((error) => {
        console.log('Something went wrong with find category to firestore.', error);
      });
  }

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    }).then( async (img) => {
      const imageUri = Platform.OS === 'ios' ? img.sourceURL : img.path;
      setOldPhoto(image);
      setImage(imageUri);
      setIsNewPhoto(true);
    })
      .catch((err) => {
        console.log(err);
      })
  };


  const saveCategory = async () => {
    if (categoryName == null || image == null) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
    }
    if (isNewPhoto == false) {
      save(image);
      return;
    }
    if (oldPhoto != undefined) {
      let photoRef = await storage().refFromURL(oldPhoto);
      photoRef.delete().catch(function (error) {
        console.log(error);
      });
    }
    let filename = image.substring(image.lastIndexOf('/') + 1);
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    const storageRef = storage().ref(`categories/${filename}`);
    const task = storageRef.putFile(image);
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    }, (error) => {
      console.log('Something went wrong on upload image.', error);
    }, async () => {
      const url = await storageRef.getDownloadURL();
      save(url)
    });

  }

  const save = (url) => {
    if (categoryId != undefined) {
      updateCategory(url);
      return;
    }
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
        navigation.navigate("CategoriesScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with added car to firestore.', error);
      });
  }

  const updateCategory = (url) => {
    firestore()
      .collection('category')
      .doc(categoryId)
      .update({
        name: categoryName,
        description: description,
        image: url,
      })
      .then(async () => {
        Alert.alert(
          'Succes',
          'Categoria a fost salvată cu succes!',
        );
        navigation.navigate("CategoriesScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with update brand to firestore.', error);
      });
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ width: '100%', alignSelf: 'center', alignItems: 'center' }}>
          <View style={{
            backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
            flexDirection: "row", alignItems: "center", alignContent: "flex-start"
          }}>
            <Text style={{ fontWeight: "bold" }}>*Nume </Text>
            <TextInputRN
              onChangeText={name => setCategoryName(name)}
              placeholder="Reviezie"
              value={categoryName}
            />
          </View>
          <View style={{
            backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
            flexDirection: "row", alignItems: "center", alignContent: "flex-start"
          }}>
            <Text style={{ fontWeight: "bold" }}>Descriere </Text>
            <TextInputRN
              onChangeText={description => setDescriprion(description)}
              placeholder="date suplimentare"
              value={description}
            />
          </View>
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
              <Image source={require('../assets/plus_icon.png')} style={{ height: 80, width: 80, opacity: 0.5 }} />
            </TouchableOpacity>
          }
          {image == null ?
            <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>*Adaugă logo</Text>
            : <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>Editează logo</Text>}
          <Button style={{ width: 300, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
            onPress={() => saveCategory()}
          >Salvează</Button>
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
