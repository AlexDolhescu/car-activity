import React, { useState, useContext } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { Card } from 'react-native-elements'
import { AuthContext } from '../navigation/AuthProvider';
import PickerSelect from 'react-native-picker-select';
import firestore from '@react-native-firebase/firestore';

const ManageCarScreen = ({ navigation, carValue }) => {
  // intra cu elementul car
  const { user, logout } = useContext(AuthContext);
  const [car, setCar] = useState({
    brandId: carValue ? carValue.brandId : null,
    modelId: carValue ? carValue.modelId : null,
    vin: carValue ? carValue.vin : null,
    km: carValue ? carValue.km : null,
    fabricationYear: carValue ? carValue.fabricationYear : null,
    cilindricalCapacity: carValue ? carValue.cilindricalCapacity : null,
    color: carValue ? carValue.color : null,
    kw: carValue ? carValue.kw : null,
    hoursePower: carValue ? carValue.hoursePower : null,
    kmToService: carValue ? carValue.kmToService : null,
    daysToService: carValue ? carValue.daysToService : null,
    kmIntervalService: carValue ? carValue.kmIntervalService : "15000",
    daysIntervalService: carValue ? carValue.daysIntervalService : "365",
    showGeneralData: carValue ? carValue.showGeneralData : true,
    showGallery: carValue ? carValue.showGallery : true,
    showActivities: carValue ? carValue.showActivities : true,
    userId: carValue ? carValue.userId : user.uid,
  });
  const [serviceInterval, setServiceInterval] = useState(true);
  const [refreshServiceInterval, setRefreshServiceInterval] = useState(false);

  const brands = [
    { label: 'Vw', value: '1' },
    { label: 'Bmw', value: '2' },
    { label: 'Audi', value: '3' },
  ];

  const models = [
    { label: 'Golf', value: '1' },
    { label: 'Pasat', value: '2' },
    { label: 'Arteon', value: '3' },
  ];

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDatePicked = (date) => {
    { setActivity({ ...car, fabricationYear: date }) }
    hideDatePicker();
  };

  const serviceIntervalPress = () => {
    setServiceInterval(!serviceInterval);
    setCar({ ...car, kmToService: null, daysToService: null, kmIntervalService: null, daysIntervalService: null });
    setRefreshServiceInterval(!refreshServiceInterval);
  }

  const showPublicCar = () => {
    if (car.showGeneralData && car.showGallery && car.showActivities) {
      return 'checked';
    }
    if (!car.showGeneralData && !car.showGallery && !car.showActivities) {
      return 'unchecked';
    }
    if (car.showGeneralData || car.showGallery || car.showActivities) {
      return 'indeterminate';
    }
  }

  const showPublicCarPress = () => {
    if (showPublicCar() == 'checked') {
      setCar({ ...car, showGeneralData: false, showGallery: false, showActivities: false })
    } else {
      setCar({ ...car, showGeneralData: true, showGallery: true, showActivities: true })
    }
  }

  const showGeneralDataPress = () => {
    setCar({ ...car, showGeneralData: !car.showGeneralData })
  }

  const showGalleryPress = () => {
    setCar({ ...car, showGallery: !car.showGallery })
  }

  const showActivitiesPress = () => {
    setCar({ ...car, showActivities: !car.showActivities })
  }

  const saveCar = () => {
    //validari - km, zile cu - | an > an curent
    if (car.brandId == null || car.modelId == null || car.vin == null || car.cilindricalCapacity == null || car.kw == null || car.fabricationYear == null
      || (serviceInterval == true && (car.kmIntervalService == null || car.kmToService == null || car.daysIntervalService == null || car.daysToService == null))) {
      Alert.alert(
        'Atenție',
        'Există câmpuri necompletate!',
      );
      return;
      // de cautat VIN sa nu existe deja masina bagata
    }
    firestore()
      .collection('car')
      .add({
        brandId: car.brandId,
        modelId: car.modelId,
        vin: car.vin,
        km: car.km,
        fabricationYear: car.fabricationYear,
        cilindricalCapacity: car.cilindricalCapacity,
        color: car.color,
        kw: car.kw,
        hoursePower: car.hoursePower,
        kmToService: car.kmToService,
        daysToService: car.daysToService,
        kmIntervalService: car.kmIntervalService,
        daysIntervalService: car.daysIntervalService,
        showGeneralData: car.showGeneralData,
        showGallery: car.showGallery,
        showActivities: car.showActivities,
        userId: car.userId,
        postTime: firestore.Timestamp.fromDate(new Date())
      })
      .then(() => {
        Alert.alert(
          'Succes',
          'Mașina a fost salvată cu succes!',
        );
        // navigation.navigate("ActivityScreen")
      })
      .catch((error) => {
        console.log('Something went wrong with added car to firestore.', error);
      });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <PickerSelect
          onValueChange={(value) => setCar({ ...car, brandId: value })}
          placeholder={{ label: "Selectează o marcă", value: null }}
          value={car.brandId}
          style={pickerSelectStyles}
          items={brands}
        />
        <PickerSelect
          onValueChange={(value) => setCar({ ...car, modelId: value })}
          placeholder={{ label: "Selectează un model", value: null }}
          value={car.modelId}
          style={pickerSelectStyles}
          items={models}
        />
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 10 }}>
          <TextInput
            label="Km actuali"
            value={car.KM}
            mode="outlined"
            maxLength={17}
            onChangeText={value => setCar({ ...car, km: value })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '54%', marginRight: '2%' }}
          />
          <TextInput
            label="Culoare"
            value={car.color}
            mode="outlined"
            maxLength={17}
            onChangeText={value => setCar({ ...car, color: value })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '40%' }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 10 }}>
          <TextInput
            label="Serie caroserie (VIN)"
            value={car.vin}
            mode="outlined"
            maxLength={17}
            onChangeText={vin => setCar({ ...car, vin: vin })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '56%', marginTop: 10, marginRight: '2%' }}
          />
          <TextInput
            label="Motor (cm3)"
            value={car.cilindricalCapacity}
            mode="outlined"
            maxLength={17}
            onChangeText={cilindricalCapacity => setCar({ ...car, cilindricalCapacity: cilindricalCapacity })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '38%', marginTop: 10 }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 10 }}>
          <TextInput
            label="An fabricație"
            value={car.fabricationYear}
            keyboardType='numeric'
            mode="outlined"
            onChangeText={fabricationYear => setCar({ ...car, fabricationYear: fabricationYear })}
            maxLength={7}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '35%', marginRight: '2%' }}
          />
          <TextInput
            label="KW stock"
            value={car.kw}
            keyboardType='numeric'
            mode="outlined"
            maxLength={17}
            onChangeText={kw => setCar({ ...car, kw: kw })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '25%', marginRight: '2%' }}
          />
          <TextInput
            label="CP actuali"
            value={car.hoursePower}
            keyboardType='numeric'
            mode="outlined"
            maxLength={17}
            onChangeText={hoursePower => setCar({ ...car, hoursePower: hoursePower })}
            theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
            style={{ width: '27%' }}
          />
        </View>
        <View style={{ backgroundColor: '#dedede', marginTop: 10, paddingBottom: 10, alignItems: 'center', width: '100%' }}>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center" }}>
            <Checkbox
              status={serviceInterval ? 'checked' : 'unchecked'}
              color='red'
              uncheckedColor='black'
              onPress={() => serviceIntervalPress()}
            />
            <Text>Interval service</Text>
          </View>
          <View refresh={refreshServiceInterval} style={{ width: '96%', marginTop: -10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
            <TextInput
              label="Km până la revizie"
              value={car.kmToService}
              keyboardType='numeric'
              mode="outlined"
              disabled={!serviceInterval}
              onChangeText={kmToService => setCar({ ...car, kmToService: kmToService })}
              maxLength={7}
              theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
              style={{ width: '54%', marginTop: 10, marginRight: '2%' }}
            />
            <TextInput
              label="Zile până la revizie"
              value={car.daysToService}
              keyboardType='numeric'
              mode="outlined"
              disabled={!serviceInterval}
              onChangeText={daysToService => setCar({ ...car, daysToService: daysToService })}
              maxLength={7}
              theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
              style={{ width: '44%', marginTop: 10 }}
            />
          </View>
          <View style={{ width: '96%', marginTop: 10, flexDirection: "row", alignItems: "center", alignContent: "flex-start" }}>
            <TextInput
              label="Interval km revizie"
              value={car.kmIntervalService}
              keyboardType='numeric'
              mode="outlined"
              disabled={!serviceInterval}
              onChangeText={kmIntervalService => setCar({ ...car, kmIntervalService: kmIntervalService })}
              maxLength={7}
              theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
              style={{ width: '54%', marginTop: 10, marginRight: '2%' }}
            />
            <TextInput
              label="Interval zile revizie"
              value={car.daysIntervalService}
              keyboardType='numeric'
              mode="outlined"
              disabled={!serviceInterval}
              onChangeText={daysIntervalService => setCar({ ...car, daysIntervalService: daysIntervalService })}
              maxLength={7}
              theme={{ colors: { primary: 'black', underlineColor: 'transparent', } }}
              style={{ width: '44%', marginTop: 10 }}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
          <Checkbox
            status={showPublicCar()}
            color='red'
            uncheckedColor='black'
            onPress={() => showPublicCarPress()}
          />
          <Text>Afișează mașina public</Text>
        </View>
        <View style={{ width: '92%', marginLeft: '4%' }}>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
            <Checkbox
              status={car.showGeneralData ? 'checked' : 'unchecked'}
              color='red'
              uncheckedColor='black'
              onPress={() => showGeneralDataPress()}
            />
            <Text>Afișează date generale</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
            <Checkbox
              status={car.showGallery ? 'checked' : 'unchecked'}
              color='red'
              uncheckedColor='black'
              onPress={() => showGalleryPress()}
            />
            <Text>Afișează galerie</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", alignContent: "center", alignSelf: "center", width: '96%' }}>
            <Checkbox
              status={car.showActivities ? 'checked' : 'unchecked'}
              color='red'
              uncheckedColor='black'
              onPress={() => showActivitiesPress()}
            />
            <Text>Afișează activități</Text>
          </View>
        </View>
        <Button style={{ marginTop: 10, width: 130, marginBottom: 20 }} mode="contained" color="black" onPress={() => saveCar()}>Salvează</Button>
      </View>
    </ScrollView >
  );
};

export default ManageCarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '96%',
    alignSelf: "center",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    width: '96%',
    alignSelf: "center",
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 10,
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
