import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, StatusBar, TextInput, Keyboard, KeyboardAvoidingView } from 'react-native';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const apiRequest = require('../../utils/apiRequest');

const tr = require('../../translations/tr.json');
const en = require('../../translations/en.json');
const de = require('../../translations/de.json');

i18n.translations = { tr, en, de };

i18n.locale = Localization.locale;
i18n.fallbacks = true;

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

export default class Complete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.route.params.id,
      active_page: 1,
      full_name: "",
      year_of_birth: "",
      gender: "",
      country: "",
      city: "",
      school_type: "",
      profession: "",
      nationality: "",
      interests: [],
      select_input_id: null,
      countries: [],
      original_countries: [],
      cities: [],
      original_cities: [],
      genders: [i18n.t('Female'), i18n.t('Male')],
      original_genders: [i18n.t('Female'), i18n.t('Male')],
      school_types: [],
      original_school_types: [],
      professions: [],
      original_professions: [],
      nationalities: [],
      original_nationalities: [],
      paypal_number: "",
      error: ""
    };
  }

  getCountries = () => {
    apiRequest({
      method: 'POST',
      url: '/get_countries.php',
      body: {
        "A": "A"
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      return this.setState({
        countries: data.countries,
        original_countries: data.countries
      });
    });
  }

  getNationalities = () => {
    apiRequest({
      method: 'POST',
      url: '/get_nationalities.php',
      body: {
        "A": "A"
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        nationalities: data.nationalities,
        original_nationalities: data.nationalities
      });
    });
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

  engName = word => {
    return word.toLocaleLowerCase().split('ş').join('s').split('ı').join('i').split('ö').join('o').split('ç').join('c').split('ü').join('u').split('ğ').join('g');
  }

  onSelectInputClick = (type) => {
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

  onSelectInputChose = (type, value) => {
    if (type == "country") {
      apiRequest({
        method: 'POST',
        url: '/get_school_types_and_cities_by_country.php',
        body: {
          country: value
        }
      }, (err, data) => {
        if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

        this.setState({
          [type]: value,
          city: "",
          school_type: "",
          select_input_id: null,
          cities: data.cities,
          original_cities: data.cities,
          school_types: data.school_types,
          original_school_types: data.school_types
        });
      });
    } else {
      this.setState({
        [type]: value,
        select_input_id: null
      });
    }
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

  completePageSendController = () => {
    this.setState({ select_input_id: null });

    if (!this.state.id.length || !this.state.paypal_number || !this.state.nationality || !this.state.full_name.length || !this.state.city.length || !this.state.country.length || !this.state.profession.length || !this.state.year_of_birth.length || !this.state.gender.length || !this.state.school_type.length)
      return this.setState({ error: i18n.t('Please enter all the necessary information') });

    if (!this.state.original_countries.includes(this.state.country) || !this.state.original_cities.includes(this.state.city) || !this.state.original_genders.includes(this.state.gender) || !this.state.original_professions.includes(this.state.profession) || !this.state.original_school_types.includes(this.state.school_type))
      return this.setState({ error: i18n.t('Please choose values from the drow down menu for country, city, gender, profession, and school inputs') });

    apiRequest({
      url: '/complete_user.php',
      method: 'POST',
      body: {
        id: this.state.id,
        full_name: this.state.full_name,
        city: this.state.city,
        country: this.state.country,
        profession: this.state.profession,
        year_of_birth: this.state.year_of_birth,
        gender: this.state.gender,
        interests: this.state.interests,
        nationality: this.state.nationality,
        school_type: this.state.school_type,
        bank_account: this.state.paypal_number
      }
    }, (err, data) => {
      if (err) return this.setState({ error: i18n.t('An unknown error occured, please try again') });

      if (data.error && data.error == 'bad_request')
        return this.setState({ error: i18n.t('Please enter all the necessary information') });

      if (data.error)
        return this.setState({ error: i18n.t('An unknown error occured, please try again') });

      return this.props.navigation.navigate('Index', { id: this.state.id });
    });
  }

  nextPageController = () => {
    if (!this.state.full_name.length || !this.state.country.length || !this.state.gender.length || !this.state.nationality.length)
      return this.setState({ error: i18n.t('Please enter all the necessary information') });
    
    return this.setState({ 
      active_page: 2,
      select_input_id: null,
      error: ""
    });
  }

  componentDidMount = () => {
    this.getCountries();
    this.getNationalities();
    this.getProfessions();
  }

  render() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.main_wrapper} keyboardVerticalOffset={50}  >
        <ScrollView style={{backgroundColor: "transparent"}} >
          { this.state.active_page == 1 ?
            <TouchableOpacity activeOpacity={1} style={styles.content_wrapper} onPress={() => {this.onSelectInputClick(null)}}>
              <View style={styles.title_wrapper} >
                <Text style={styles.title} >{i18n.t('Complete your account details to start')}</Text>
              </View>
              <TextInput
                style={styles.each_input} placeholder={i18n.t('Name Surname')}
                onChangeText={full_name => this.setState({ full_name })} onFocus={() => {this.onSelectInputClick(null)}}
              >{this.state.full_name}</TextInput>
              <View style={[styles.select_input_wrapper, {zIndex: 4}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "country" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "country" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "country" ? 0 : 30
                  }]} placeholder={i18n.t('Residence Country')}
                  onFocus={() => {this.onSelectInputClick("country")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("countries", text)}}
                >{this.state.country}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 4, display: this.state.select_input_id == "country" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.countries.map((each_country, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("country", each_country)}} >
                        <Text style={styles.each_select_input_text} >{each_country}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.select_input_wrapper, {zIndex: 3}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "nationality" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "nationality" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "nationality" ? 0 : 30
                  }]} placeholder={i18n.t('Nationality')}
                  onFocus={() => {this.onSelectInputClick("nationality")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("nationalities", text)}}
                >{this.state.nationality}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 3, display: this.state.select_input_id == "nationality" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.nationalities.map((each_nationality, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("nationality", each_nationality)}} >
                        <Text style={styles.each_select_input_text} >{each_nationality}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.select_input_wrapper, {zIndex: 2}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "gender" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "gender" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "gender" ? 0 : 30
                  }]} placeholder={i18n.t('Gender')}
                  onFocus={() => {this.onSelectInputClick("gender")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("genders", text)}}
                >{this.state.gender}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 2, display: this.state.select_input_id == "gender" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.genders.map((each_gender, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("gender", each_gender)}} >
                        <Text style={styles.each_select_input_text} >{each_gender}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <Text style={styles.error_line} >{this.state.error}</Text>
              <TouchableOpacity style={styles.start_button} onPress={() => {this.nextPageController()}} >
                <Text style={styles.start_text} >{i18n.t('Continue')}</Text>
              </TouchableOpacity>
              <View style={styles.curr_page_wrapper} >
                <View  style={[styles.curr_page_button, {backgroundColor: this.state.active_page == 1 ? "rgb(240, 84, 79)" : "rgb(80, 177, 238)"}]} ></View>
                <View style={{width: 5}} ></View>
                <View  style={[styles.curr_page_button, {backgroundColor: this.state.active_page == 2 ? "rgb(240, 84, 79))" : "rgb(80, 177, 238)"}]} ></View>
              </View>
            </TouchableOpacity>
            :
            <TouchableOpacity activeOpacity={1} style={styles.content_wrapper} onPress={() => {this.onSelectInputClick(null)}}>
              <View style={styles.title_wrapper} >
                <Text style={styles.title} >{i18n.t('Complete your account details to start')}</Text>
              </View>
              <View style={[styles.select_input_wrapper, {zIndex: 5}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "city" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "city" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "city" ? 0 : 30
                  }]} placeholder={i18n.t('City')}
                  onFocus={() => {this.onSelectInputClick("city")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("cities", text)}}
                >{this.state.city}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 5, display: this.state.select_input_id == "city" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.cities.map((each_city, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("city", each_city)}} >
                        <Text style={styles.each_select_input_text} >{each_city}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.select_input_wrapper, {zIndex: 4}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "school_type" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "school_type" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "school_type" ? 0 : 30
                  }]} placeholder={i18n.t('Your last or active school')}
                  onFocus={() => {this.onSelectInputClick("school_type")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("school_types", text)}}
                >{this.state.school_type}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 4, display: this.state.select_input_id == "school_type" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.school_types.map((each_school_type, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("school_type", each_school_type)}} >
                        <Text style={styles.each_select_input_text} >{each_school_type}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.select_input_wrapper, {zIndex: 3}]} >
                <TextInput
                  style={[styles.select_input, {
                    borderBottomWidth: this.state.select_input_id == "profession" ? 0 : 2,
                    borderBottomLeftRadius: this.state.select_input_id == "profession" ? 0 : 30,
                    borderBottomRightRadius: this.state.select_input_id == "profession" ? 0 : 30
                  }]} placeholder={i18n.t('Profession')}
                  onFocus={() => {this.onSelectInputClick("profession")}}
                  onChangeText={(text) => {this.onSelectInputChangeText("professions", text)}}
                >{this.state.profession}</TextInput>
                <View style={[styles.select_content_wrapper, {zIndex: 3, display: this.state.select_input_id == "profession" ? "flex" : "none"}]} >
                  <ScrollView>
                    { this.state.professions.map((each_profession, key) =>
                      <TouchableOpacity style={styles.each_select_input} key={key} onPress={() => {this.onSelectInputChose("profession", each_profession)}} >
                        <Text style={styles.each_select_input_text} >{each_profession}</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
              <TextInput
                style={styles.each_input} placeholder={i18n.t('Birth Year')} keyboardType="numeric"
                onChangeText={year_of_birth => this.setState({ year_of_birth })} onFocus={() => {this.onSelectInputClick(null)}}
              >{this.state.year_of_birth}</TextInput>
              <TextInput
                style={styles.each_input} placeholder={i18n.t('PayPal Number')} keyboardType="numeric"
                onChangeText={paypal_number => this.setState({ paypal_number })} onFocus={() => {this.onSelectInputClick(null)}}
              >{this.state.paypal_number}</TextInput>
              <Text style={styles.error_line} >{this.state.error}</Text>
              <TouchableOpacity style={styles.start_button} onPress={() => {this.completePageSendController()}} >
                <Text style={styles.start_text} >{i18n.t('Finish')}</Text>
              </TouchableOpacity>
              <View style={styles.curr_page_wrapper} >
                <View  style={[styles.curr_page_button, {backgroundColor: this.state.active_page == 1 ? "rgb(240, 84, 79)" : "rgb(80, 177, 238)"}]} ></View>
                <View style={{width: 5}} ></View>
                <View  style={[styles.curr_page_button, {backgroundColor: this.state.active_page == 2 ? "rgb(240, 84, 79))" : "rgb(80, 177, 238)"}]} ></View>
              </View>
            </TouchableOpacity>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  main_wrapper: {
    flex: 1, paddingTop: STATUS_BAR_HEIGHT, backgroundColor: "transparent"
  },
  content_wrapper: {
    flex: 1, paddingLeft: 20, paddingRight: 20
  },
  title_wrapper: {
    flexDirection: "row", alignItems: "center", marginTop: 20,
    flex: 1, marginBottom: 20
  },
  title: {
    fontSize: 30, color: "rgb(30, 30, 30)", fontWeight: "800"
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
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30
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
    shadowOffset: {
      width: 0, height: 2
    }, shadowColor: "rgb(240, 84, 79)", shadowOpacity: 0.5, shadowRadius: 10
  },
  start_text: {
    color: "rgb(254, 254, 254)", fontWeight: "700", fontSize: 20
  },
  curr_page_wrapper: {
    flexDirection: "row", marginTop: 20, alignSelf: "center",
    alignItems: "center", marginBottom: 100
  },
  curr_page_button: {
    width: 8, height: 8, borderRadius: 4
  }
});
