import React, { useState } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, Image, TextInput as TextInputRN, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const ManageBrandScreen = ({ route, navigation }) => {

  const { brandId } = route.params;
  const [brandName, setBrandName] = useState(null);
  const [description, setDescriprion] = useState(null);
  const [image, setImage] = useState(null);
  const [isNewPhoto, setIsNewPhoto] = useState(false);
  const [oldPhoto, setOldPhoto] = useState(null);

  React.useEffect(() => {
    void async function fetchData() {
      if (brandId != undefined) {
        loadBrand();
      }
    }();
  }, []);

  const loadBrand = () => {
    firestore()
      .collection('brand')
      .doc(brandId)
      .get()
      .then(async (brand) => {
        setBrandName(brand.data().name);
        setDescriprion(brand.data().description);
        setImage(brand.data().image);
      })
      .catch((error) => {
        console.log('Something went wrong with find brand to firestore.', error);
      });
  }

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    }).then((img) => {
      const imageUri = Platform.OS === 'ios' ? img.sourceURL : img.path;
      setOldPhoto(image);
      setIsNewPhoto(true);
      setImage(imageUri);
    })
      .catch((err) => {
        console.log(err);
      })
  };

  const saveBrand = async () => {
    if (brandName == null || image == null) {
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
    const storageRef = storage().ref(`brands/${filename}`);
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
    if (brandId != undefined) {
      updateBrand(url);
      return;
    }
    firestore()
      .collection('brand')
      .add({
        name: brandName,
        description: description,
        image: url,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        setBrandName(null);
        setDescriprion(null);
        setImage(null);
        Alert.alert(
          'Succes',
          'Marca a fost adaugată cu succes!',
        );
        navigation.navigate("BrandsAndModelScreen");
      })
      .catch((error) => {
        console.log('Something went wrong with added brand to firestore.', error);
      });
  }

  const updateBrand = (url) => {
    firestore()
      .collection('brand')
      .doc(brandId)
      .update({
        name: brandName,
        description: description,
        image: url,
      })
      .then(async () => {
        Alert.alert(
          'Succes',
          'Marca a fost salvată cu succes!',
        );
        navigation.navigate("BrandsAndModelScreen");
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
              onChangeText={name => setBrandName(name)}
              placeholder="Dacia"
              value={brandName}
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
            onPress={() => saveBrand()}
          >Salvează</Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default ManageBrandScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});
