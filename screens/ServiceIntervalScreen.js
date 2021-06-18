import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Icon, Text, ListItem } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import ActionButton from 'react-native-action-button';

const ServiceIntervalScreen = ({ route, navigation }) => {

    const { carId } = route.params;
    const { user, logout } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);
    const [car, setCar] = useState({});


    React.useEffect(() => {
        void async function fetchData() {
            loadCar();
        }();
    }, []);

    const loadCar = async () => {
        let car = await getCarById(carId)
        setCar(car.data());
        setRefresh(!refresh);
    }

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

    const confirmModal = () => {
        Alert.alert(
            'Confirm',
            'Sunteți sigur că vreți să resetați perioada service?',
            [
                {
                    text: "Anulează",
                    onPress: () => { },
                    style: "cancel"
                },
                { text: "Confirm", onPress: () => resetServiceInterval() }
            ]
        );
    }

    const resetServiceInterval = async () => {
        await firestore().collection('car').doc(carId).update(
            {
                daysToService: car.daysIntervalService,
                kmToService: car.kmIntervalService,
                daysIntervalService: car.daysIntervalService,
                kmIntervalService: car.kmIntervalService
            }
        );
        await loadCar();
    }

    return (
        <ScrollView>
            <View style={styles.container} refresh={refresh}>
                <Text h4>PERIOADĂ SERVICE</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginTop: 20 }}>
                    <View style={{ width: '40%', alignContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 24, fontWeight: "500" }}>{car.kmToService}</Text>
                        <Text style={{ fontSize: 16 }}>km</Text>
                    </View>
                    <View style={{ width: '40%', alignContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 24, fontWeight: "500" }}>{car.daysToService}</Text>
                        <Text style={{ fontSize: 16 }}>zile</Text>
                    </View>
                </View>
                <TextInput
                    label="Interval km service"
                    value={car.kmIntervalService}
                    mode="outlined"
                    multiline
                    keyboardType="numeric"
                    onChangeText={km => { setCar({ ...car, kmIntervalService: km }) }}
                    theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
                    style={{ width: '60%', marginTop: 10 }}
                />
                <TextInput
                    label="Interval zile service"
                    value={car.daysIntervalService}
                    mode="outlined"
                    multiline
                    keyboardType="numeric"
                    onChangeText={days => { setCar({ ...car, daysIntervalService: days }) }}
                    theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
                    style={{ width: '60%', marginTop: 10 }}
                />
                <Button style={{ width: 300, marginBottom: 20, marginTop: 20, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                    onPress={confirmModal}
                >Resetează perioadă service</Button>

            </View>
        </ScrollView>

    );
};

export default ServiceIntervalScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
