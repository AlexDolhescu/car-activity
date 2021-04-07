import * as React from 'react';
import {
  Text,
  View,
  Button
} from 'react-native';

const HomeScreen= ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text> Home Screen </Text>
      <Button title="DetailsScreen" onPress={() => navigation.navigate("DetailsScreen")}/>
    </View>
  );
};

export default HomeScreen;
