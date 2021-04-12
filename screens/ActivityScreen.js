import React, {useState, useContext} from 'react';
import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { AuthContext } from '../navigation/AuthProvider';

const ActivityScreen = () => {

  const {user, logout} = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);

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

  const uploadImage = async () => {
  if( image == null ) {
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

    return (
      <View style={styles.container}>
        <Text>Activity Screen</Text>
        {image != null ? <Image style={styles.img} source={{uri: image}} /> : null}
        <Button
          title="choose Photo From Library"
          onPress={choosePhotoFromLibrary}
        />
        {uploading ? (
          <View>
          <Text>{transferred} % Completed!</Text>
          <ActivityIndicator size="large" color="#0000ff" />
          </View>
      ) : (
        <Button
          title="upload photo"
          onPress={uploadImage}
        />
        )}
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
  }
});
