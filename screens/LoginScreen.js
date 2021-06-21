import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, StatusBar, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import SocialButton from '../components/SocialButton';
import { AuthContext } from '../navigation/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';


const LoginScreen = ({ navigation }) => {

    const [data, setData] = React.useState({
        username: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
    });
    const [showError, setShowError] = useState(false);
    const { login, googleLogin, fbLogin } = useContext(AuthContext);
    const [isBlockedAccount, setIsBlockedAccount] = useState(false);

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
            check_textInputChange: false,
            secureTextEntry: true,
            isValidUser: true,
            isValidPassword: true,
        });
        setShowError(false);
        setIsBlockedAccount(false);
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

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const tryLogin = () => {
        if (data.username == "") {
            Alert.alert(
                'Atenție',
                'Emailul si parola trebuie să conțină o valoare!',
            );
            return;
        }
        login(data.username, data.password).then(() => {
            // nothing to do
        })
            .catch(error => {
                if (error.code == "auth/user-disabled") {
                    setIsBlockedAccount(true);
                    return;
                }
                setShowError(true);
            })
    }

    const tryFbLogin = () => {
        fbLogin().then(() => {
            // nothing to do
        })
            .catch(error => {
                if (error.code == "auth/user-disabled") {
                    setIsBlockedAccount(true);
                    return;
                }
                setShowError(true);
            })
    }

    const tryGoogleLogin = () => {
        googleLogin().then(() => {
            // nothing to do
        })
            .catch(error => {
                if (error.code == "auth/user-disabled") {
                    setIsBlockedAccount(true);
                    return;
                }
                setShowError(true);
            })
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='black' barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.text_header}>CarActivity</Text>
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
                            value={data.username}
                            autoCapitalize="none"
                            onChangeText={(val) => textInputChange(val)}
                        />
                        {data.check_textInputChange ?
                            <Animatable.View animation="bounceIn">
                                <Feather name="check-circle" color="green" size={20} />
                            </Animatable.View>
                            : null}
                    </View>

                    <Text style={[styles.text_footer, { marginTop: 20 }]}>Parolă</Text>
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
                    {showError ?
                        <View>
                            <Text style={{ color: "red", marginTop: 10, marginBottom: -10 }}>Email incorect sau parolă invalidă !</Text>
                        </View>
                        : null}
                    {isBlockedAccount ?
                        <View>
                            <Text style={{ color: "red", marginTop: 10, marginBottom: -10 }}>Contul este blocat !</Text>
                        </View>
                        : null}
                    <View style={styles.button}>
                        <TouchableOpacity onPress={() => tryLogin()}
                            style={[styles.signIn, { borderColor: 'black', borderWidth: 1, backgroundColor: "black" }]} >
                            <Text style={[styles.textSign, { color: 'white', fontSize: 18, letterSpacing: 1.5 }]}>AUTENTIFICARE</Text>
                        </TouchableOpacity>
                        <SocialButton
                            buttonTitle="Logare cu Facebook"
                            btnType="facebook"
                            color="#4867aa"
                            backgroundColor="#e6eaf4"
                            onPress={() => tryFbLogin()}
                        />
                        <SocialButton
                            buttonTitle="Încearcă cu Google"
                            btnType="google"
                            color="#de4d41"
                            backgroundColor="#f5e7ea"
                            onPress={() => { tryGoogleLogin() }}
                        />
                        <TouchableOpacity
                            onPress={() => navigation.navigate('RegisterScreen')}
                            style={[styles.signIn, {
                                borderColor: 'black',
                                borderWidth: 1,
                                marginTop: 15
                            }]}>
                            <Text style={[styles.textSign, { color: 'black' }]}>CREAZĂ CONT</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Animatable.View>
        </View>
    );
};


export default LoginScreen;

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
