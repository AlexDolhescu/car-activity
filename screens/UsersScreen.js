import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Text, ListItem, Button as ButtonElements } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UsersScreen = ({ navigation }) => {

    const { user, logout } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);


    React.useEffect(() => {
        void async function fetchData() {
            loadUsers();
        }();
    }, []);

    const loadUsers = () => {
        firestore()
            .collection('user')
            .get()
            .then(async (querySnapshot) => {
                let users = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
                setUsers(users);
            })
            .catch((error) => {
                console.log('Something went wrong with find user to firestore.', error);
            });
    }

    const setAdmin = async (user) => {
        firestore().collection('user').doc(user.id)
        .update({ isAdmin: user.data.isAdmin != undefined && user.data.isAdmin != null ? !user.data.isAdmin : true});
        loadUsers();
    };


    const confirmAdmin = (user) => {
        Alert.alert(
            'Confirm',
            'Sunteți sigur că vreți să asignați/deasignați rolul de admin?',
            [
                {
                    text: "Anulează",
                    onPress: () => { },
                    style: "cancel"
                },
                { text: "Confirm", onPress: () => setAdmin(user) }
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


    return (
        <ScrollView>
            <View style={styles.container}>
                <Text style={{opacity:0.5, marginBottom:5}}>apasă lung pentru a asigna/deasigna un user ca admin</Text>
                {users.length > 0 ?
                    <View style={{ flex: 1, width: '100%' }} refresh={refresh}>
                        {
                            users.map((l, i) => (
                                <ListItem key={i} bottomDivider style={{ width: '100%' }}
                                    Component={TouchableScale} // comentez ca nu merge click-ul deocamdata
                                    friction={95} //
                                    tension={100} // These props are passed to the parent component (here TouchableScale)
                                    activeScale={0.95}
                                    onLongPress={() => confirmAdmin(l)}
                                >
                                    <Avatar.Text
                                        label={avatarLabel(l.data)}
                                        color="white"
                                        size={50}
                                        style={{ backgroundColor: "black" }}
                                    />
                                    <ListItem.Content>
                                        <ListItem.Title>{l.data.firstName} {l.data.lastName}</ListItem.Title>
                                        <ListItem.Subtitle>{l.data.email}</ListItem.Subtitle>
                                        {l.data.isAdmin == true ?
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
                            name='cancel'
                            color='gray'
                            size={100} />
                        <Text h5 style={{ color: 'gray', textAlign: "center" }}>- nu sunt există utilizatori -</Text>
                    </View>
                }
            </View>
        </ScrollView>

    );
};

export default UsersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
