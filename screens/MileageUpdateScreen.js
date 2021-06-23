import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput} from 'react-native';
import { Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Text, ListItem } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MileageUpdateScreen = ({ route, navigation }) => {

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
            'Confirmare actualizare kilometraj',
            [
                {
                    text: "Anulează",
                    onPress: () => { },
                    style: "cancel"
                },
                { text: "Confirm", onPress: () => updateCarKm() }
            ]
        );
    }

    const updateCarKm = async () => {
        await firestore().collection('car').doc(carId).update(
            {
                km: car.km,
            }
        );
        await loadCar();
    }

    return (
        <ScrollView>
            <View style={styles.container} refresh={refresh}>
            <Icon size={120} name='car-cog' color="gray" style={{ }} />
                <TextInput
                    label="Kilometraj"
                    value={car.km}
                    onChangeText={km => { setCar({ ...car, km: km }) }}
                    keyboardType="numeric"
                    maxLength={6}
                    autoCapitalize="characters"
                    style={{ width: '60%', marginTop: 10, textAlign:"center", fontSize: 24, fontWeight: "500", color:"black" }}
                />
                <Button style={{ width: 300, marginBottom: 20, marginTop: 20, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                    onPress={confirmModal}
                >Actualizează</Button>

            </View>
        </ScrollView>

    );
};

export default MileageUpdateScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
