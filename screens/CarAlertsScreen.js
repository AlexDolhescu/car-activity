import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Icon, Text, ListItem } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import DateTimePicker from "react-native-modal-datetime-picker";
import Moment from 'moment';


const CarAlertsScreen = ({ route, navigation }) => {

    const { carId } = route.params;
    const { user, logout } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);
    const [car, setCar] = useState({});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [modifyId, setModifyId] = useState(null);

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

    const saveCar = async () => {
        await firestore().collection('car').doc(carId).update(
            {
                rcaAlertDate: car.rcaAlertDate,
                itpAlertDate: car.itpAlertDate,
                rovinietaAlertDate: car.rovinietaAlertDate
            }
        );
        Alert.alert(
            'Succes',
            'Datele au fost încărcate cu succes !',
          );
        await loadCar();
    }

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDatePicked = (date) => {
        if (modifyId == 1) {
            setCar({ ...car, rcaAlertDate: Moment(date).toString() })
        }
        if (modifyId == 2) {
            setCar({ ...car, itpAlertDate: Moment(date).toString() })
        }
        if (modifyId == 3) {
            setCar({ ...car, rovinietaAlertDate: Moment(date).toString() })
        }
        setDatePickerVisibility(false);
        setRefresh(!refresh);
    };

    const modifyDate = (id) => {
        setModifyId(id);
        setDatePickerVisibility(true);
    }

    const getStatusColor = (date) => {
        if (date == null) {
            return "black";
        }
        if (Moment(date).isAfter(Moment()) == true) {
            return "green";
        }
        return "red";
    }

    const formatDate = (date) => {
        return Moment(date).format("DD/MM/YYYY");
    }

    return (
        <ScrollView>
            <View style={styles.container} refresh={refresh}>
                <TouchableOpacity onPress={() => modifyDate(1)}>
                    <View style={{ backgroundColor: "white", width: windowWidth * 85 / 100, padding: 15, marginTop: 20, borderRadius: 20 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <View style={{ borderRadius: 44, width: 15, height: 15, backgroundColor: getStatusColor(car.rcaAlertDate), marginRight: 5 }} />
                                <Text style={{}} h4>RCA</Text>
                            </View>
                            <Text style={{ marginRight: 20, opacity: 0.5 }} >{car.rcaAlertDate != undefined ? formatDate(car.rcaAlertDate) : "adaugă dată"}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => modifyDate(2)}>
                    <View style={{ backgroundColor: "white", width: windowWidth * 85 / 100, padding: 15, marginTop: 20, borderRadius: 20 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <View style={{ borderRadius: 44, width: 15, height: 15, backgroundColor: getStatusColor(car.itpAlertDate), marginRight: 5 }} />
                                <Text style={{}} h4>ITP</Text>
                            </View>
                            <Text style={{ marginRight: 20, opacity: 0.5 }} >{car.itpAlertDate != undefined ? formatDate(car.itpAlertDate) : "adaugă dată"}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => modifyDate(3)}>
                    <View style={{ backgroundColor: "white", width: windowWidth * 85 / 100, padding: 15, marginTop: 20, borderRadius: 20 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <View style={{ borderRadius: 44, width: 15, height: 15, backgroundColor: getStatusColor(car.rovinietaAlertDate), marginRight: 5 }} />
                                <Text style={{}} h4>ROVINIETĂ</Text>
                            </View>
                            <Text style={{ marginRight: 20, opacity: 0.5 }} >{car.rovinietaAlertDate != undefined ? formatDate(car.rovinietaAlertDate) : "adaugă dată"}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <DateTimePicker
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleDatePicked}
                    onCancel={hideDatePicker}
                />

                <Button style={{ width: windowWidth * 85 / 100, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                    onPress={saveCar}
                >Salvează</Button>
            </View>
        </ScrollView>

    );
};

export default CarAlertsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
