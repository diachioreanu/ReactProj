import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    AsyncStorage,
    Text,
    View
} from 'react-native';

const ACCESS_TOKEN = 'access_token';

class Update extends Component {
  constructor(props){
    super(props);

    this.state = {
      firstName: "",
      lastName: "",
      errors: "",
      accessToken: this.props.accessToken,
      userId: this.props.userId
    }
  }

  redirect(routeName, flash) {
    this.props.navigator.push({
      name: routeName,
      passProps: {
        flash: flash
      }
    });
  }

  async onUpdatePressed() {
    this.setState({showProgress: true});
    let userId = this.state.userId;
    let token = this.state.accessToken;
    try {
      let response = await fetch("http://192.168.56.1/lastchance/api/account/edit/"+userId, {
                              method: 'PUT',
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'authToken': token
                              },
                              body: JSON.stringify({
                                  FirstName: this.state.firstName,
                                  LastName: this.state.lastName
                              })
                           });

      let res = await response.text();
      if (response.status >= 200 && response.status < 300) {
          //On success we redirect to home with flash success message
          this.redirect('home', 'Account successfully updated! ')
      } else {
          //Handle errors
          let error = res.Message;
          throw error
      }
    } catch(errors) {
        this.setState({error: errors});
    }
  }
  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>
          Account Details
        </Text>
        <TextInput
          onChangeText={ (text)=> this.setState({firstName: text}) }
          style={styles.input} placeholder="First Name">
        </TextInput>
        <TextInput
          onChangeText={ (text)=> this.setState({lastName: text}) }
          style={styles.input} placeholder="Last Name">
        </TextInput>
        <TouchableHighlight onPress={this.onUpdatePressed.bind(this)} style={styles.button}>
          <Text style={styles.buttonText}>
            Update
          </Text>
        </TouchableHighlight>

        <Text style={styles.error}>
                 {this.state.error}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingTop: 80
  },
  input: {
    height: 50,
    alignSelf: 'stretch',
    marginTop: 10,
    padding: 4,
    fontSize: 18,
    borderColor: '#48bbec'
  },
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center'
  },
  heading: {
    fontSize: 30,
  },
  error: {
    color: 'red',
    paddingTop: 10
  },
  loader: {
    marginTop: 20
  }
});

export default Update;
