import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Text, ListItem, Button as ButtonElements } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CarUsersScreen = ({ route, navigation }) => {

    const { carId } = route.params;
    const { user, logout } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [administratorEmail, setAdministratorEmail] = useState(null);
    const [addUserEmail, setAddUserEmail] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedPersonEmail, setSelectedPersonEmail] = useState(null);
    const [addPersonButton, setAddPersonButton] = useState(false);
    const [carUsers, setCarUsers] = useState([]);


    React.useEffect(() => {
        void async function fetchData() {
            loadUsers();
        }();
    }, []);

    const loadUsers = () => {
        firestore()
            .collection('carUser')
            .where("carId", "==", carId)
            .get()
            .then(async (querySnapshot) => {
                let chartData = querySnapshot.docs.map(doc => doc.data())
                let users = [];
                let carUsers = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
                setCarUsers(carUsers);
                for (const doc of chartData) {
                    let getUser = await getUserById(doc.userId);
                    if (doc.isAdmin) {
                        setAdministratorEmail(getUser.data().email);
                        if (getUser.id == user.uid) {
                            setIsAdmin(true);
                        }
                    }
                    users.push(getUser.data());
                };
                setUsers(users);
                setRefresh(!refresh)
            })
            .catch((error) => {
                console.log('Something went wrong with find carUser to firestore.', error);
            });
    }

    const getUserByEmail = (email) => {
        return new Promise((resolve, reject) => {
            firestore()
                .collection('user')
                .where("email", "==", email)
                .get()
                .then((querySnapshot) => {
                    let chartData = querySnapshot.docs.map(doc => doc)
                    for (const doc of chartData) {
                        resolve(doc);
                    };
                    resolve();
                })
                .catch((error) => {
                    console.log('Something went wrong with find user to firestore.', error);
                });
        });
    };

    const getUserById = (userId) => {
        return new Promise((resolve, reject) => {
            firestore()
                .collection('user')
                .doc(userId)
                .get()
                .then((user) => {
                    resolve(user);
                })
                .catch((error) => {
                    console.log('Something went wrong with find user to firestore.', error);
                });
        });
    };

    const deletetCarUserById = (carUserId) => {
        return new Promise((resolve, reject) => {
            firestore()
                .collection('carUser')
                .doc(carUserId)
                .delete()
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    console.log('Something went wrong to delete user to firestore.', error);
                });
        });
    };


    const onSelect = (images, index) => {
        setImageIndex(index);
        setImageViewerVisible(true);
    };

    const addUser = async () => {
        if (addUserEmail == "") {
            Alert.alert(
                'Atenție',
                'Emailul nu este valid!',
            );
            return;
        }
        let searchUser = await getUserByEmail(addUserEmail);
        if (searchUser.id == undefined) {
            Alert.alert(
                'Atenție',
                'Nu există utilizatorul cu acest email!',
            );
            return;
        }
        for (let existingUser of users) {
            if (existingUser.email == addUserEmail) {
                Alert.alert(
                    'Atenție',
                    'Utilizatorul exita deja!',
                );
                return;
            }
        }
        firestore()
            .collection('carUser')
            .add({
                carId: carId,
                userId: searchUser.id,
            })
            .then((carUserSaved) => {
                let existingUsers = [...users];
                existingUsers.push(searchUser.data());
                setUsers(existingUsers);
                setAddUserEmail("");
                setAddPersonButton(!addPersonButton);
                setRefresh(!refresh);
                Alert.alert(
                    'Succes',
                    'Utilizatorul a fost adaugat cu succes !',
                );
            })
            .catch((error) => {
                console.log('Something went wrong with added carUser to firestore.', error);
            });
    };

    const deleteUser = async () => {
        let userEmail = selectedPersonEmail;
        let existingUsers = [...users];
        existingUsers = existingUsers.filter(user => user.email != userEmail)
        let user = await getUserByEmail(userEmail);
        let carUserToDelete = carUsers.filter(carUser => carUser.data.userId == user.id)
        await deletetCarUserById(carUserToDelete[0].id);
        setUsers(existingUsers);
        setRefresh(!refresh);
    };

    const setAdmin = async () => {
        let userEmail = selectedPersonEmail;
        let existingUsers = await getUserByEmail(userEmail);
        let newCarUserModify = carUsers.filter(carUser => carUser.data.userId == existingUsers.id)
        let existingCarUserModify = carUsers.filter(carUser => carUser.data.userId == user.uid)
        firestore().collection('carUser').doc(newCarUserModify[0].id).update({ isAdmin: true });
        firestore().collection('carUser').doc(existingCarUserModify[0].id).update({ isAdmin: false });
        setSelectedPersonEmail(null);
        setAdministratorEmail(userEmail);
        setRefresh(!refresh);
    };

    const confirmDelete = () => {
        Alert.alert(
            'Confirm',
            'Sunteți sigur că vreți să ștergeți utilizatorul cu emailul ' + selectedPersonEmail + ' ?',
            [
                {
                    text: "Anulează",
                    onPress: () => { },
                    style: "cancel"
                },
                { text: "Șterge", onPress: () => deleteUser() }
            ]
        );
    }

    const confirmAdmin = () => {
        Alert.alert(
            'ATENȚIE',
            'Sunteți sigur că vreți vă pierdeți dreptul de admistrator schimbându-l cu ' + selectedPersonEmail + ' ?',
            [
                {
                    text: "Anulează",
                    onPress: () => { },
                    style: "cancel"
                },
                { text: "Confirm", onPress: () => setAdmin() }
            ]
        );
    }



    const avatarLabel = (user) => {
        return user.firstName != undefined ?
            user.lastName != undefined ?
                user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
                : user.firstName.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase()
    }

    const isPersonSelected = () => {
        return selectedPersonEmail != null;
    }

    const personButtonsColor = () => {
        if (isPersonSelected() == true) {
            return "black";
        }
        return "gray";
    }

    const addButtonPressed = () => {
        setAddPersonButton(!addPersonButton);
    }

    const selectPerson = (l) => {
        if (l.email == selectedPersonEmail) {
            setSelectedPersonEmail(null);
            return;
        }
        setSelectedPersonEmail(l.email);
    }

    const getOpacity = (l) => {
        if (l.email == selectedPersonEmail) {
            return 0.7;
        }
        return null;
    }


    return (
        <ScrollView>
            <View style={styles.container}>
                {users.length > 0 ?
                    <View style={{ flex: 1, width: '100%' }} refresh={refresh}>
                        {isAdmin == true ?
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginRight: 10, marginBottom: 10 }}>
                                <TouchableOpacity onPress={() => addButtonPressed()}>
                                    <Icon size={25} name='plus' color="black" style={{ marginRight: 5 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => confirmAdmin()} disabled={!isPersonSelected()}>
                                    <Icon size={25} name='account-star' color={personButtonsColor()} style={{ marginRight: 5 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => confirmDelete()} disabled={!isPersonSelected()}>
                                    <Icon size={25} name='delete' color={personButtonsColor()} />
                                </TouchableOpacity>
                            </View>
                            : null}
                        {
                            users.map((l, i) => (
                                <ListItem key={i} bottomDivider style={{ width: '100%', opacity: getOpacity(l) }}
                                    Component={TouchableScale} // comentez ca nu merge click-ul deocamdata
                                    friction={95} //
                                    tension={100} // These props are passed to the parent component (here TouchableScale)
                                    activeScale={0.95}
                                    onPress={() => selectPerson(l)}
                                >
                                    <Avatar.Text
                                        label={avatarLabel(l)}
                                        color="white"
                                        size={50}
                                        style={{ backgroundColor: "black" }}
                                    />
                                    <ListItem.Content>
                                        <ListItem.Title>{l.firstName} {l.lastName}</ListItem.Title>
                                        <ListItem.Subtitle>{l.email}</ListItem.Subtitle>
                                        {administratorEmail == l.email ?
                                            <Text style={{ alignSelf: 'flex-end', fontWeight: "bold" }}>ADMIN</Text>
                                            : null}
                                    </ListItem.Content>
                                    <ListItem.Chevron size={30} />
                                </ListItem>
                            ))
                        }
                    </View>
                    :
                    <View style={{ marginTop: 20 }}>
                        <Icon
                            name='slash'
                            type='feather'
                            color='gray'
                            size={100} />
                        <Text h5 style={{ color: 'gray', textAlign: "center" }}>- nu sunt există utilizatori -</Text>
                    </View>
                }
                {addPersonButton == true ?
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <TextInput
                            label="Email"
                            value={addUserEmail}
                            mode="outlined"
                            multiline
                            onChangeText={email => { setAddUserEmail(email) }}
                            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
                            style={{ width: windowWidth * 90 / 100, marginTop: 10 }}
                        />
                        <Button style={{ width: windowWidth * 85 / 100, marginBottom: 20, marginTop: 30, marginRight: '2%', borderRadius: 50 }} mode="contained" color="black"
                            onPress={addUser}
                        >Adaugă o utilizator</Button>
                    </View>
                    : null}
            </View>
        </ScrollView>

    );
};

export default CarUsersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
