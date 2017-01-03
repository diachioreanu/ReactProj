import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveMed, cancelSaveMed} from './service';
import {registerRightAction, issueToText, getLogger} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('MedEdit');
const MED_EDIT_ROUTE = 'med/edit';

export class MedEdit extends Component {
    static get routeName() {
        return MED_EDIT_ROUTE;
    }

    static get route() {
        return {name: MED_EDIT_ROUTE, title: 'Med Edit', rightText: 'Save'};
    }

    constructor(props) {
        log('constructor');
        super(props);
        this.store = this.props.store;
        const nav = this.props.navigator;
        this.navigator = nav;
        const currentRoutes = nav.getCurrentRoutes();
        const currentRoute = currentRoutes[currentRoutes.length - 1];
        if (currentRoute.data) {
            this.state = {med: {...currentRoute.data}, isSaving: false};
        } else {
            this.state = {med: {text: ''}, isSaving: false};
        }
        registerRightAction(nav, this.onSave.bind(this));
    }

    render() {
        log('render');
        const state = this.state;
        let message = issueToText(state.issue);
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                <Text>Text</Text>
                <TextInput value={state.med.text} onChangeText={(text) => this.updateMedText(text)}></TextInput>
                {message && <Text>{message}</Text>}
            </View>
        );
    }

    componentDidMount() {
        log('componentDidMount');
        this._isMounted = true;
        const store = this.props.store;
        this.unsubscribe = store.subscribe(() => {
            log('setState');
            const state = this.state;
            const medState = store.getState().med;
            this.setState({...state, issue: medState.issue});
        });
    }

    componentWillUnmount() {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        if (this.state.isLoading) {
            this.store.dispatch(cancelSaveMed());
        }
    }

    updateMedText(text) {
        let newState = {...this.state};
        newState.med.text = text;
        this.setState(newState);
    }

    onSave() {
        log('onSave');
        this.store.dispatch(saveMed(this.state.med)).then(() => {
            log('onMedSaved');
            if (!this.state.issue) {
                this.navigator.pop();
            }
        });
    }
}