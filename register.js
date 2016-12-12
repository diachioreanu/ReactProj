'use strict'

import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    Text,
    View
} from 'react-native';

class Register extends Component {
    constructor() {
        super();

        this.state = {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            password: "",
            password_confirmation: "",
            errors: [],
        }
    }

    redirect(routeName) {
        this.props.navigator.push({
            name: routeName
        })
    }

    async onRegisterPressed() {
        try {
            let response = await fetch('http://192.168.27.0/reactservice/api/account/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    
                        FirstName: this.state.firstName,
                        LastName: this.state.lastName,
                        PhoneNumber: this.state.phoneNumber,
                        Email: this.state.email,
                        Username: 'aa',
                        Password: this.state.password,
                        ConfirmPassword: this.state.password_confirmation
                    
                })
            });

            let res = await response.text();
        
            if (response.status >= 200 && response.status < 300) {
                console.log("res success is: " + res);
                this.redirect('login');
            } else {
                let errors = res.Message;
                throw errors;
            }

        } catch (errors) {
            this.setState({error: errors});
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
                    onChangeText={(val) => this.setState({firstName: val})}
                    style={styles.input} placeholder="First Name"
                />
                <TextInput 
                    onChangeText={(val) => this.setState({lastName: val})}
                    style={styles.input} placeholder="Last Name"
                />
                <TextInput 
                    onChangeText={(val) => this.setState({phoneNumber: val})}
                    style={styles.input} placeholder="Phone Number"
                />
                <TextInput 
                    onChangeText={(val) => this.setState({password: val})}
                    style={styles.input} placeholder="Password"
                    secureTextEntry={true}
                />
                <TextInput 
                    onChangeText={(val) => this.setState({password_confirmation: val})}
                    style={styles.input} placeholder="Confirm Password"
                    secureTextEntry={true}
                />
                <TouchableHighlight onPress={this.onRegisterPressed.bind(this)} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Register
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

export default Register