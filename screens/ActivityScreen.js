import React, { useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import { FlatList, ListItem, Avatar } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import LinearGradient from 'react-native-linear-gradient';
import ActionButton from 'react-native-action-button';

const ActivityScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
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

  const actions = [
    {
      text: "Accessibility",
      name: "bt_accessibility",
      position: 2
    },
    {
      text: "Language",
      name: "bt_language",
      position: 1
    },
    {
      text: "Location",
      name: "bt_room",
      position: 3
    },
    {
      text: "Video",
      name: "bt_videocam",
      position: 4
    }
  ];

  return (


    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%' }}>
        {
          list.map((l, i) => (
            <ListItem key={i} bottomDivider style={{ width: '100%' }}
              Component={TouchableScale}
              friction={95} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.95} >
              <Avatar source={{ uri: l.avatar_url }} />
              <ListItem.Content>
                <ListItem.Title>{l.name}</ListItem.Title>
                <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
                <Text>20/11/2020</Text>
                <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>1500 lei</Text>
              </ListItem.Content>
              <ListItem.Chevron size={30} />
            </ListItem>
          ))
        }
      </View>

      <ActionButton
        buttonColor="black"
        onPress={() => navigation.navigate("ManageActivityScreen")}
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
