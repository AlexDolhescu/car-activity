import React, { useState } from 'react';
import { View, Alert, Text, StyleSheet, TouchableOpacity, TextInput as TextInputRN, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from "react-native-modal-datetime-picker";
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Moment from 'moment';

const ManagePetrolScreen = ({ route, navigation }) => {

    const { petrolId, carId } = route.params;
    const [petrol, setPetrol] = useState({
        date: new Date()
    });
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    React.useEffect(() => {
        void async function fetchData() {
            if (petrolId != undefined) {
                loadPetrol(petrolId);
            }
        }();
    }, []);

    const loadPetrol = (petrolId) => {
        firestore()
            .collection('petrol')
            .doc(petrolId)
            .get()
            .then(async (petrol) => {
                setPetrol(petrol.data());
            })
            .catch((error) => {
                console.log('Something went wrong with find car to firestore.', error);
            });
    }

    const savePetrol = () => {
        if (petrol.station == null || petrol.cost == null || petrol.date == null) {
            Alert.alert(
                'Atenție',
                'Există câmpuri necompletate!',
            );
            return;
        }
        if (petrolId != undefined) {
            updatePetrol();
            return;
        }
        firestore()
            .collection('petrol')
            .add({
                carId: carId,
                station: petrol.station,
                date: petrol.date,
                cost: petrol.cost,
                description: petrol.description,
                createdDate: petrol.createdDate,
                postTime: firestore.Timestamp.fromDate(new Date())
            })
            .then(async (petrolSaved) => {
                Alert.alert(
                    'Succes',
                    'Alimentarea a fost salvată cu succes!',
                );
                navigation.navigate("PetrolScreen")
            })
            .catch((error) => {
                console.log('Something went wrong with added petrol to firestore.', error);
            });
    };

    const updatePetrol = () => {
        firestore()
            .collection('petrol')
            .doc(petrolId)
            .update({
                station: petrol.station,
                date: petrol.date,
                cost: petrol.cost,
                description: petrol.description,
                createdDate: petrol.createdDate,
                postTime: firestore.Timestamp.fromDate(new Date())
            })
            .then(async () => {
                Alert.alert(
                    'Succes',
                    'Alimentarea a fost salvată cu succes!',
                );
                navigation.navigate("PetrolScreen");
            })
            .catch((error) => {
                console.log('Something went wrong with update petrol to firestore.', error);
            });
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDatePicked = (date) => {
        { setPetrol({ ...petrol, date: date }) }
        hideDatePicker();
    };

    const formatDate = (date) => {
        if (date == null) {
            return;
        }
        return Moment(date).format("DD/MM/YYYY");
    }

    return (
        <View>
            <View style={{alignItems:"center"}}>
            <Icon size={80} name='gas-station-outline' color="black" style={{ marginTop: 20, marginRight: 5, opacity: 0.5 }} />
            </View>
            <ScrollView>
                <View style={styles.container}>
                    <View style={{
                        backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                        flexDirection: "row", alignItems: "center", alignContent: "flex-start"
                    }}>
                        <Text style={{ fontWeight: "bold" }}>*Benzinărie </Text>
                        <TextInputRN
                            onChangeText={station => setPetrol({ ...petrol, station: station })}
                            placeholder="OMV"
                            value={petrol.station}
                            style={{color:"black"}}
                        />
                    </View>
                    <TouchableOpacity onPress={showDatePicker}>
                        <View style={{
                            backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, borderRadius: 20,
                            flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 20
                        }}>
                            <Text style={{ fontWeight: "bold", marginRight: 10 }} onPress={showDatePicker}>*Data</Text>
                            <Text style={{ paddingTop: 15, paddingBottom: 15 }} onPress={showDatePicker}>{formatDate(petrol.date)}</Text>
                        </View>
                    </TouchableOpacity>
                    <DateTimePicker
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleDatePicked}
                        onCancel={hideDatePicker}
                    />
                    <View style={{
                        backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                        flexDirection: "row", alignItems: "center", alignContent: "flex-start"
                    }}>
                        <Text style={{ fontWeight: "bold" }}>*Cost </Text>
                        <TextInputRN
                            onChangeText={cost => setPetrol({ ...petrol, cost: cost })}
                            keyboardType="numeric"
                            placeholder="200 lei"
                            value={petrol.cost}
                            style={{color:"black"}}
                        />
                    </View>
                    <View style={{
                        backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                        flexDirection: "row", alignItems: "center", alignContent: "flex-start"
                    }}>
                        <Text style={{ fontWeight: "bold" }}>Descriere </Text>
                        <TextInputRN
                            onChangeText={description => setPetrol({ ...petrol, description: description })}
                            placeholder="alte detalii"
                            value={petrol.description}
                            style={{color:"black"}}
                        />
                    </View>
                    <Button style={{ width: 300, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                        onPress={() => savePetrol()}
                    >Salvează</Button>
                </View >
            </ScrollView>
        </View>
    );
};

export default ManagePetrolScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
