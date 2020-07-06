import React, { Component } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTasks, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
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

export default class History extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.route.params.id,
      campaigns: [],
      loading: true
    };
  }

  componentDidMount = () => {
    apiRequest({
      method: "POST",
      url: "/get_old_campaigns.php",
      body: {
        id: this.state.id
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        campaigns: data.old_campaigns,
        loading: false
      });
    });
  }

  getSavedTestQuestions = (campaign) => {
    this.props.navigation.navigate('Test', {
      id: this.state.id,
      campaign,
      test_answers: campaign.saved_answers ? campaign.saved_answers : null
    });
  }

  getCampaignButton = (campaign) => {
    if (campaign.status == "waiting") {
      return (
        <Text style={styles.campaign_status} >{i18n.t('Waiting for review')}...</Text>
      );
    } else if (campaign.status == "approved") {
      return (
        <Text style={styles.campaign_status} >{i18n.t('Your application is approved, you can see your money in your profile!')}</Text>
      );
    } else if (campaign.status == "saved") {
      return (
        <TouchableOpacity style={styles.campaign_join_button} onPress={() => {this.getSavedTestQuestions(campaign)}} >
          <Text style={styles.campaign_join_text} >{i18n.t('Continue')}</Text>
        </TouchableOpacity>
      );
    } else if (campaign.status == "unapproved") {
      return (
        <TouchableOpacity style={styles.campaign_join_button} onPress={() => {this.getSavedTestQuestions(campaign)}} >
          <Text style={styles.campaign_join_text} >{i18n.t('Resend')}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View></View>
      );
    }
  }

  render() {
    return (
      <View style={styles.main_wrapper}>
        <View style={styles.header} >
          <Image source={require('../../assets/logo.png')} style={styles.header_logo} ></Image>
        </View>
        <ScrollView style={styles.content} >
          { this.state.campaigns.map((campaign, key) => {
            return (
              <View key={key} style={styles.each_campaign_wrapper} >
                <View style={styles.campaign_inner_wrapper} >
                  <Image source={{uri: campaign.image}} style={styles.campaign_photo} ></Image>
                  <View style={styles.campaign_content_wrapper} >
                    <Text style={styles.campaign_title} numberOfLines={2} lineBreakMode="tail" >{campaign.campaign_name}</Text>
                    { campaign.message && campaign.message.length ?
                      <Text style={styles.campaign_error} numberOfLines={3} lineBreakMode="tail" >{campaign.message}</Text>
                      :
                      <Text style={styles.campaign_description} numberOfLines={3} lineBreakMode="tail" >{campaign.campaign_description}</Text>
                    }
                    <View style={styles.price_wrapper} >
                      <Text style={styles.campaign_price_info} >{i18n.t('You will gain')}:</Text>
                      <Text style={styles.campaign_price} >{campaign.earning}</Text>
                    </View>
                  </View>
                </View>
                {this.getCampaignButton(campaign)}
              </View>
            )
          }) }
          { !this.state.campaigns.length && !this.state.loading ?
            <Text style={styles.no_campaign_text} >{i18n.t('You didn\'t join any campaign yet')}</Text>
            :
            <View style={{flex: 1, height: 50}} ></View>
          }
          { this.state.loading ?
            <ActivityIndicator style={{marginTop: "50%"}} size="small" color="rgb(112, 112, 112)" />
            :
            <View></View>
          }
          <View style={{flex: 1, height: 50}} ></View>
        </ScrollView>
        <View style={styles.navigation_bar} >
          <TouchableOpacity onPress={() => {this.props.navigation.push('History', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faTasks} color="rgb(240, 84, 79)" size={28} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.props.navigation.push('Index', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faHome} color="rgb(80, 177, 238)" size={28} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.props.navigation.push('Profile', {id: this.state.id})}} >
            <FontAwesomeIcon icon={faUser} color="rgb(80, 177, 238)" size={28} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_wrapper: {
    flex: 1, paddingTop: STATUS_BAR_HEIGHT, backgroundColor: "rgb(254, 254, 254)"
  },
  header: {
    height: 75, backgroundColor: "rgb(254, 254, 254)",
    borderBottomWidth: 2, borderBottomColor: "rgb(236, 236, 236)",
    alignItems: "center", justifyContent: "center"
  },
  header_logo: {
    height: 30, width: 150, resizeMode: "contain"
  },
  content: {
    flex: 1, backgroundColor: "rgb(248, 248, 248)", padding: 20
  },
  each_campaign_wrapper: {
    padding: 20, borderColor: "rgb(236, 236, 236)", borderWidth: 2,
    backgroundColor: "rgb(254, 254, 254)", borderRadius: 20, marginBottom: 20
  },
  campaign_inner_wrapper: {
    flexDirection: "row", width: "100%"
  },
  campaign_photo: {
    width: 120, height: 120, resizeMode: "contain", borderRadius: 20
  },
  campaign_content_wrapper: {
    marginLeft: 20, flex: 1
  },
  campaign_title: {
    fontSize: 17, color: "rgb(30, 30, 30)", fontWeight: "600",
    flex: 1, marginBottom: 10
  },
  campaign_description: {
    fontSize: 12, color: "rgb(30, 30, 30)", fontWeight: "300", flex: 1
  },
  campaign_error: {
    fontSize: 13, color: "rgb(240, 84, 79)", fontWeight: "600", flex: 1
  },
  price_wrapper: {
    flexDirection: "row", alignItems: "center", marginTop: 20, flex: 1, justifyContent: "flex-end"
  },
  campaign_price_info: {
    fontSize: 12, fontWeight: "300", color: "rgb(30, 30, 30)", marginRight: 5
  },
  campaign_price: {
    fontSize: 27, fontWeight: "800", color: "rgb(240, 84, 79)"
  },
  campaign_join_button: {
    height: 40, paddingLeft: 37, paddingRight: 37, backgroundColor: "rgb(80, 177, 238)",
    borderRadius: 20, shadowOffset: {
      width: 2, height: 3
    }, shadowColor: "rgb(80, 177, 238)", shadowOpacity: 0.8,
    justifyContent: "center", marginTop: 20, alignSelf: "center"
  },
  campaign_join_text: {
    color: "rgb(254, 254, 254)", fontWeight: "700", fontSize: 22
  },
  campaign_status: {
    textAlign: "center", marginTop: 20,
    color: "rgb(80, 177, 238)", fontWeight: "700", fontSize: 17
  },
  no_campaign_text: {
    alignSelf: "center", textAlign: "center",
    color: "rgb(30, 30, 30)", fontWeight: "300", fontSize: 16,
    marginTop: "50%"
  },
  navigation_bar: {
    height: NAVIGATION_BAR_HEIGHT, backgroundColor: "rgb(254, 254, 254)",
    borderTopWidth: 2, borderTopColor: "rgb(236, 236, 236)",
    flexDirection: "row", alignItems: "center", justifyContent: "space-evenly",
    paddingLeft: 20, paddingRight: 20
  }
});
