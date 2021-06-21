import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Text } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/Fontisto';


const EditProfileScreen = ({ navigation }) => {

    const { user, logout } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);
    const [userProfile, setUserProfile] = useState({});

    React.useEffect(() => {
        void async function fetchData() {
            loadUser();
        }();
    }, []);

    const loadUser = async () => {
        firestore()
            .collection('user')
            .doc(user.uid)
            .get()
            .then((user) => {
                setUserProfile(user.data());
            })
            .catch((error) => {
                console.log('Something went wrong with find user to firestore.', error);
            });
    }

    const saveUser = async () => {
        await firestore().collection('user').doc(user.uid).update(
            {
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
            }
        );
        Alert.alert(
            'Succes',
            'Datele au fost încărcate cu succes !',
        );
        navigation.goBack();
    }

    return (
        <ScrollView>
            <View style={styles.container} refresh={refresh}>
                <View style={{ alignItems: "center" }}>
                    <Icon size={80} name='user-secret' color="black" style={{ marginTop: 20, marginRight: 5 }} />
                </View>
                <View style={{
                    backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                    flexDirection: "row", alignItems: "center", alignContent: "flex-start"
                }}>
                    <Text style={{ fontWeight: "bold" }}>Prenume </Text>
                    <TextInput
                        onChangeText={firstName => setUserProfile({ ...userProfile, firstName: firstName })}
                        placeholder="Alex"
                        value={userProfile.firstName}
                    />
                </View>

                <View style={{
                    backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                    flexDirection: "row", alignItems: "center", alignContent: "flex-start"
                }}>
                    <Text style={{ fontWeight: "bold" }}>Nume </Text>
                    <TextInput
                        onChangeText={lastName => setUserProfile({ ...userProfile, lastName: lastName })}
                        placeholder="Dolhescu"
                        value={userProfile.lastName}
                    />
                </View>


                <View style={{
                    backgroundColor: "white", width: windowWidth * 85 / 100, paddingLeft: 15, paddingRight: 10, marginTop: 20, borderRadius: 20,
                    flexDirection: "row", alignItems: "center", alignContent: "flex-start", opacity: 0.6
                }}>
                    <Text style={{ fontWeight: "bold", marginRight: 5 }}>Email </Text>
                    <Text style={{ paddingTop: 15, paddingBottom: 15 }}>{userProfile.email}</Text>
                </View>

                <Button style={{ width: windowWidth * 85 / 100, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                    onPress={saveUser}
                >Salvează</Button>
            </View>
        </ScrollView>

    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
