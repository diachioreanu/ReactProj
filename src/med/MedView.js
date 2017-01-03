import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';

export class MedView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableHighlight onPress={() => this.props.onPress(this.props.med)}>
                <View>
                    <Text style={styles.listItem}>{this.props.med.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    listItem: {
        margin: 10,
    }
});