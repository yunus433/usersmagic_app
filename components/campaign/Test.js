import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { TextInput } from 'react-native-gesture-handler';

const apiRequest = require('../../utils/apiRequest');

const tr = require('../../translations/tr.json');
const en = require('../../translations/en.json');

i18n.translations = { tr, en };

i18n.locale = Localization.locale;
i18n.fallbacks = true;

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

export default class Test extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.route.params.id,
      campaign_id: this.props.route.params.campaign_id,
      campaign: {},
      test_questions: [],
      test_answers: [],
      error: ""
    };
  }

  changeAnswer = (question, index, answer) => {
    if (question.answer_type == "text" || question.answer_type == "radio") {
      this.setState(state => {
        const test_answers = state.test_answers;
        test_answers[index] = answer;
        return { test_answers };
      });
    } else if (question.answer_type == "checked") {
      this.setState(state => {
        const test_answers = state.test_answers;

        if (test_answers[index].includes(answer))
          test_answers[index] = test_answers[index].filter(each => each != answer);
        else
          test_answers[index].push(answer);

        return { test_answers };
      });
    } else {
      return;
    }
  }

  createQuestion = (question, index) => {
    if (question.answer_type == "text") {
      return (
        <View style={styles.each_test_question} key={index} >
          <Text style={styles.each_question_text} >{question.question}</Text>
          <TextInput
            style={styles.each_question_input} placeholder={i18n.t('Your Answer')}
            multiline={true} onChangeText={(text) => {this.changeAnswer(question, index, text)}}
          >{this.state.test_answers[index]}</TextInput>
        </View>
      );
    } else if (question.answer_type == "radio") {
      return (
        <View style={styles.each_test_question} key={index} >
          <Text style={styles.each_question_text} >{question.question}</Text>
          { question.choices.map((choice, key) => {
            return (
              <TouchableOpacity style={styles.each_choice} key={key} onPress={() => {this.changeAnswer(question, index, choice)}} >
                <View style={this.state.test_answers[index] != choice ? styles.radio_choice_button : styles.radio_choice_button_selected} >
                  { this.state.test_answers[index] == choice ?
                    <View style={styles.radio_choice_seleted} ></View>
                    :
                    <View></View>
                  }
                </View>
                <Text style={styles.choice_text} >{choice}</Text>
              </TouchableOpacity>
            )
          }) }
          <TouchableOpacity></TouchableOpacity>
        </View> 
      );
    } else if (question.answer_type == "checked") {
      return (
        <View style={styles.each_test_question} key={index} >
          <Text style={styles.each_question_text} >{question.question}</Text>
          { question.choices.map((choice, key) => {
            return (
              <TouchableOpacity style={styles.each_choice} key={key} onPress={() => {this.changeAnswer(question, index, choice)}} >
                <View style={!this.state.test_answers[index].includes(choice) ? styles.checked_choice_button : styles.checked_choice_button_selected} >
                  { this.state.test_answers[index].includes(choice) ?
                    <FontAwesomeIcon icon={faCheck} color="rgb(254, 254, 254)" size={10} />
                    :
                    <View></View>
                  }
                </View>
                <Text style={styles.choice_text} >{choice}</Text>
              </TouchableOpacity>
            )
          }) }
        </View>
      );
    } else {
      return <View key={index} ></View>;
    }
  }
 
  getTestQuestions = () => {
    apiRequest({
      url: '/get_test.php',
      method: 'POST',
      body: {
        campaign_id: this.state.campaign_id
      }
    }, (err, data) => {
      console.log(err, data);
      if (err || !data || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      if (this.props.route.params.test_answers)
        this.setState({
          test_questions: data.test_questions,
          test_answers: this.props.route.params.test_answers
        });
      else
        this.setState({
          test_questions: data.test_questions,
          test_answers: data.test_questions.map(each_question => {
            if (each_question.answer_type == "checked")
              return [];
            else
              return "";
          })
        });
    });
  }

  getCampaign = () => {
    apiRequest({
      url: '/get_campaign.php',
      method: 'POST',
      body: {
        campaign_id: this.state.campaign_id
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.setState({
        campaign: data.campaign
      });
    })
  }

  saveTestAnswers = () => {
    apiRequest({
      url: '/save_test_result.php',
      method: 'POST',
      body: {
        user_id: this.state.id,
        campaign_id: this.state.campaign_id,
        test_answers: this.state.test_answers
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.props.navigation.navigate('History', { id: this.state.id });
    });
  }

  submitTestAnswers = () => {
    if (!this.state.test_answers.filter(each => !each.length).length)
      return this.setState({ error: i18n.t('Please fill every question in the test before submit your answers') });

    apiRequest({
      url: '/submit_test_result.php',
      method: 'POST',
      body: {
        user_id: this.state.id,
        campaign_id: this.state.campaign_id,
        test_answers: this.state.test_answers
      }
    }, (err, data) => {
      if (err || data.error) return alert(i18n.t('An unknown error occured, please try again'));

      this.props.navigation.navigate('History', { id: this.state.id });
    });
  }

  componentDidMount = () => {
    this.getTestQuestions();
  }

  render() {
    return (
      <View style={styles.main_wrapper}>
        <View style={styles.header} >
          <Image source={require('../../assets/logo.png')} style={styles.header_logo} ></Image>
        </View>
        <ScrollView style={styles.content} >
          <View>
            <Text style={styles.title} >{this.state.campaign.name}</Text>
            <Text style={styles.subtitle} >{this.state.campaign.description}</Text>
            { this.state.test_questions.map((question, key) => this.createQuestion(question, key) )}
          </View>
        </ScrollView>
        <View style={styles.bottom_bar} >
          <Text style={styles.error_text} >{this.state.error}</Text>
          <TouchableOpacity style={styles.save_button} onPress={() => {this.saveTestAnswers()}} >
            <Text style={styles.save_text} >{i18n.t('Save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.send_button} onPress={() => {this.submitTestAnswers()}} >
            <Text style={styles.send_text} >{i18n.t('Send')}</Text>
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
  title: {
    fontSize: 25, color: "rgb(30, 30, 30)", fontWeight: "700",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 15, color: "rgb(30, 30, 30)", fontWeight: "300",
    marginBottom: 15
  },
  each_test_question: {
    marginBottom: 20
  },
  each_question_text: {
    fontSize: 15, fontWeight: "600", color: "rgb(30, 30, 30)",
    marginBottom: 10
  },
  each_question_input: {
    backgroundColor: "rgb(254, 254, 254)", height: 120, width: "100%",
    borderColor: "rgb(236, 236, 236)", borderWidth: 2, borderRadius: 15,
    padding: 10, paddingTop: 10, textAlignVertical: "top"
  },
  each_choice: {
    flexDirection: "row", alignItems: "center", marginTop: 5,
    marginLeft: 10
  },
  choice_text: {
    fontSize: 15, color: "rgb(30, 30, 30)", fontWeight: "300"
  },
  radio_choice_button: {
    width: 16, height: 16, borderRadius: 8, marginRight: 5,
    borderWidth: 2, borderColor: "rgb(236, 236, 236)", backgroundColor: "rgb(254, 254, 254)"
  },
  radio_choice_button_selected: {
    width: 16, height: 16, borderRadius: 8, marginRight: 5,
    backgroundColor: "rgb(80, 177, 238)", justifyContent: "center", alignItems: "center"
  },
  radio_choice_seleted: {
    height: 6, width: 6, borderRadius: 3, backgroundColor: "rgb(254, 254, 254)"
  },
  checked_choice_button: {
    width: 16, height: 16, borderRadius: 2, marginRight: 5,
    borderWidth: 2, borderColor: "rgb(236, 236, 236)", backgroundColor: "rgb(254, 254, 254)"
  },
  checked_choice_button_selected: {
    width: 16, height: 16, borderRadius: 2, marginRight: 5,
    backgroundColor: "rgb(80, 177, 238)", justifyContent: "center", alignItems: "center"
  },
  error_text: {
    flex: 1, overflow: "hidden",
    color: "rgb(240, 84, 79)", fontSize: 15, fontWeight: "600"
  },
  save_button: {
    paddingLeft: 20, paddingRight: 20, backgroundColor: "rgb(254, 254, 254)",
    borderColor: "rgb(80, 177, 238)", borderWidth: 2, borderRadius: 20, height: 40,
    justifyContent: "center"
  },
  save_text: {
    color: "rgb(80, 177, 238)", fontSize: 15, fontWeight: "600"
  },
  send_button: {
    paddingLeft: 20, paddingRight: 20, backgroundColor: "rgb(254, 254, 254)",
    borderColor: "rgb(240, 84, 79)", borderWidth: 2, borderRadius: 20, height: 40,
    justifyContent: "center", marginLeft: 10
  },
  send_text: {
    color: "rgb(240, 84, 79)", fontSize: 15, fontWeight: "600"
  },
  bottom_bar: {
    height: 100, backgroundColor: "rgb(254, 254, 254)",
    borderTopWidth: 2, borderTopColor: "rgb(236, 236, 236)",
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-evenly",
    paddingLeft: 20, paddingRight: 20, paddingTop: 20
  }
});
