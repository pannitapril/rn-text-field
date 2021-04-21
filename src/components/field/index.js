import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  Platform,
  ViewPropTypes,
  I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import RN from 'react-native/package.json';

import Line from '../line';
import Label from '../label';
import Affix from '../affix';
import Helper from '../helper';
import Counter from '../counter';

import styles from './styles';


const DEFAULT_ICON_SIZE_PROPORTION = 1.50;

export default class TextField extends PureComponent {
  constructor(props) {
    super(props);

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onPress = this.focus.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);
    this.onFocusAnimationEnd = this.onFocusAnimationEnd.bind(this);

    this.updateRef = this.updateRef.bind(this, 'input');

    const { value, error, fontSize } = this.props;

    this.mounted = false;
    this.state = {
      text: value,

      focus: new Animated.Value(this.focusState(error, false)),
      focused: false,
      receivedFocus: false,

      error,
      errored: !!error,

      height: fontSize * 1.5,
      secureTextEntry: this.props.secureTextEntry,
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { error, animationDuration: duration } = prevProps;
    const { focus, focused } = prevState;
    const { props, state } = this;

    // eslint-disable-next-line no-bitwise
    if (props.error !== error || focused ^ state.focused) {
      const toValue = this.focusState(props.error, state.focused);

      Animated
        .timing(focus, { toValue, duration })
        .start(this.onFocusAnimationEnd);

      return toValue;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { error } = prevState;
    const { props } = this;

    if (prevProps.value !== this.props.value) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ text: props.value });
    }

    if (props.error && props.error !== error) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ error: props.error });
    }

    if (prevProps.error !== props.error) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ errored: !!props.error });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  // eslint-disable-next-line react/sort-comp
  updateRef(name, ref) {
    this[name] = ref;
  }

  // eslint-disable-next-line class-methods-use-this
  focusState(error, focused) {
    if (error) { return -1; }
    if (focused) { return 1; }
    return 0;
  }

  onPressShowPassword = () => {
    this.setState(prevState => ({ secureTextEntry: !prevState.secureTextEntry }));
  }

  focus() {
    const { disabled, editable } = this.props;

    if (!disabled && editable) {
      this.input.focus();
    }
  }

  blur() {
    this.input.blur();
  }

  clear() {
    this.input.clear();

    /* onChangeText is not triggered by .clear() */
    this.onChangeText('');
  }

  value() {
    const { text, receivedFocus } = this.state;
    const { value, defaultValue } = this.props;

    return (receivedFocus || value != null || defaultValue == null)
      ? text
      : defaultValue;
  }

  isFocused() {
    return this.input.isFocused();
  }

  isRestricted() {
    const { characterRestriction } = this.props;
    const { text = '' } = this.state;

    return characterRestriction < text.length;
  }

  onFocus(event) {
    const { onFocus, clearTextOnFocus } = this.props;

    if (typeof onFocus === 'function') {
      onFocus(event);
    }

    if (clearTextOnFocus) {
      this.clear();
    }

    this.setState({ focused: true, receivedFocus: true });
  }

  onBlur(event) {
    const { onBlur } = this.props;

    if (typeof onBlur === 'function') {
      onBlur(event);
    }

    this.setState({ focused: false });
  }

  onChange(event) {
    const { onChange, multiline } = this.props;

    if (typeof onChange === 'function') {
      onChange(event);
    }

    /* XXX: onContentSizeChange is not called on RN 0.44 and 0.45 */
    if (multiline && Platform.OS === 'android') {
      if (/^0\.4[45]\./.test(RN.version)) {
        this.onContentSizeChange(event);
      }
    }
  }

  onChangeText(text) {
    const { onChangeText } = this.props;

    this.setState({ text });

    if (typeof onChangeText === 'function') {
      onChangeText(text);
    }
  }

  onContentSizeChange(event) {
    const { onContentSizeChange, fontSize } = this.props;
    const { height } = event.nativeEvent.contentSize;

    if (typeof onContentSizeChange === 'function') {
      onContentSizeChange(event);
    }

    this.setState({
      height: Math.max(
        fontSize * 1.5,
        Math.ceil(height) + Platform.select({ ios: 5, android: 1 }),
      ),
    });
  }

  onFocusAnimationEnd() {
    if (this.mounted) {
      this.setState((state, { error }) => ({ error }));
    }
  }

  renderAccessory() {
    const { renderAccessory } = this.props;

    if (typeof renderAccessory !== 'function') {
      return null;
    }

    return (
      <View style={styles.accessory}>
        {renderAccessory()}
      </View>
    );
  }

  renderCustomIcon = (iconName, size, color, onPress) => (
    <Icon
      name={iconName}
      size={size}
      onPress={onPress}
      color={color}
    />
  )

  renderSecureTextIcon({ fontSize, color }) {
    const { secureTextEntry } = this.props;
    const iconName = this.state.secureTextEntry ? 'eye' : 'eye-off';
    if (secureTextEntry) {
      return this.renderCustomIcon(
        iconName,
        fontSize * DEFAULT_ICON_SIZE_PROPORTION,
        color,
        this.onPressShowPassword,
      );
    }
    return null;
  }

  renderAffix(type, active, focused) {
    const {
      [type]: affix,
      fontSize,
      baseColor,
      animationDuration,
      affixTextStyle,
    } = this.props;

    if (affix == null) {
      return null;
    }

    const props = {
      type,
      active,
      focused,
      fontSize,
      baseColor,
      animationDuration,
    };

    return (
      <Affix style={affixTextStyle} {...props}>{affix}</Affix>
    );
  }

  render() {
    console.log('render');
    const {
      receivedFocus, focus, focused, error, errored, text = '',
    } = this.state;
    const {
      style: inputStyleOverrides,
      label,
      title,
      defaultValue,
      characterRestriction: limit,
      editable,
      disabled,
      disabledLineType,
      disabledLineWidth,
      animationDuration,
      fontSize,
      titleFontSize,
      labelFontSize,
      labelHeight,
      labelPadding,
      inputContainerPadding,
      labelTextStyle,
      titleTextStyle,
      tintColor,
      baseColor,
      textColor,
      errorColor,
      lineWidth,
      activeLineWidth,
      containerStyle,
      inputContainerStyle: inputContainerStyleOverrides,
      clearTextOnFocus,
      suffixIconName,
      iconSizeProportion,
      ...props
    } = this.props;

    let { value } = this.props;
    let { height } = this.state;

    if (props.multiline && props.height) {
      /* Disable autogrow if height is passed as prop */
      const { height: propHeight } = props;
      height = propHeight;
    }

    const defaultVisible = !(receivedFocus || value != null || defaultValue == null);

    value = defaultVisible
      ? defaultValue
      : text;

    const active = !!(value || props.placeholder);
    const count = value.length;
    const restricted = limit < count;

    const textAlign = I18nManager.isRTL
      ? 'right'
      : 'left';

    const borderBottomColor = restricted
      ? errorColor
      : focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [errorColor, baseColor, tintColor],
      });

    const borderBottomWidth = restricted
      ? activeLineWidth
      : focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [activeLineWidth, lineWidth, activeLineWidth],
      });

    const inputContainerStyle = {
      paddingTop: labelHeight,
      paddingBottom: inputContainerPadding,

      ...(disabled
        ? { overflow: 'hidden' }
        : { borderBottomColor, borderBottomWidth }),

      ...(props.multiline
        ? { height: Platform.OS === 'web' ? 'auto' : labelHeight + inputContainerPadding + height }
        : { height: labelHeight + inputContainerPadding + fontSize * 1.5 }),
    };

    const inputStyle = {
      fontSize,
      textAlign,

      color: (disabled || defaultVisible)
        ? baseColor
        : textColor,

      ...(props.multiline
        ? {
          height: fontSize * 1.5 + height,

          ...Platform.select({
            ios: { top: -1 },
            android: { textAlignVertical: 'top' },
          }),
        }
        : { height: fontSize * 1.5 }),
    };

    const errorStyle = {
      color: errorColor,

      opacity: focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [1, 0, 0],
      }),

      fontSize: title
        ? titleFontSize
        : focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [titleFontSize, 0, 0],
        }),
    };

    const titleStyle = {
      color: baseColor,

      opacity: focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 1],
      }),

      fontSize: titleFontSize,
    };

    const helperContainerStyle = {
      flexDirection: 'row',
      height: (title || limit)
        ? titleFontSize * 2
        : focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [titleFontSize * 2, 8, 8],
        }),
    };

    const containerProps = {
      style: containerStyle,
      onStartShouldSetResponder: () => true,
      onResponderRelease: this.onPress,
      pointerEvents: !disabled && editable
        ? 'auto'
        : 'none',
    };

    const inputContainerProps = {
      style: [
        styles.inputContainer,
        inputContainerStyle,
        inputContainerStyleOverrides,
      ],
    };

    const lineProps = {
      type: disabledLineType,
      width: disabledLineWidth,
      color: baseColor,
    };

    const labelProps = {
      baseSize: labelHeight,
      basePadding: labelPadding,
      fontSize,
      activeFontSize: labelFontSize,
      tintColor,
      baseColor: disabled ? baseColor : textColor,
      errorColor,
      animationDuration,
      active,
      focused,
      errored,
      restricted,
      style: labelTextStyle,
    };

    const counterProps = {
      baseColor,
      errorColor,
      count,
      limit,
      fontSize: titleFontSize,
      style: titleTextStyle,
    };

    return (
      <View {...containerProps}>
        <Animated.View {...inputContainerProps}>
          {disabled && <Line {...lineProps} />}

          <Label {...labelProps}>{label}</Label>

          <View style={styles.row}>

            {this.renderAffix('prefix', active, focused)}

            <TextInput
              style={[styles.input, inputStyle, inputStyleOverrides]}
              selectionColor={tintColor}

              {...props}

              editable={!disabled && editable}
              onChange={this.onChange}
              onChangeText={this.onChangeText}
              onContentSizeChange={this.onContentSizeChange}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              value={value}
              ref={this.updateRef}
              secureTextEntry={this.state.secureTextEntry}
            />

            {this.renderAffix('suffix', active, focused)}
            {this.renderAccessory()}
            {!suffixIconName && this.renderSecureTextIcon(inputStyle)}
            {suffixIconName && this.renderCustomIcon(
              suffixIconName,
              fontSize * DEFAULT_ICON_SIZE_PROPORTION,
              inputStyle.color,
            )}

          </View>
        </Animated.View>

        <Animated.View style={helperContainerStyle}>
          <View style={styles.flex}>
            <Helper style={[errorStyle, titleTextStyle]}>{error}</Helper>
            <Helper style={[titleStyle, titleTextStyle]}>{title}</Helper>
          </View>

          <Counter {...counterProps} />
        </Animated.View>
      </View>
    );
  }
}

