/* eslint-disable no-nested-ternary */
/* eslint-disable no-bitwise */
/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Animated, Text } from 'react-native';

export default class Label extends PureComponent {
  static defaultProps = {
    numberOfLines: 1,

    active: false,
    focused: false,
    errored: false,
    restricted: false,
  };

  static propTypes = {
    active: PropTypes.bool,
    focused: PropTypes.bool,
    errored: PropTypes.bool,
    restricted: PropTypes.bool,

    baseSize: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
    activeFontSize: PropTypes.number.isRequired,
    basePadding: PropTypes.number.isRequired,

    tintColor: PropTypes.string.isRequired,
    baseColor: PropTypes.string.isRequired,
    errorColor: PropTypes.string.isRequired,

    animationDuration: PropTypes.number.isRequired,

    style: Text.propTypes.style,

    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  constructor(props) {
    super(props);

    this.state = {
      input: new Animated.Value(this.inputState()),
      focus: new Animated.Value(this.focusState()),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { focus, input } = prevState;
    const {
      active, focused, errored, animationDuration: duration,
    } = this.props;

    if (focused ^ prevProps.focused || active ^ prevProps.active) {
      const toValue = this.inputState(this.props);

      Animated
        .timing(input, { toValue, duration })
        .start();
    }

    if (focused ^ prevProps.focused || errored ^ prevProps.errored) {
      const toValue = this.focusState(this.props);

      Animated
        .timing(focus, { toValue, duration })
        .start();
    }
  }

  inputState({ focused, active } = this.props) {
    return active || focused ? 1 : 0;
  }

  focusState({ focused, errored } = this.props) {
    return errored ? -1 : (focused ? 1 : 0);
  }

  render() {
    const { focus, input } = this.state;
    const {
      children,
      restricted,
      fontSize,
      activeFontSize,
      errorColor,
      baseColor,
      tintColor,
      baseSize,
      basePadding,
      style,
      errored,
      active,
      focused,
      animationDuration,
      ...props
    } = this.props;

    const color = restricted
      ? errorColor
      : focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [errorColor, baseColor, tintColor],
      });

    const top = input.interpolate({
      inputRange: [0, 1],
      outputRange: [
        baseSize + fontSize * 0.25,
        baseSize - basePadding - activeFontSize,
      ],
    });

    const textStyle = {
      fontSize: input.interpolate({
        inputRange: [0, 1],
        outputRange: [fontSize, activeFontSize],
      }),

      color,
    };

    const containerStyle = {
      position: 'absolute',
      top,
    };

    return (
      <Animated.View style={containerStyle}>
        <Animated.Text style={[style, textStyle]} {...props}>
          {children}
        </Animated.Text>
      </Animated.View>
    );
  }
}
