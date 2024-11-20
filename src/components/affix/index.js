/* eslint-disable default-case */
/* eslint-disable no-bitwise */
/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Animated, Text } from 'react-native';

import styles from './styles';

export default class Affix extends PureComponent {
  static defaultProps = {
    numberOfLines: 1,

    active: false,
    focused: false,
  };

  static propTypes = {
    numberOfLines: PropTypes.number,

    active: PropTypes.bool,
    focused: PropTypes.bool,

    type: PropTypes.oneOf(['prefix', 'suffix']).isRequired,

    fontSize: PropTypes.number.isRequired,
    baseColor: PropTypes.string.isRequired,
    animationDuration: PropTypes.number.isRequired,

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

  constructor(props) {
    super(props);

    const { active, focused } = this.props;

    this.state = {
      opacity: new Animated.Value((active || focused) ? 1 : 0),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { opacity } = prevState;
    const { active, focused, animationDuration } = this.props;

    if ((focused ^ prevProps.focused) || (active ^ prevProps.active)) {
      Animated
        .timing(opacity, {
          toValue: (active || focused) ? 1 : 0,
          duration: animationDuration,
        })
        .start();
    }
  }

  render() {
    const { opacity } = this.state;
    const {
      style, children, type, fontSize, baseColor: color,
    } = this.props;

    const containerStyle = {
      height: fontSize * 1.5,
      opacity,
    };

    const textStyle = {
      color,
      fontSize,
    };

    switch (type) {
      case 'prefix':
        containerStyle.paddingRight = 8;
        textStyle.textAlign = 'left';
        break;

      case 'suffix':
        containerStyle.paddingLeft = 8;
        textStyle.textAlign = 'right';
        break;
    }

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.Text style={[style, textStyle]}>{children}</Animated.Text>
      </Animated.View>
    );
  }
}
