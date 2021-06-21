import React, { createContext, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);


  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: '394717269839-pc9mblfl39s3hr01bk8vlt9n4fjh1n8j.apps.googleusercontent.com',
    });
    // GoogleSignin.configure();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (email, password) => {
          return new Promise(async (resolve, reject) => {
            try {
              await auth().signInWithEmailAndPassword(email, password)
              resolve();
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });
        },
        googleLogin: async () => {
          return new Promise(async (resolve, reject) => {
            try {
              // Get the users ID token
              const { idToken } = await GoogleSignin.signIn();

              // Create a Google credential with the token
              const googleCredential = auth.GoogleAuthProvider.credential(idToken);

              // Sign-in the user with the credential
              await auth().signInWithCredential(googleCredential).then(() => {
                // veryfy if user exists
                firestore()
                  .collection('user')
                  .where("email", "==", auth().currentUser.email)
                  .get()
                  .then((querySnapshot) => {
                    let chartData = querySnapshot.docs.map(doc => doc)
                    if (chartData.length > 0) {
                      resolve();
                      return;
                    }
                    //create user
                    firestore().collection('user').doc(auth().currentUser.uid)
                      .set({
                        firstName: '',
                        lastName: '',
                        email: auth().currentUser.email,
                        createdAt: firestore.Timestamp.fromDate(new Date()),
                        userImg: auth().currentUser.photoURL,
                        emailVerified: auth().currentUser.emailVerified,
                      })
                      .then(() => {

                        resolve();
                      })
                      .catch(error => {
                        console.log('Something went wrong with added user to firestore: ', error);
                      })
                  })
                  .catch((error) => {
                    console.log('Something went wrong with find user to firestore.', error);
                  });
              })
                .catch(error => {
                  reject(error);
                  console.log('Something went wrong with sign up: ', error);
                });
            } catch (error) {
              console.log({ error });
            }
          });
        },
        fbLogin: async () => {
          return new Promise(async (resolve, reject) => {
            try {
              // Attempt login with permissions
              const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

              if (result.isCancelled) {
                throw 'User cancelled the login process';
              }

              // Once signed in, get the users AccesToken
              const data = await AccessToken.getCurrentAccessToken();

              if (!data) {
                throw 'Something went wrong obtaining access token';
              }

              // Create a Firebase credential with the AccessToken
              const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

              // Sign-in the user with the credential
              await auth().signInWithCredential(facebookCredential)
                .then(() => {
                  firestore()
                    .collection('user')
                    .where("email", "==", auth().currentUser.email)
                    .get()
                    .then((querySnapshot) => {
                      let chartData = querySnapshot.docs.map(doc => doc)
                      if (chartData.length > 0) {
                        resolve();
                        return;
                      }
                      //create user
                      firestore().collection('user').doc(auth().currentUser.uid)
                        .set({
                          firstName: '',
                          lastName: '',
                          email: auth().currentUser.email,
                          createdAt: firestore.Timestamp.fromDate(new Date()),
                          userImg: auth().currentUser.photoURL,
                          emailVerified: auth().currentUser.emailVerified,
                        })
                        .then(() => {
                          resolve();
                        })
                        .catch(error => {
                          console.log('Something went wrong with added user to firestore: ', error);
                        })
                    })
                    .catch((error) => {
                      console.log('Something went wrong with find user to firestore.', error);
                    });
                })
                .catch(error => {
                  reject(error);
                  console.log('Something went wrong with sign up: ', error);
                });
            } catch (error) {
              console.log({ error });
            }
          });
        },
        register: async (email, password) => {
          return new Promise(async (resolve, reject) => {
            firestore()
              .collection('user')
              .where("email", "==", email)
              .get()
              .then((querySnapshot) => {
                let chartData = querySnapshot.docs.map(doc => doc)
                if (chartData.length > 0) {
                  reject("user_exists");
                }
              });
            try {
              await auth().createUserWithEmailAndPassword(email, password)
                .then(() => {
                  firestore().collection('user').doc(auth().currentUser.uid)
                    .set({
                      firstName: '',
                      lastName: '',
                      email: email,
                      createdAt: firestore.Timestamp.fromDate(new Date()),
                      userImg: null,
                      emailVerified: false,
                    }).then(() => {
                      resolve();
                    })
                    .catch(error => {
                      reject(error);
                      console.log('Something went wrong with added user to firestore: ', error);
                    })
                })

            } catch (e) {
              console.log(e);
            }
          });
        },
        logout: async () => {
          try {
            await auth().signOut();
          } catch (e) {
            console.log(e);
          }
        },
      }}>
      {children}
    </AuthContext.Provider >
  );
}
