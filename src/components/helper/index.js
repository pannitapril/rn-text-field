/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { View, Animated, Text } from 'react-native';

import styles from './styles';

export default class Helper extends PureComponent {
  static defaultProps = {
    numberOfLines: 1,
  };

  static propTypes = {
    style: PropTypes.objectOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
      PropTypes.array,
      PropTypes.object,
    ])),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  render() {
    const { children, style, ...props } = this.props;

    return (
      <View style={styles.container}>
        <Animated.Text style={[styles.text, style]} {...props}>
          {children}
        </Animated.Text>
      </View>
    );
  }
}
