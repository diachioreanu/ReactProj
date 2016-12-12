'use strict'

import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    Text,
    View
} from 'react-native';

class Root extends Component {

    navigate(routeName) {
        this.props.navigator.push({
            name: routeName
        })
    }

    render() {
        return (
            <View style={styles.container}>
            
            <Text style={styles.title}>Welcome to HorseSpot </Text>

            <TouchableHighlight onPress={this.navigate.bind(this, 'register')} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Register
                    </Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={this.navigate.bind(this, 'login')} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Login
                    </Text>
            </TouchableHighlight>

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

export default Root