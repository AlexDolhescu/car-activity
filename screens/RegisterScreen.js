import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, StatusBar, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../navigation/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';


const RegisterScreen = ({ navigation }) => {

    const [data, setData] = React.useState({
        username: '',
        password: '',
        confirmPassword: '',
        check_textInputChange: false,
        secureTextEntry: true,
        secureConfirmTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
        isValidConfirmPassword: true,
    });
    const [showError, setShowError] = useState(false);
    const { register } = useContext(AuthContext);

    useFocusEffect(
        React.useCallback(() => {
            resetData();
            return () => resetData();
        }, [])
    );

    const resetData = () => {
        setData({
            username: '',
            password: '',
            confirmPassword: '',
            check_textInputChange: false,
            secureTextEntry: true,
            secureConfirmTextEntry: true,
            isValidUser: true,
            isValidPassword: true,
            isValidConfirmPassword: true,
        });
        setShowError(false);
    }

    const textInputChange = (val) => {
        if (val.trim().length >= 4) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false,
                isValidUser: false
            });
        }
    }

    const handlePasswordChange = (val) => {
        if (val.trim().length >= 6) {
            setData({
                ...data,
                password: val,
                isValidPassword: true
            });
        } else {
            setData({
                ...data,
                password: val,
                isValidPassword: false
            });
        }
    }

    const handleConfirmPasswordChange = (val) => {
        if (val.trim().length >= 8) {
            setData({
                ...data,
                confirmPassword: val,
                isValidConfirmPassword: true
            });
        } else {
            setData({
                ...data,
                confirmPassword: val,
                isValidConfirmPassword: false
            });
        }
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const updateSecureConfirmTextEntry = () => {
        setData({
            ...data,
            secureConfirmTextEntry: !data.secureConfirmTextEntry
        });
    }

    const tryRegister = () => {
        register(data.username, data.password).then(() => {
            // nothing to do
        })
            .catch(error => {
                setShowError(true);
            })
    }

    const passwordsCheck = () => {
        if (data.password.length > 0) {
            if (data.password.length < 5) {
                return "Parola trebuie să aibă minim 5 caractere"
            }
            if (data.confirmPassword.length < 1) {
                return "Confirmă parola"
            }
            if (data.password != data.confirmPassword) {
                return "Parolele nu conincid"
            }
        }
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='black' barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.text_header}>Crează cont</Text>
            </View>
            <Animatable.View animation="fadeInUpBig" style={styles.footer}>
                <View style={styles.footer}>
                    <Text style={styles.text_footer}>Email</Text>
                    <View style={styles.action}>
                        <FontAwesome name="user-o" color="#05375a" size={20} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#666666"
                            style={styles.textInput}
                            autoCapitalize="none"
                            value={data.username}
                            onChangeText={(val) => textInputChange(val)}
                        />
                        {data.check_textInputChange ?
                            <Animatable.View animation="bounceIn" >
                                <Feather name="check-circle" color="green" size={20} />
                            </Animatable.View>
                            : null}
                    </View>

                    <Text style={[styles.text_footer, { marginTop: 5 }]}>Parolă</Text>
                    <View style={styles.action}>
                        <FontAwesome name="lock" color="#05375a" size={20} />
                        <TextInput
                            placeholder="Parolă"
                            secureTextEntry={data.secureTextEntry ? true : false}
                            placeholderTextColor="#666666"
                            style={styles.textInput}
                            value={data.password}
                            autoCapitalize="none"
                            onChangeText={(val) => handlePasswordChange(val)}
                        />
                        <TouchableOpacity onPress={updateSecureTextEntry} >
                            {data.secureTextEntry ?
                                <Feather name="eye-off" color="grey" size={20} />
                                :
                                <Feather name="eye" color="grey" size={20} />
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.text_footer, { marginTop: 5 }]}>Confirmare parolă</Text>
                    <View style={styles.action}>
                        <FontAwesome name="lock" color="#05375a" size={20} />
                        <TextInput
                            placeholder="Confirmare parolă"
                            secureTextEntry={data.secureConfirmTextEntry ? true : false}
                            placeholderTextColor="#666666"
                            style={styles.textInput}
                            value={data.confirmPassword}
                            autoCapitalize="none"
                            onChangeText={(val) => handleConfirmPasswordChange(val)}
                        />
                        <TouchableOpacity onPress={updateSecureConfirmTextEntry}  >
                            {data.secureConfirmTextEntry ?
                                <Feather name="eye-off" color="grey" size={20} />
                                :
                                <Feather name="eye" color="grey" size={20} />
                            }
                        </TouchableOpacity>
                    </View>
                    {showError ?
                        <View>
                            <Text style={{ color: "red", marginTop: 10, marginBottom: -10 }}>Există deja un cont cu acest email !</Text>
                        </View>
                        : null}
                    <View>
                        <Text style={{ color: "red", marginTop: 10, marginBottom: -10 }}>{passwordsCheck()}</Text>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity onPress={() => tryRegister()}
                            style={[styles.signIn, { borderColor: 'black', borderWidth: 1, backgroundColor: "black" }]} >
                            <Text style={[styles.textSign, { color: 'white', fontSize: 18, letterSpacing: 1.5 }]}>CREAZĂ CONT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('LoginScreen')}
                            style={[styles.signIn, {
                                borderColor: 'black',
                                borderWidth: 1,
                                marginTop: 15
                            }]}
                        >
                            <Text style={[styles.textSign, {
                                color: 'black'
                            }]}>Înapoi la login</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Animatable.View>
        </View>
    );
};


export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 20
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});
