import React, {Component} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const apiRequest = require('../../utils/apiRequest');

export default class Loading extends Component {
  componentDidMount = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      const password = await AsyncStorage.getItem('password');

      if (email != null && password != null) {
        apiRequest({
          method: "POST",
          url: "/login.php",
          body: { email, password }
        }, (err, data) => {
          if (err || !data || data.error || !data.id) return this.props.navigation.navigate('Register');

          if (data.complated)
            this.props.navigation.navigate('Index', { id: data.id });
          else
            this.props.navigation.navigate('Complete', { id: data.id });
        });
      } else {
        this.props.navigation.navigate('Register');
      }
    } catch (error) {
      this.props.navigation.navigate('Register');
    }
  }

  render() {
    return (
      <View style={styles.main_wrapper}>
        <ActivityIndicator size="large" color="rgb(240, 84, 79)" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_wrapper: {
    flex: 1, backgroundColor: "rgb(253, 252, 252)",
    justifyContent: "center", alignItems: "center"
  }
});
