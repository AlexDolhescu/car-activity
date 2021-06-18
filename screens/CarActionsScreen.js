import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { Card, Icon, Text} from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { windowWidth, windowHeight } from "../utils/Dimensions";

const CarActionsScreen = ({ route, navigation }) => {

    const { carId } = route.params;

    const [brandName, setBrandName] = useState(null);
    const [description, setDescriprion] = useState(null);
    const [image, setImage] = useState(null);

    const choosePhotoFromLibrary = () => {
        // TODO limiteaza pozele la un numar maxim de x (10 de ex)
        ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
        }).then((image) => {
            const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
            setImage(imageUri);
        });
    };


    return (
        <ScrollView>
            <View style={styles.container, {marginBottom:20}}>
            <Card>
                    <TouchableOpacity onPress={() => navigation.navigate("ManageCarScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='edit'
                                type='Ionicons'
                                color='black'/>
                        </View>
                        <Text style={{  fontSize: 20,}}>Editează mașina</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
                <Card>
                    <TouchableOpacity onPress={() => navigation.navigate("MileageUpdateScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='settings'
                                type='Ionicons'
                                color='black'/>
                        </View>
                        <Text style={{  fontSize: 20,}}>Actualizează kilometraj</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
                <Card>
                <TouchableOpacity onPress={() => navigation.navigate("CarGalleryScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='photo'
                                type='Ionicons'
                                color='black' />
                        </View>
                        <Text  style={{  fontSize: 20,}}>Vizualizează galerie</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
                <Card>
                <TouchableOpacity onPress={() => navigation.navigate("CarUsersScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='person'
                                type='Ionicons'
                                color='black' />
                        </View>
                        <Text  style={{  fontSize: 20,}}>Gestionare utilizatori</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
                <Card>
                <TouchableOpacity onPress={() => navigation.navigate("ServiceIntervalScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='build'
                                type='Ionicons'
                                color='black' />
                        </View>
                        <Text  style={{  fontSize: 20,}}>Resetare perioadă service</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
                <Card>
                <TouchableOpacity onPress={() => navigation.navigate("CarAlertsScreen", {carId: carId})} >
                    <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", width: windowWidth * 85 / 100 }}>
                        <View style={{
                            height: 55, width: 55, alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}>
                            <Icon
                                size={35}
                                name='notifications'
                                type='Ionicons'
                                color='black'/>
                        </View>
                        <Text  style={{  fontSize: 20,}}>Gestionează alerte</Text>
                    </View>
                    </TouchableOpacity>
                </Card>
            </View>
        </ScrollView>
    );
};

export default CarActionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