TextField.propTypes = {
  ...TextInput.propTypes,

  animationDuration: PropTypes.number,

  fontSize: PropTypes.number,
  titleFontSize: PropTypes.number,
  labelFontSize: PropTypes.number,
  labelHeight: PropTypes.number,
  labelPadding: PropTypes.number,
  inputContainerPadding: PropTypes.number,

  labelTextStyle: Text.propTypes.style,
  titleTextStyle: Text.propTypes.style,
  affixTextStyle: Text.propTypes.style,

  tintColor: PropTypes.string,
  textColor: PropTypes.string,
  baseColor: PropTypes.string,

  label: PropTypes.string.isRequired,
  title: PropTypes.string,

  characterRestriction: PropTypes.number,

  error: PropTypes.string,
  errorColor: PropTypes.string,

  lineWidth: PropTypes.number,
  activeLineWidth: PropTypes.number,

  disabled: PropTypes.bool,
  editable: PropTypes.bool,
  disabledLineType: Line.propTypes.type,
  disabledLineWidth: PropTypes.number,

  renderAccessory: PropTypes.func,

  prefix: PropTypes.string,
  suffix: PropTypes.string,

  containerStyle: (ViewPropTypes || View.propTypes).style,
  inputContainerStyle: (ViewPropTypes || View.propTypes).style,
};


TextField.defaultProps = {
  labelTextStyle: {},
  titleTextStyle: {},
  affixTextStyle: {},
  containerStyle: {},
  inputContainerStyle: {},

  title: undefined,
  characterRestriction: undefined,
  error: undefined,
  prefix: undefined,
  suffix: undefined,

  editable: true,

  animationDuration: 225,

  fontSize: 16,
  titleFontSize: 12,
  labelFontSize: 14,
  labelHeight: 32,
  labelPadding: 4,
  inputContainerPadding: 10,

  tintColor: 'rgb(0, 145, 234)',
  textColor: '#000000',
  baseColor: '#949494',

  errorColor: 'rgb(213, 0, 0)',

  lineWidth: StyleSheet.hairlineWidth,
  activeLineWidth: 2,

  disabled: false,
  disabledLineType: 'dotted',
  disabledLineWidth: 1,

  renderAccessory: () => {},
};
