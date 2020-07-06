import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, KeyboardAvoidingView, TouchableOpacity, StatusBar, TextInput, Image, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const apiRequest = require('../../utils/apiRequest');

const tr = require('../../translations/tr.json');
const en = require('../../translations/en.json');
const de = require('../../translations/de.json');
const fr = require('../../translations/fr.json');

i18n.translations = { tr, en, de, fr };

i18n.locale = Localization.locale;
i18n.fallbacks = true;

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      error: ""
    };
  }

  addUserToAsyncStorage = async (email, password, callback) => {
    try {
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password);
      callback();
    } catch (error) {
      alert(i18n.t('Your account could not be saved, please try again later'));
    }
  };

  loginPageSendController = () => {
    if (!this.state.email.length || !this.state.password.length)
      return this.setState({ error: i18n.t('Please enter your email and password') });

    if (this.state.password.length < 6)
      return this.setState({ error: i18n.t('Your password should be at least 6 digits length') });

    apiRequest({
      url: '/login.php',
      method: 'POST',
      body: {
        email: this.state.email,
        password: this.state.password
      },
    }, (err, data) => {
      if (err) return this.setState({ error: i18n.t('An unknown error occured, please try again') });

      if (data.error && data.error == 'email_or_password_is_uncorrect')
        return this.setState({ error: i18n.t('Sorry, this account is not registered') });

      if (data.error && data.error == 'bad_request')
        return this.setState({ error: i18n.t('Please enter all the necessary information') });

      if (data.error)
        return this.setState({ error: i18n.t('An unknown error occured, please try again') });

      this.addUserToAsyncStorage(this.state.email, this.state.password, () => {
        if (data.completed)
          return this.props.navigation.push('Index', { id: data.id });
        else
          return this.props.navigation.push('Complete', { id: data.id });
      });
    });
  }

  render() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.main_wrapper} >
        <ScrollView style={styles.main_wrapper}>
          <TouchableOpacity style={styles.content_wrapper} activeOpacity={1} onPress={() => { Keyboard.dismiss() }} >
            <Image source={require('../../assets/register.png')} style={styles.login_image} ></Image>
            <TextInput
              style={styles.each_input} placeholder={i18n.t('E-Mail')} onChangeText={email => this.setState({ email })}
            >{this.state.email}</TextInput>
            <TextInput
              style={styles.each_input} placeholder={i18n.t('Password')} secureTextEntry={true} onChangeText={password => this.setState({ password })}
            >{this.state.password}</TextInput>
            <Text style={styles.error_line} >{this.state.error}</Text>
            <TouchableOpacity style={styles.start_button} onPress={() => {this.loginPageSendController()}} >
              <Text style={styles.start_text} >{i18n.t('Login')}</Text>
            </TouchableOpacity>
            <View style={styles.bottom_wrapper} >
              <Text style={styles.bottom_text} >{i18n.t('Don\'t you have an account?')}</Text>
              <TouchableOpacity onPress={() => {this.props.navigation.navigate('Register')}} >
                <Text style={styles.bottom_link} >{i18n.t('Register')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  main_wrapper: {
    flex: 1, paddingTop: STATUS_BAR_HEIGHT, backgroundColor: "rgb(248, 248, 248)"
  },
  content_wrapper: {
    flex: 1, paddingLeft: 20, paddingRight: 20
  },
  login_image: {
    width: "100%", resizeMode: "contain", marginBottom: 20, marginTop: 20
  },
  each_input: {
    paddingLeft: 20, paddingRight: 20, flex: 1,
    backgroundColor: "rgb(254, 254, 254)", height: 60,
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderRadius: 30,
    fontSize: 17, fontWeight: "600", color: "rgb(30, 30, 30)", marginTop: 20,
    shadowColor: "rgb(236, 236, 236)", shadowOpacity: 0.7, shadowOffset: {
      width: 3, height: 4
    }
  },
  error_line: {
    marginTop: 30, textAlign: "center",
    color: "rgb(240, 84, 79)", fontSize: 17, fontWeight: "600"
  },
  start_button: {
    backgroundColor: "rgb(240, 84, 79)", height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center", marginTop: 30,
    shadowOffset: {
      width: 0, height: 2
    }, shadowColor: "rgb(240, 84, 79)", shadowOpacity: 0.5, shadowRadius: 10
  },
  start_text: {
    color: "rgb(254, 254, 254)", fontWeight: "700", fontSize: 20
  },
  bottom_wrapper: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 20, marginBottom: 80
  },
  bottom_text: {
    color: "rgb(30, 30, 30)", fontSize: 17, fontWeight: "600"
  },
  bottom_link: {
    color: "rgb(80, 177, 238)", fontWeight: "800", fontSize: 17,
    marginLeft: 5
  }
});
