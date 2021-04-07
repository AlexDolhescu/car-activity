import React, {userContext, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import SocialButton from '../components/SocialButton';
import { AuthContext } from '../navigation/AuthProvider';
import FormButton from '../components/FormButton';


const SignInScreen = ({navigation}) => {

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

const {register} = userContext(AuthContext);

const textInputChange = (val) => {
    if( val.trim().length >= 4 ) {
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
    if( val.trim().length >= 8 ) {
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
    if( val.trim().length >= 8 ) {
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

    return (
      <View style={styles.container}>
       <StatusBar backgroundColor='#009387' barStyle="light-content"/>
        <View style={styles.header}>
            <Text style={styles.text_header}>Register</Text>
        </View>
        <Animatable.View
       animation="fadeInUpBig"
       style={styles.footer}
   >
        <View style={styles.footer}>
            <Text style={styles.text_footer}>Email</Text>
            <View style={styles.action}>
               <FontAwesome
                   name="user-o"
                   color="#05375a"
                   size={20}
               />
               <TextInput
                   placeholder="Username"
                   placeholderTextColor="#666666"
                   style={styles.textInput}
                   autoCapitalize="none"
                   onChangeText={(val) => textInputChange(val)}
               />
              {data.check_textInputChange ?
                <Animatable.View
                   animation="bounceIn"
               >
               <Feather
                       name="check-circle"
                       color="green"
                       size={20}
                   />
                     </Animatable.View>
              : null}
            </View>

            <Text style={[styles.text_footer, {
              marginTop: 5
            }]}>Password</Text>
            <View style={styles.action}>
               <FontAwesome
                   name="lock"
                   color="#05375a"
                   size={20}
               />
               <TextInput
                   placeholder="Password"
                  secureTextEntry={data.secureTextEntry ? true : false}
                   placeholderTextColor="#666666"
                   style={styles.textInput}
                   autoCapitalize="none"
                   onChangeText={(val) => handlePasswordChange(val)}
               />
               <TouchableOpacity
                  onPress={updateSecureTextEntry}
              >
                  {data.secureTextEntry ?
                  <Feather
                      name="eye-off"
                      color="grey"
                      size={20}
                  />
                  :
                  <Feather
                      name="eye"
                      color="grey"
                      size={20}
                  />
                  }
              </TouchableOpacity>
            </View>

            <Text style={[styles.text_footer, {
              marginTop: 5
            }]}>Confirm Password</Text>
            <View style={styles.action}>
               <FontAwesome
                   name="lock"
                   color="#05375a"
                   size={20}
               />
               <TextInput
                   placeholder="Confirm Password"
                   secureTextEntry={data.secureConfirmTextEntry ? true : false}
                   placeholderTextColor="#666666"
                   style={styles.textInput}
                   autoCapitalize="none"
                   onChangeText={(val) => handleConfirmPasswordChange(val)}
               />
               <TouchableOpacity
                  onPress={updateSecureConfirmTextEntry}
              >
                  {data.secureConfirmTextEntry ?
                  <Feather
                      name="eye-off"
                      color="grey"
                      size={20}
                  />
                  :
                  <Feather
                      name="eye"
                      color="grey"
                      size={20}
                  />
                  }
              </TouchableOpacity>
            </View>

              <View style={styles.button}>

                  <FormButton
                      buttonTitle="Sign Up"
                      onPress={() => register(email, password)}
                    />
                            <SocialButton
                            buttonTitle="Sign Up with Facebook"
                            btnType="facebook"
                            color="#4867aa"
                            backgroundColor="#e6eaf4"
                            onPress={() => {}}
                            />

                            <SocialButton
                            buttonTitle="Sign Up with Google"
                            btnType="google"
                            color="#de4d41"
                            backgroundColor="#f5e7ea"
                            onPress={() => {}}
                            />

                            <TouchableOpacity
                                onPress={() => navigation.navigate('SignInScreen')}
                                style={[styles.signIn, {
                                    borderColor: '#009387',
                                    borderWidth: 1,
                                    marginTop: 15
                                }]}
                            >
                                <Text style={[styles.textSign, {
                                    color: '#009387'
                                }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

        </View>
       </Animatable.View>
      </View>
      );
};


export default SignInScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#009387'
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
        paddingVertical: 30
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
