import React from 'react'
import PropTypes from 'prop-types'
import {
  Animated,
  Modal,
  View,
  ViewPropTypes,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions
} from 'react-native'
import { SCLAlertHeader, SCLAlertTitle, SCLAlertSubtitle } from '../components'
import { height } from '../helpers/dimensions'
import variables from './../config/variables'

class SCLAlert extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    show: PropTypes.bool,
    cancellable: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    slideAnimationDuration: PropTypes.number,
    overlayStyle: ViewPropTypes.style
  }

  static defaultProps = {
    children: null,
    show: false,
    cancellable: true,
    slideAnimationDuration: 250,
    overlayStyle: {}
  }

  state = {
    show: false, keyboardShow: false
  }

  scrollView = null;

  _keyboardDidShow = this._keyboardDidShow.bind(this);
  _keyboardDidHide = this._keyboardDidHide.bind(this);

  slideAnimation = new Animated.Value(0)

  componentDidMount() {
    this.props.show && this.show()

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.show !== this.state.show) {
      return this[this.props.show ? 'show' : 'hide']()
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ keyboardShow: true }, () => {
      if (this.scrollView !== null) {
        setTimeout(() => {
          this.scrollView.scrollTo({
            y:
              Platform.OS === 'android'
                ? Dimensions.get('window').height * 2
                : Dimensions.get('window').height / 8,
            animated: false
          });
        }, 15);
      }
    });
  }

  _keyboardDidHide() {
    this.setState({ keyboardShow: false }, () => {
      if (this.scrollView !== null) {
        setTimeout(() => {
          this.scrollView.scrollTo({
            y: 0,
            animated: false
          });
        }, 15);
      }
    });
  }

  /**
   * @description get animation interpolation
   * @return { Array }
   */
  get interpolationTranslate() {
    const move = this.slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, height / -5]
    })

    return [{ translateY: move }]
  }

  /**
   * @description show modal
   * @return { Void }
   */
  show = () => {
    this._runAnimationAsync()
    this.setState({ show: true })
  }

  /**
   * @description hide modal
   * @return { Void }
   */
  hide = async () => {
    await this._runAnimationAsync()
    this.setState({ show: false })
  }

  /**
   * @description run slide animation to show action sheet contetn
   * @param { Boolean } show - Show / Hide content
   * @return { Promise }
   */
  _runAnimationAsync = () => {
    return new Promise(resolve => {
      const options = {
        toValue: this.state.show ? 0 : 1,
        duration: this.props.slideAnimationDuration,
        animation: variables.translateEasing
      }

      Animated.timing(this.slideAnimation, options).start(resolve)
    })
  }

  /**
   * @description callback after press in the overlay
   * @return { Void }
   */
  handleOnClose = () => {
    this.props.cancellable && this.props.onRequestClose()
  }

  render() {
    var styleScroll = undefined;
    var keyboardPersistTaps = 'never';
    if (!this.state.keyboardShow) {
      styleScroll = {
        flex: 1,
        flexDirection: 'column',
        marginBottom: 5
      };
    } else {
      keyboardPersistTaps = 'handled';
    }
    return (
      <Modal
        transparent
        animationType="fade"
        visible={this.state.show}
        onRequestClose={this.handleOnClose}>
        <ScrollView
          keyboardShouldPersistTaps={
            keyboardPersistTaps
          }
          contentContainerStyle={{ flex: 1, minHeight: 420 }}
          style={{ flex: 1 }}
          ref={ref => (this.scrollView = ref)}>
          <View style={styles.inner}>
            <TouchableWithoutFeedback onPress={this.handleOnClose}>
              <View style={[styles.overlay, this.props.overlayStyle]} />
            </TouchableWithoutFeedback>
            <View style={styles.contentContainer}>
              <SCLAlertHeader {...this.props} />
              <View style={styles.innerContent}>
                <SCLAlertTitle {...this.props} />
                <SCLAlertSubtitle {...this.props} />
                <View style={styles.bodyContainer}>{this.props.children}</View>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  inner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: variables.containerPadding,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: variables.overlayBackgroundColor,
    justifyContent: 'center',
    zIndex: 100
  },
  contentContainer: {
    zIndex: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    position: 'relative'
  },
  innerContent: {
    padding: variables.gutter,
    paddingTop: variables.gutter * 2,
    borderRadius: variables.baseBorderRadius,
    backgroundColor: variables.baseBackgroundColor,
    width: variables.contentWidth
  },
  bodyContainer: {
    marginTop: variables.gutter,
    justifyContent: 'flex-end'
  }
})

export default SCLAlert
