import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox, Avatar } from 'react-native-paper';
import { Card, Text, ListItem, Button as ButtonElements } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { windowWidth, windowHeight } from "../utils/Dimensions";
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';

const AdminSupportScreen = ({ navigation }) => {

    const { user, logout } = useContext(AuthContext);
    const [sesisations, setSesisations] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const sheetRef = React.useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);

    React.useEffect(() => {
        void async function fetchData() {
            loadSesisations();
        }();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            sheetRef.current.snapTo(2);
            setSelectedItem(null);
            loadSesisations();
            return () => loadSesisations();
        }, [])
    );


    const loadSesisations = () => {
        firestore()
            .collection('sesisation')
            .get()
            .then(async (querySnapshot) => {
                let sesisations = querySnapshot.docs.map(doc => { return { data: doc.data(), id: doc.id } })
                setSesisations(sesisations);
            })
            .catch((error) => {
                console.log('Something went wrong with find sesisation to firestore.', error);
            });
    }

    const avatarLabel = (user) => {
        return user.firstName != undefined ?
            user.lastName != undefined ?
                user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
                : user.firstName.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase()
    }

    const getDeviceInfo = () => {
        let response = '';
        response += ' Nume aplicație: ' + selectedItem.data.deviceInfo.applicationName;
        response += ' | Număr build: ' + selectedItem.data.deviceInfo.buildNumber;
        response += ' | Număr device: ' + selectedItem.data.deviceInfo.deviceId;
        response += ' | Tip device: ' + selectedItem.data.deviceInfo.deviceType;
        response += ' | Număr sistem: ' + selectedItem.data.deviceInfo.systemName;
        response += ' | Versiune sistem: ' + selectedItem.data.deviceInfo.systemVersion;
        response += ' | Id unic: ' + selectedItem.data.deviceInfo.uniqueId;
        response += ' | Versiune: ' + selectedItem.data.deviceInfo.version;
        return response
    }

    const renderContent = () => (
        <View
            style={{
                backgroundColor: 'white',
                padding: 16,
                height: 450,
            }}
        >
            {selectedItem != null ?
                <View>
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{selectedItem.data.title}</Text>
                        <Text style={{}}>{selectedItem.data.userInfo._data.email}</Text>
                        {selectedItem.data.image != undefined ?
                            <Image source={{ uri: selectedItem.data.image }} style={{ height: 120, width: 120, marginTop: 10 }} />
                            : null}
                    </View>
                    <Text style={{marginTop:10,}}>{selectedItem.data.description}</Text>
                    <Text style={{marginTop:10, opacity:0.5}}>{getDeviceInfo()}</Text>
                </View>
                : null}
        </View>
    );

    const itemPressed = (item) => {
        setSelectedItem(item);
        sheetRef.current.snapTo(0)
    }

    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
        }}>
            <ScrollView style={{ width: '100%' }}>
                <View style={styles.container}>
                    {sesisations.length > 0 ?
                        <View style={{ flex: 1, width: '100%' }} refresh={refresh}>
                            {
                                sesisations.map((l, i) => (
                                    <ListItem key={i} bottomDivider style={{ width: '100%' }}
                                        Component={TouchableScale} // comentez ca nu merge click-ul deocamdata
                                        friction={95} //
                                        tension={100} // These props are passed to the parent component (here TouchableScale)
                                        activeScale={0.95}
                                        onPress={() => itemPressed(l)}
                                    >
                                        <Avatar.Text
                                            label={avatarLabel(l.data.userInfo._data)}
                                            color="white"
                                            size={50}
                                            style={{ backgroundColor: "black" }}
                                        />
                                        <ListItem.Content>
                                            <ListItem.Title>{l.data.title}</ListItem.Title>
                                            <ListItem.Subtitle>{l.data.description}</ListItem.Subtitle>
                                            <Text style={{ fontWeight: "bold" }}>{l.data.userInfo._data.email}</Text>
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
            <BottomSheet
                ref={sheetRef}
                snapPoints={[450, 0, 0]}
                borderRadius={25}
                initialSnap={2}
                renderContent={renderContent}
            />
        </View>
    );
};

export default AdminSupportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
});
