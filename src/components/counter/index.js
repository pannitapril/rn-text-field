/* eslint-disable react/require-default-props */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import styles from './styles';

export default class Counter extends PureComponent {
  static propTypes = {
    count: PropTypes.number.isRequired,
    limit: PropTypes.number,

    fontSize: PropTypes.number,

    baseColor: PropTypes.string.isRequired,
    errorColor: PropTypes.string.isRequired,

    style: PropTypes.objectOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
      PropTypes.array,
      PropTypes.object,
    ])),
  };

  render() {
    const {
      count, limit, baseColor, errorColor, fontSize, style,
    } = this.props;

    const textStyle = {
      color: count > limit ? errorColor : baseColor,
      fontSize,
    };

    if (!limit) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Text style={[styles.text, style, textStyle]}>
          `${count} / ${limit}`
        </Text>
      </View>
    );
  }
}
