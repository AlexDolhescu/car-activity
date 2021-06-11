import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { TextInput, Title, Button } from 'react-native-paper';
import { Icon, Text, Card, Image } from 'react-native-elements'
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../navigation/AuthProvider';
import Carousel from 'react-native-snap-carousel';
import { windowWidth, windowHeight } from "../utils/Dimensions";

const HomeScreen = ({ navigation }) => {

  const { user, logout } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carInfo, setCarInfo] = useState({});
  const [carouselItems, setCarouselItems] = useState([
    {
      title: "Vw Golf",
      icon: "vw"
    },
    {
      title: "Bmw Seria 3",
      icon: "vw.png"
    },
    {
      title: "Audi RS6",
      icon: "vw.png"
    },
    {
      title: "Vw Passat",
      icon: "vw.png"
    },
    {
      title: "Ford Focus",
      icon: "vw.png"
    },
  ]);

  const changeCar = (index) => {
    setActiveIndex(index)
    console.log(carouselItems[index])
  }


  const _renderItem = ({ item, index }) => {
    var icon = index == 1
  ? require('../assets/golf.png')
  : require('../assets/vw.png');
    return (
      <View style={styles.slide}>
        <View style={styles.slideInnerContainer}>
          <Text style={{fontWeight: 'bold', fontSize:16 }}>{item.title}</Text>
          <Image source={icon} style={{
          resizeMode: "contain", width: 150, height: 200,
          marginTop: -20
        }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView>
      <SafeAreaView>
        <Image source={require('../assets/logo/logo.png')} style={{
          resizeMode: 'contain', width: windowWidth, height: 200,
          marginTop: -25, marginBottom: -40
        }} />
        <Text h5 style={{ color: 'gray', textAlign: "center", marginTop: -10 }}>- nu aveți nicio mașină asignată -</Text>
      </SafeAreaView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginTop: 10, height: 200 }}>
          <Carousel
            ref={(c) => { _carousel = c; }}
            layout={"default"}
            renderItem={_renderItem}
            data={carouselItems}
            sliderWidth={windowWidth}
            itemWidth={200}
            firstItem={2}
            initialNumToRender={100}
            onSnapToItem={index => changeCar(index)}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
          <Button style={{ width: 200, marginBottom: 10, marginTop: 10, marginRight:'2%' }} mode="outlined" color="black"
          onPress={() => navigation.navigate("ManageCarScreen")}
          >Adaugă o mașină</Button>
              <Button style={{ width: 150, marginBottom: 10, marginTop: 10 }} mode="outlined" color="black"
          onPress={() => navigation.navigate("ManageCarScreen")}
          >Gestionează</Button>
        </View>
        <Card >
          <Card.Title>INTERVAL SERVICE</Card.Title>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
            <View style={{ width: '20%', marginLeft: '25%', marginRight: '10%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>15000</Text>
              <Text>(km)</Text>
            </View>
            <View style={{ width: '20%', marginRight: '25%', textAlign: 'center', alignSelf: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>200</Text>
              <Text>(zile)</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  slide: {
    width: 200,
    height: 200,
    paddingHorizontal: 20,
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  slideInnerContainer: {
    width: 280,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10
  }
});