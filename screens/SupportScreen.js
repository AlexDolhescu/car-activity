import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Button } from 'react-native-paper';
import { Text } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { useFocusEffect } from '@react-navigation/native';

const SupportScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [sesisation, setSesisation] = useState({});
  const [image, setImage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);


  React.useEffect(() => {
    void async function fetchData() {
      getUserById();
    }();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getUserById();
      return () => getUserById();
    }, [])
  );

  const getUserById = () => {
    firestore()
      .collection('user')
      .doc(user.uid)
      .get()
      .then((user) => {
        setUserInfo(user);
      })
      .catch((error) => {
        console.log('Something went wrong with find user to firestore.', error);
      });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    }).then(async (img) => {
      const imageUri = Platform.OS === 'ios' ? img.sourceURL : img.path;
      setImage(imageUri);
    })
      .catch((err) => {
        console.log(err);
      })
  };

  const sentSesisation = () => {
    console.log(deviceInfo)
    if (sesisation.title == null || sesisation.descriprion == null) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
    }
    if (image == undefined || image == null) {
      save(null);
      return;
    }
    let filename = image.substring(image.lastIndexOf('/') + 1);
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    const storageRef = storage().ref(`sesisations/${filename}`);
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
    firestore()
      .collection('sesisation')
      .add({
        deviceInfo: {
          applicationName: DeviceInfo.getApplicationName(),
          buildNumber: DeviceInfo.getBuildNumber(),
          deviceId: DeviceInfo.getDeviceId(),
          deviceType: DeviceInfo.getDeviceType(),
          systemName: DeviceInfo.getSystemName(),
          systemVersion: DeviceInfo.getSystemVersion(),
          uniqueId: DeviceInfo.getUniqueId(),
          version: DeviceInfo.getVersion(),
        },
        title: sesisation.title,
        description: sesisation.description,
        image: url,
        userInfo: userInfo,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        setSesisation({});
        setImage(null);
        Alert.alert(
          'Succes',
          'Sesizarea a fost adaugată cu succes!',
        );
        navigation.goBack();
      })
      .catch((error) => {
        console.log('Something went wrong with sesisation car to firestore.', error);
      });
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Icon size={80} name='chat-alert-outline' color="black" style={{ marginTop: 20, marginRight: 5 }} />
        </View>
        <View style={{
          backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
          flexDirection: "row", alignItems: "center", alignContent: "flex-start"
        }}>
          <Text style={{ fontWeight: "bold" }}>*Titlu </Text>
          <TextInput
            onChangeText={title => setSesisation({ ...sesisation, title: title })}
            placeholder="Nu merge încărcarea de poze"
            value={sesisation.title}
          />
        </View>

        <View style={{
          backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
          flexDirection: "row", alignItems: "center", alignContent: "flex-start"
        }}>
          <Text style={{ fontWeight: "bold" }}>*Descriere </Text>
          <TextInput
            onChangeText={description => setSesisation({ ...sesisation, description: description })}
            placeholder="detaliază problema"
            value={sesisation.description}
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
          <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>Adaugă imagine</Text>
          : <Text style={{ marginTop: 10, color: 'gray' }} onPress={choosePhotoFromLibrary}>Editează imagine</Text>}

        <Button style={{ width: windowWidth * 85 / 100, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
          onPress={() => sentSesisation()}
        >Trimite sesizarea</Button>
      </View>
    </ScrollView>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
