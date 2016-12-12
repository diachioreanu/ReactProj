'use strict'

import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    AsyncStorage,
    Text,
    View
} from 'react-native';

const TOKEN = 'access_token';

class Login extends Component {
    constructor() {
        super()

        this.state = {
            email: "",
            password: "",
            error: ""
        }
    }

    redirect(routeName, token, userId) {
        this.props.navigator.push({
            name: routeName,
            passProps: {
                accessToken: token,
                userId: userId
            }
        })
    }

    async storeToken(accessToken) {
        try {
            await AsyncStorage.setItem(TOKEN, accessToken);
            this.getToken();
        } catch(error)
        {
            console.log('smth went wrong');
        }
    }

    async storeId(id) {
        try {
            await AsyncStorage.setItem(ID, id);
        } catch(error)
        {
            console.log('smth went wrong');
        }
    }

    async getToken() {
        try {
            let token = await AsyncStorage.getItem(TOKEN);
            console.log('res token' + token);
        } catch(error)
        {
            console.log('smth went wrong');
        }
    }

    async removeToken() {
        try {
            await AsyncStorage.removeItem(TOKEN);
            this.getToken();
        } catch(error)
        {
            console.log('smth went wrong');
        }
    }

    async onLoginPressed() {
        try {
            let response = await fetch('http://192.168.56.1/lastchance/api/account/login', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                Email: this.state.email,
                                Password: this.state.password
                            })
        
            });
            console.log(this.state.email);
            let res = await response.json();

            if (response.status >= 200 && response.status < 300) {
                this.setState({error: ""});
                let accessToken = res.Token;
                let userId = res.Id;
                this.storeToken(accessToken);
                this.storeId(userId);
                console.log("res success is: " + accessToken);
                this.redirect('home', accessToken, userId);
            } else {
                let errors = res.Message;
                throw errors;
            }

        } catch (errors) {
            this.setState({error: errors});
            this.removeToken();
            console.log("catch errors: " + errors);
        }
    }

    render() {

        return (
            <View style={styles.container}>
                <TextInput 
                    onChangeText={(val) => this.setState({email: val})}
                    style={styles.input} placeholder="Email"
                />
                <TextInput 
                    onChangeText={(val) => this.setState({password: val})}
                    style={styles.input} placeholder="Password"
                    secureTextEntry={true}
                />
                <TouchableHighlight onPress={this.onLoginPressed.bind(this)} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Login
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

export default Login