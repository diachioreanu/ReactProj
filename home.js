import React, { Component } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableHighlight,
    AsyncStorage,
    Text,
    Alert,
    View
} from 'react-native';

const TOKEN = 'access_token';

class Home extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.userId);
        console.log(this.props.accessToken);
        this.state = {
            accessToken: this.props.accessToken,
            userId: this.props.userId
        }
    }

    redirect(routeName){
    this.props.navigator.push({
      name: routeName,
      passProps: {
        accessToken: this.state.accessToken,
        userId: this.state.userId
      }
    });
  }
  
  async clearStorageToken() {
    try {
        await AsyncStorage.removeItem(TOKEN);
        
    } catch(error) {
        console.log("Something went wrong token");
    }
  }

  async clearStorageId() {
    try {
        await AsyncStorage.removeItem(ID);
        
    } catch(error) {
        console.log("Something went wrong id" + error);
    }
  }

  onLogout(){
    this.clearStorageToken();
    this.clearStorageId();
    this.redirect('root');
  }

  confirmDelete() {
    Alert.alert("Are you sure?", "This action cannot be undone", [
      {text: 'Cancel'}, {text: 'Delete', onPress: () => this.onDelete()}
    ]);
  }

  async onDelete(){
    let token = this.state.accessToken
    let userId = this.state.userId
    try {
      let response = await fetch('http://192.168.27.0/reactservice/api/account/delete/'+userId ,{
                              method: 'DELETE',
                              headers: {
                                'authToken': token
                              },
                            });
        let res = await response.text();
        if (response.status >= 200 && response.status < 300) {
          console.log("success sir: " + res);
          this.onLogout();
        } else {
          let error = res;
          throw error;
        }
    } catch(error) {
        console.log("error: " + error)
    }
  }

    render() {
      let flashMessage;
      if (this.props.flash) {
        flashMessage = <Text style={styles.flash}>{this.props.flash}</Text>
      } else {
        flashMessage = null
      } 

        return(
            <View style={styles.container}>
              {flashMessage}
                <Text style={styles.title}>Welcome User</Text>
                <TouchableHighlight onPress={this.onLogout.bind(this)} style={styles.button}>
                  <Text style={styles.buttonText}>
                    Logout
                  </Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={this.redirect.bind(this, 'update')} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Update Account
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={this.confirmDelete.bind(this)} style={styles.button}>
                    <Text style={styles.buttonText}>
                        Delete Account
                    </Text>
                </TouchableHighlight>           
            </View>

            
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  title: {
    fontSize: 25,
    marginTop: 15,
    marginBottom: 15
  },
  text: {
    marginBottom: 30
  },
  button: {
    height: 50,
    backgroundColor: 'red',
    alignSelf: 'stretch',
    marginTop: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center'
  },
  flash: {
    height: 40,
    backgroundColor: '#00ff00',
    padding: 10,
    alignSelf: 'center',
  },
  loader: {
    marginTop: 20
  }
});

export default Home