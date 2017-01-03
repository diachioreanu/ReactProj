import React, {Component} from 'react';
import {Text, View, Navigator, TouchableOpacity, StyleSheet} from 'react-native';
import {MedList, MedEdit, NotificationClient} from './med';
import {Login} from './auth';
import {getLogger} from './core/utils';

const log = getLogger('Router');

export class Router extends Component {
    constructor(props) {
        log(`constructor`);
        super(props);
        this.store = this.props.store;
    }

    render() {
        log(`render`);
        return (
            <Navigator
                initialRoute={Login.route}
                renderScene={this.renderScene.bind(this)}
                ref={(navigator) => this.navigator = navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={styles.navigationBar}
                        routeMapper={NavigationBarRouteMapper}/>
                }/>
        );
    }

    componentDidMount() {
        log(`componentDidMount`);
    }

    componentWillUnmount() {
        log(`componentWillUnmount`);
    }

    renderScene(route, navigator) {
        log(`renderScene ${route.name}`);
        switch (route.name) {
            case Login.routeName:
                return <Login
                    store={this.store}
                    navigator={navigator}
                    onAuthSucceeded={() => this.onAuthSucceeded()}/>
            case MedEdit.routeName:
                return <MedEdit
                    store={this.store}
                    navigator={navigator}/>
            case MedList.routeName:
            default:
                return <MedList
                    store={this.store}
                    navigator={navigator}/>
        }
    };

    onAuthSucceeded() {
        this.navigator.push(MedList.route);
        if (this.notificationClient) {
            this.notificationClient.disconnect();
        }
        this.notificationClient = new NotificationClient(this.store);
        this.notificationClient.connect();
    }
}

const NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        if (index > 0) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        if (index > 0) navigator.pop();
                    }}>
                    <Text style={styles.leftButton}>Back</Text>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    },
    RightButton(route, navigator, index, navState) {
        if (route.rightText) return (
            <TouchableOpacity
                onPress={() => route.rightAction()}>
                <Text style={styles.rightButton}>
                    {route.rightText}
                </Text>
            </TouchableOpacity>
        )
    },
    Title(route, navigator, index, navState) {
        return (<Text style={styles.title}>{route.title}</Text>)
    }
};

const styles = StyleSheet.create({
    navigationBar: {
        backgroundColor: '#82aaaa',
    },
    leftButton: {
        color: '#ffffff',
        margin: 10,
        fontSize: 17,
    },
    title: {
        paddingVertical: 10,
        color: '#ffffff',
        justifyContent: 'center',
        fontSize: 18
    },
    rightButton: {
        color: 'white',
        margin: 10,
        fontSize: 16
    },
    content: {
        marginTop: 90,
        marginLeft: 20,
        marginRight: 20,
    },
});