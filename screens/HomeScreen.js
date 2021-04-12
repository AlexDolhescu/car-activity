import * as React from 'react';
import {
  Text,
  View,
  Button
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen= ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text> Home Screen </Text>
      <Button title="DetailsScreen" onPress={() => navigation.navigate("DetailsScreen")}/>
    </View>
  );
};

export default HomeScreen;
