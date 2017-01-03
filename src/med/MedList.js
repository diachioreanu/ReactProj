import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {MedEdit} from './MedEdit';
import {MedView} from './MedView';
import {loadMeds, cancelLoadMeds} from './service';
import {registerRightAction, getLogger, issueToText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('MedList');
const MED_LIST_ROUTE = 'med/list';

export class MedList extends Component {
    static get routeName() {
        return MED_LIST_ROUTE;
    }

    static get route() {
        return {name: MED_LIST_ROUTE, title: 'Med List', rightText: 'New'};
    }

    constructor(props) {
        super(props);
        log('constructor');
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
        this.store = this.props.store;
        const medState = this.store.getState().med;
        this.state = {isLoading: medState.isLoading, dataSource: this.ds.cloneWithRows(medState.items)};
        registerRightAction(this.props.navigator, this.onNewMed.bind(this));
    }

    render() {
        log('render');
        let message = issueToText(this.state.issue);
        return (
            <View style={styles.content}>
                { this.state.isLoading &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                {message && <Text>{message}</Text>}
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={med => (<MedView med={med} onPress={(med) => this.onMedPress(med)}/>)}/>
            </View>
        );
    }

    onNewMed() {
        log('onNewMed');
        this.props.navigator.push({...MedEdit.route});
    }

    onMedPress(med) {
        log('onMedPress');
        this.props.navigator.push({...MedEdit.route, data: med});
    }

    componentDidMount() {
        log('componentDidMount');
        this._isMounted = true;
        const store = this.store;
        this.unsubscribe = store.subscribe(() => {
            log('setState');
            const medState = store.getState().med;
            this.setState({dataSource: this.ds.cloneWithRows(medState.items), isLoading: medState.isLoading});
        });
        store.dispatch(loadMeds());
    }

    componentWillUnmount() {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        if (this.state.isLoading) {
            this.store.dispatch(cancelLoadMeds());
        }
    }
}
