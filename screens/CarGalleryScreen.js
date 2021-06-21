import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { Card, Icon, Text } from 'react-native-elements'
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import ImageView from "react-native-image-viewing";
import ImageList from "../utils/ImageList";
import ImageFooter from "../utils/ImageFooter";

const CarGalleryScreen = ({ route, navigation }) => {

    const { carId, onlyView } = route.params;

    const [photos, setPhotos] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [currentImageIndex, setImageIndex] = useState(0);
    const [isImageViewerVisible, setImageViewerVisible] = useState(false);


    React.useEffect(() => {
        void async function fetchData() {
            loadPhotos();
        }();
    }, []);

    const loadPhotos = () => {
        const images = storage().ref().child(`carsGallery/${carId}`);
        // const image = images.child(carId);
        images.listAll().then((res) => {
            let photos = [];
            res.items.forEach((itemRef) => {
                itemRef.getDownloadURL().then(function (url) {
                    photos.push({ uri: url });
                    setPhotos(photos);
                    setRefresh(!refresh);
                }).catch(function (error) {
                    console.error(error);
                });
            });
        });
    }

    const onSelect = (images, index) => {
        setImageIndex(index);
        setImageViewerVisible(true);
    };

    const choosePhotoFromLibrary = () => {
        // TODO limiteaza pozele la un numar maxim de x (10 de ex)
        ImagePicker.openPicker({
            multiple: true
        }).then((choosedImages) => {
            let existingImages = [...photos];
            choosedImages.forEach(image => {
                const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
                existingImages.push({ uri: imageUri });
            })
            setPhotos(existingImages);
            savePhotos();
            setRefresh(!refresh);

        })
        .catch((err) => {
            console.log(err);
          })
    };

    const savePhotos = () => {
        photos.forEach(img => {
            // TODO de facut in utils filename
            let filename = img.uri.substring(img.uri.lastIndexOf('/') + 1);
            const extension = filename.split('.').pop();
            const name = filename.split('.').slice(0, -1).join('.');
            filename = name + Date.now() + '.' + extension;
            const storageRef = storage().ref(`carsGallery/${carId}/${filename}`);
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
            'Imagini încărcate cu succes!',
        );
    }

    const onLongPress = (image) => {
        if (onlyView == true) {
            return;
        }
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

    const deletePhoto = async (image) => {
        let existingImages = [...photos];
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
        setPhotos({ photos });
        setRefresh(!refresh);
    };


    return (
        <ScrollView>
            <View style={styles.container}>
                {photos.length > 0 ?
                    <View>
                        <ImageList
                            refresh={refresh}
                            images={photos.map((image) => image.uri)}
                            imageIndex={currentImageIndex}
                            onPress={(index) => onSelect(photos, index)}
                            shift={0.25}
                        />
                        <ImageView
                            images={photos}
                            refresh={refresh}
                            imageIndex={currentImageIndex}
                            presentationStyle="overFullScreen"
                            visible={isImageViewerVisible}
                            onRequestClose={() => setImageViewerVisible(false)}
                            onLongPress={onLongPress}
                            FooterComponent={({ imageIndex }) => (
                                <ImageFooter imageIndex={imageIndex} imagesCount={photos.length} ></ImageFooter>
                            )}
                        />
                    </View>
                    :
                    <View style={{ marginTop: 20 }}>
                        <Icon
                            name='slash'
                            type='feather'
                            color='gray'
                            size={100} />
                        <Text h5 style={{ color: 'gray', textAlign: "center" }}>- nu sunt poze încarcate -</Text>
                    </View>
                }
                {onlyView != true ?
                    <Button style={{ width: 300, marginBottom: 20, marginTop: 20, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                        onPress={() => choosePhotoFromLibrary()}
                    >Adaugă o poze</Button>
                    : null}
            </View>
        </ScrollView>
    );
};

export default CarGalleryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
