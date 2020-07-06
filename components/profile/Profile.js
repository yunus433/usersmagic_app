import React, { Component } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform, ScrollView, TextInput, TouchableOpacity, StatusBar, Image, KeyboardAvoidingView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTasks, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-community/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const tr = require('../../translations/tr.json');
const en = require('../../translations/en.json');
const de = require('../../translations/de.json');
const fr = require('../../translations/fr.json');

const apiRequest = require('../../utils/apiRequest');

i18n.translations = { tr, en, de, fr };

i18n.locale = Localization.locale;
i18n.fallbacks = true;

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const NAVIGATION_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 80;

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.route.params.id,
      user: {},
      email: "",
      credit: "",
      overall_credit: "",
      waiting_credit: "",
      currency_symbol: "",
      original_name: "",
      full_name: "",
      year_of_birth: "",
      gender: "",
      country: "",
      original_city: "",
      city: "",
      original_school_type: "",
      school_type: "",
      original_profession: "",
      profession: "",
      nationality: "",
      interests: [],
      select_input_id: null,
      cities: [],
      original_cities: [],
      genders: [i18n.t('Female'), i18n.t('Male')],
      original_genders: [i18n.t('Female'), i18n.t('Male')],
      school_types: [],
      original_school_types: [],
      professions: [],
      original_professions: [],
      bank_account: "",
      payment_number: "",
      error: "",
      payment_error: "",
      payment_info_wrapper_open: false,
      loading: true
    };
  }

  engName = word => {
    return word.toLocaleLowerCase().split('ş').join('s').split('ı').join('i').split('ö').join('o').split('ç').join('c').split('ü').join('u').split('ğ').join('g');
  }

  onSelectInputClick = type => {
    if (this.state.select_input_id == type) {
      this.setState({
        select_input_id: null
      });
    } else {
      this.setState({
        select_input_id: type
      });
    }
  }

  getProfessions = () => {
    apiRequest({
      method: 'POST',
      url: '/get_job_types.php',
      body: {
        lang: Localization.locale
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        professions: data.job_types,
        original_professions: data.job_types
      });
    });
  }

  onSelectInputChose = (type, value) => {
    this.setState({
      [type]: value,
      select_input_id: null
    });
  }

  onSelectInputChangeText = (array_name, text) => {
    if (text.length)
      this.setState(state => {
        const array = state[`original_${array_name}`].filter(each => this.engName(each).includes(this.engName(text)));
        
        array.sort((a, b) => {
          return this.engName(a).includes(this.engName(text)) < this.engName(b).includes(this.engName(text))
        });

        return { [array_name]: array };
      });
    else
      this.setState({
        [array_name]: this.state[`original_${array_name}`]
      });
  }

  getCitiesAndSchoolTypesByCountry = (country) => {
    apiRequest({
      method: 'POST',
      url: '/get_school_types_and_cities_by_country.php',
      body: { country }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        cities: data.cities,
        original_cities: data.cities,
        school_types: data.school_types,
        original_school_types: data.school_types
      });
    });
  }

  getUser = () => {
    apiRequest({
      url: '/get_user.php',
      method: 'POST',
      body: {
        id: this.state.id
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        email: data.email,
        original_name: data.full_name,
        full_name: data.full_name,
        original_city: data.city,
        city: data.city,
        country: data.country,
        original_profession: data.profession,
        profession: data.profession,
        year_of_birth: data.year_of_birth,
        gender: data.gender,
        nationality: data.nationality,
        email: data.email,
        original_school_type: data.school_type,
        school_type: data.school_type,
        credit: data.money || 0,
        waiting_credit: data.waiting_payment_amount || 0,
        overall_credit: data.overall_payment_amount || 0,
        currency_symbol: data.currency_symbol,
        bank_account: data.bank_account,
        loading: false
      });

      this.getCitiesAndSchoolTypesByCountry(data.country);
    });
  }

  sendPaymentInfo = () => {
    if (!this.state.payment_number.length)
      return this.setState({ payment_error: i18n.t('Please enter your number') });

    apiRequest({
      url: '/complete_user.php',
      method: 'POST',
      body: {
        id: this.state.id,
        full_name: this.state.original_name,
        city: this.state.original_city,
        country: this.state.country,
        profession: this.state.original_profession,
        year_of_birth: this.state.year_of_birth,
        gender: this.state.gender,
        interests: this.state.interests,
        nationality: this.state.nationality,
        school_type: this.state.original_school_type,
        bank_account: this.state.payment_number
      }
    }, (err, data) => {
      if (err) return this.setState({ payment_error: i18n.t('An unknown error occured, please try again') });

      if (data.error && data.error == "bank_account_is_already_captured")
        return this.setState({ payment_error: i18n.t('This ID is already in use') });

      if (data.err) return this.setState({ payment_error: i18n.t('An unknown error occured, please try again') });

      return this.setState({
        bank_account: this.state.payment_number
      });
    });
  }

  logoutButtonController  = async () => {
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('password');

    this.props.navigation.navigate('Register');
  }

  getCreditButtonController = () => {
    if (!this.state.bank_account.length)
      return this.setState({ payment_info_wrapper_open: true });

    if (!this.state.credit || this.state.credit < 20)
      return alert(i18n.t('Your currency should be at least 20') + this.state.currency_symbol);

    apiRequest({
      url: '/submit_payment.php',
      method: 'POST',
      body: {
        id: this.state.id
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      return this.props.navigation.push('Profile', { id: this.state.id });
    });
  }

  editButtonController = () => {
    if (!this.state.full_name.length || !this.state.city.length || !this.state.profession.length || !this.state.school_type.length)
      return this.setState({ error: i18n.t('Please enter all the necessary information') });

    if (!this.state.original_cities.includes(this.state.city) || !this.state.original_professions.includes(this.state.profession) || !this.state.original_school_types.includes(this.state.school_type))
      return this.setState({ error: i18n.t('Please choose values from the drow down menu for country, city, gender, profession, and school inputs') });

    apiRequest({
      url: "/update_user.php",
      method: 'POST',
      body: {
        id: this.state.id,
        full_name: this.state.full_name,
        city: this.state.city,
        profession: this.state.profession,
        school_type: this.state.school_type,
        interests: []
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.props.navigation.push('Profile', { id: this.state.id });
    });
  }

  componentDidMount = () => {
    this.getUser();
    this.getProfessions();
  }

  render() {
    return (
      <View style={styles.main_wrapper}>
        <View style={styles.header} >
          <Image source={require('../../assets/logo.png')} style={styles.header_logo} ></Image>
        </View>
        { this.state.loading ? 
          <View style={styles.content} >
            <ActivityIndicator style={{marginTop: "70%"}} size="small" color="rgb(112, 112, 112)" />
          </View>
          :
          <KeyboardAvoidingView style={{flex: 1, width: "100%"}} behavior={Platform.OS == "ios" ? "padding" : "height"} >
            <ScrollView style={styles.content} >
              <TouchableOpacity activeOpacity={1} onPress={() => {this.onSelectInputClick(null)}}>
                <Text style={styles.user_name} >{this.state.original_name}</Text>
                <Text style={styles.user_info} >{this.state.country}, {this.state.year_of_birth}</Text>
                <Text style={styles.user_price_info} >{i18n.t('Overall Credit')}: {this.state.overall_credit}{this.state.currency_symbol}   {i18n.t('Waiting Credit')}: {this.state.waiting_credit}{this.state.currency_symbol}</Text>
                <Text style={styles.subtitle} >{i18n.t('Your current credit')}:</Text>
                <View style={styles.title_wrapper} >
                  <Text style={styles.title} >{this.state.credit}</Text>
                  <Text style={styles.title_currency} >{this.state.currency_symbol}</Text>
                </View>
                <TouchableOpacity style={styles.get_credit_button} onPress={() => {this.getCreditButtonController()}} >
                  <Text style={styles.get_credit_text} >{i18n.t('Withdraw')}</Text>
                </TouchableOpacity>
                { this.state.bank_account.length ?
                  <Text style={styles.bank_account_number} >{this.state.country == "Türkiye" ? i18n.t('Papara ID') : i18n.t('PayPal ID')}: {this.state.bank_account}</Text>
                  :
                  <View></View>
                }
                <TouchableOpacity style={{alignSelf: "center"}} onPress={() => {this.logoutButtonController()}} >
                  <Text style={styles.logout_text} >{i18n.t('Logout')}</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.each_input} placeholder={i18n.t('Name Surname')}
                  onChangeText={full_name => this.setState({ full_name })} onFocus={() => {this.onSelectInputClick(null)}}
                >{this.state.full_name}</TextInput>
                <View style={[styles.select_input_wrapper, {zIndex: 4}]} >
                  <TextInput
                    style={[styles.select_input, {
                      borderBottomWidth: this.state.select_input_id == "city" ? 0 : 2,
                      borderBottomLeftRadius: this.state.select_input_id == "city" ? 0 : 30,
                      borderBottomRightRadius: this.state.select_input_id == "city" ? 0 : 30
                    }]} placeholder={i18n.t('City')}
                    onFocus={() => {this.onSelectInputClick("city")}}
                    onChangeText={(text) => {this.onSelectInputChangeText("cities", text)}}
                  >{this.state.city}</TextInput>
                  <View style={[styles.select_content_wrapper, {zIndex: 4, display: this.state.select_input_id == "city" ? "flex" : "none"}]} >
                    <ScrollView style={{zIndex: 4}} >
                      { this.state.cities.map((each_city, key) =>
                        <TouchableOpacity style={[styles.each_select_input, {zIndex: 4}]} key={key} onPress={() => {this.onSelectInputChose("city", each_city)}} >
                          <Text style={[styles.each_select_input_text, {zIndex: 4}]} >{each_city}</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                </View>
                <View style={[styles.select_input_wrapper, {zIndex: 3}]} >
                  <TextInput
                    style={[styles.select_input, {
                      borderBottomWidth: this.state.select_input_id == "school_type" ? 0 : 2,
                      borderBottomLeftRadius: this.state.select_input_id == "school_type" ? 0 : 30,
                      borderBottomRightRadius: this.state.select_input_id == "school_type" ? 0 : 30
                    }]} placeholder={i18n.t('Your last or active school')}
                    onFocus={() => {this.onSelectInputClick("school_type")}}
                    onChangeText={(text) => {this.onSelectInputChangeText("school_types", text)}}
                  >{this.state.school_type}</TextInput>
                  <View style={[styles.select_content_wrapper, {zIndex: 3, display: this.state.select_input_id == "school_type" ? "flex" : "none"}]} >
                    <ScrollView style={{zIndex: 3}} >
                      { this.state.school_types.map((each_school_type, key) =>
                        <TouchableOpacity style={[styles.each_select_input, {zIndex: 3}]} key={key} onPress={() => {this.onSelectInputChose("school_type", each_school_type)}} >
                          <Text style={[styles.each_select_input_text, {zIndex: 3}]} >{each_school_type}</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                </View>
                <View style={[styles.select_input_wrapper, {zIndex: 2}]} >
                  <TextInput
                    style={[styles.select_input, {
                      borderBottomWidth: this.state.select_input_id == "profession" ? 0 : 2,
                      borderBottomLeftRadius: this.state.select_input_id == "profession" ? 0 : 30,
                      borderBottomRightRadius: this.state.select_input_id == "profession" ? 0 : 30
                    }]} placeholder={i18n.t('Profession')}
                    onFocus={() => {this.onSelectInputClick("profession")}}
                    onChangeText={(text) => {this.onSelectInputChangeText("professions", text)}}
                  >{this.state.profession}</TextInput>
                  <View style={[styles.select_content_wrapper, {zIndex: 2, display: this.state.select_input_id == "profession" ? "flex" : "none"}]} >
                    <ScrollView style={{zIndex: 2}} >
                      { this.state.professions.map((each_profession, key) =>
                        <TouchableOpacity style={[styles.each_select_input, {zIndex: 2}]} key={key} onPress={() => {this.onSelectInputChose("profession", each_profession)}} >
                          <Text style={[styles.each_select_input_text, {zIndex: 2}]} >{each_profession}</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                </View>
                <Text style={styles.error_line} >{this.state.error}</Text>
                <TouchableOpacity style={styles.start_button} onPress={() => {this.editButtonController()}} >
                  <Text style={styles.start_text} >{i18n.t('Edit')}</Text>
                </TouchableOpacity>
                <Text style={styles.email_info} >{i18n.t('Contact hello@usersmagiccom if you have any problem concerning our services We will respond you within a week')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        }
        <View style={styles.navigation_bar} >
          <TouchableOpacity onPress={() => {this.props.navigation.push('History', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faTasks} color="rgb(80, 177, 238)" size={28} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.props.navigation.push('Index', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faHome} color="rgb(80, 177, 238)" size={28} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.props.navigation.push('Profile', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faUser} color="rgb(240, 84, 79)" size={28} />
          </TouchableOpacity>
        </View>
        { this.state.payment_info_wrapper_open ?
          <View style={styles.payment_info_wrapper} >
            <Text style={styles.payment_info_title} >{this.state.country == "Türkiye" ? i18n.t('Papara ID') : i18n.t('PayPal ID')}</Text>
            <Text style={styles.payment_info_explanation} >{i18n.t('You cannot change your payment information once you enter Please contact our team if any error occurs')}</Text>
            <TextInput style={styles.payment_info_input} placeholder={this.state.country == "Türkiye" ? i18n.t('Papara ID') : i18n.t('PayPal ID')}
              onChangeText={payment_number => this.setState({ payment_number })}
            >{this.state.payment_number}</TextInput>
            <TouchableOpacity style={styles.payment_send_button} onPress={() => {this.sendPaymentInfo()}} >
              <Text style={styles.payment_send_button_text} >{i18n.t('Send')}</Text>
            </TouchableOpacity>
            <Text style={styles.payment_error_line} >{this.state.payment_error}</Text>
          </View>
          :
          <View></View>
        }
        { this.state.payment_info_wrapper_open ?
          <TouchableOpacity style={styles.payment_close_area} onPress={() => { this.setState({ payment_info_wrapper_open: false })} } ></TouchableOpacity>
          :
          <View></View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_wrapper: {
    flex: 1, paddingTop: STATUS_BAR_HEIGHT, backgroundColor: "rgb(254, 254, 254)",
    justifyContent: "center", alignItems: "center"
  },
  header: {
    height: 75, backgroundColor: "rgb(254, 254, 254)",
    borderBottomWidth: 2, borderBottomColor: "rgb(236, 236, 236)",
    alignItems: "center", justifyContent: "center", width: "100%"
  },
  header_logo: {
    height: 30, width: 150, resizeMode: "contain"
  },
  content: {
    flex: 1, backgroundColor: "rgb(248, 248, 248)", padding: 20, width: "100%"
  },
  user_name: {
    color: "rgb(30, 30, 30)", fontWeight: "700", fontSize: 30,
    alignSelf: "center", marginTop: 20
  },
  user_info: {
    color: "rgb(30, 30, 30)", fontWeight: "400", fontSize: 17,
    alignSelf: "center", marginTop: 5
  },
  user_price_info: {
    color: "rgb(30, 30, 30)", fontWeight: "300", fontSize: 15,
    alignSelf: "center", marginTop: 20
  },
  subtitle: {
    color: "rgb(30, 30, 30)", fontWeight: "300", fontSize: 15,
    alignSelf: "center", marginTop: 5
  },
  title_wrapper: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginTop: 5
  },
  title: {
    color: "rgb(30, 30, 30)", fontWeight: "600", fontSize: 35
  },
  title_currency: {
    color: "rgb(80, 177, 238)", fontWeight: "800", fontSize: 35,
    marginLeft: 5
  },
  get_credit_button: {
    backgroundColor: "rgb(240, 84, 79)", height: 60, paddingLeft: 30, paddingRight: 30,
    justifyContent: "center", alignItems: "center", borderRadius: 30,
    marginTop: 20, alignSelf: "center", shadowOffset: {
      width: 0, height: 2
    }, shadowColor: "rgb(240, 84, 79)", shadowOpacity: 0.4, shadowRadius: 10
  },
  get_credit_text: {
    color: "rgb(254, 254, 254)", fontWeight: "600", fontSize: 25
  },
  bank_account_number: {
    color: "rgb(30, 30, 30)", fontSize: 16, fontWeight: "300",
    marginTop: 10, alignSelf: "center"
  },
  logout_text: {
    alignSelf: "center", marginTop: 20, marginBottom: 10,
    color: "rgb(80, 177, 238)", fontWeight: "700", fontSize: 17
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
  select_input_wrapper: {
    height: 60, overflow: "visible", marginTop: 20
  },
  select_input: {
    paddingLeft: 20, paddingRight: 20, flex: 1,
    backgroundColor: "rgb(254, 254, 254)", minHeight: 60,
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderRadius: 30,
    fontSize: 17, fontWeight: "600", color: "rgb(30, 30, 30)",
    shadowColor: "rgb(236, 236, 236)", shadowOpacity: 0.7, shadowOffset: {
      width: 3, height: 4
    }
  },
  select_content_wrapper: {
    width: "100%", height: 150, minHeight: 150, backgroundColor: "rgb(254, 254, 254)",
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderTopWidth: 0,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, position: "absolute", marginTop: 60
  },
  each_select_input: {
    borderTopWidth: 1, borderColor: "rgb(236, 236, 236)", height: 50,
    justifyContent: "center",  alignItems: "center"
  },
  each_select_input_text: {
    color: "rgb(30, 30, 30)", fontWeight: "300", fontSize: 15
  },
  error_line: {
    marginTop: 30, textAlign: "center",
    color: "rgb(240, 84, 79)", fontSize: 17, fontWeight: "600"
  },
  start_button: {
    backgroundColor: "rgb(240, 84, 79)", height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center", marginTop: 30,
    marginBottom: 20, shadowOffset: {
      width: 0, height: 2
    }, shadowColor: "rgb(240, 84, 79)", shadowOpacity: 0.5, shadowRadius: 10
  },
  start_text: {
    color: "rgb(254, 254, 254)", fontWeight: "700", fontSize: 20
  },
  email_info: {
    color: "rgb(30, 30, 30)", fontWeight: "300", fontSize: 17,
    marginBottom: 100, textAlign: "center"
  },
  navigation_bar: {
    height: NAVIGATION_BAR_HEIGHT, backgroundColor: "rgb(254, 254, 254)",
    borderTopWidth: 2, borderTopColor: "rgb(236, 236, 236)",
    flexDirection: "row", alignItems: "center", justifyContent: "space-evenly",
    paddingLeft: 20, paddingRight: 20, width: "100%"
  },
  payment_info_wrapper: {
    position: "absolute", backgroundColor: "rgb(254, 254, 254)", padding: 20,
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderRadius: 15,
    width: "90%", zIndex: 2
  },
  payment_info_title: {
    color: "rgb(80, 177, 238)", fontSize: 17, fontWeight: "800",
    marginBottom: 5
  },
  payment_info_explanation: {
    color: "rgb(30, 30, 30)", fontSize: 15, fontWeight: "300",
    marginBottom: 20
  },
  payment_info_input: {
    paddingLeft: 20, paddingRight: 20,
    backgroundColor: "rgb(254, 254, 254)", height: 60,
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderRadius: 30,
    fontSize: 17, fontWeight: "600", color: "rgb(30, 30, 30)",
    shadowColor: "rgb(236, 236, 236)", shadowOpacity: 0.7, shadowOffset: {
      width: 3, height: 4
    }
  },
  payment_error_line: {
    marginTop: 20, textAlign: "center",
    color: "rgb(240, 84, 79)", fontSize: 17, fontWeight: "600"
  },
  payment_send_button: {
    backgroundColor: "rgb(240, 84, 79)", height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center", marginTop: 20,
    shadowOffset: {
      width: 0, height: 2
    }, shadowColor: "rgb(240, 84, 79)", shadowOpacity: 0.5, shadowRadius: 10
  },
  payment_send_button_text: {
    color: "rgb(254, 254, 254)", fontWeight: "700", fontSize: 20
  },
  payment_close_area: {
    position: "absolute", width: "100%", height: "100%",
    backgroundColor: "transparent"
  }
});
