import React, {PropTypes} from 'react';
import {StyleSheet, Animated} from 'react-native';
import _ from 'lodash';
import {BaseComponent} from '../../commons';
import {Constants} from '../../helpers';
import {Colors} from '../../style';
import View from '../../components/view';

// todo: add finisher animation (check icon animation or something)
// todo: remove deprecated functionality
export default class AnimatedScanner extends BaseComponent {

  static displayName = 'AnimatedScanner';

  static propTypes = {
    /**
     * animated value between 0 and 100
     */
    // progress: PropTypes.object,
    progress: PropTypes.number,
    /**
     * Duration of current break (can be change between breaks)
     */
    duration: PropTypes.number,
    /**
     * scanner opacity
     */
    opacity: PropTypes.number,
    /**
     * scanner background color
     */
    backgroundColor: PropTypes.string,
    /**
     * breakpoint callback - ({progress, isDone}) => {}
     */
    onBreakpoint: PropTypes.func,
    /**
     * should hide the scanner line
     */
    hideScannerLine: PropTypes.bool,
    testID: PropTypes.string,
  };

  static defaultProps = {
    progress: 0,
    duration: 1000,
  }

  constructor(props) {
    super(props);

    this.state = {
      animatedProgress: new Animated.Value(0),
      isDone: false,
    };

    if (!_.isNumber(props.progress)) {
      console.warn('[react-native-ui-lib]! please check out the new api for AnimatedScanner. progress now accepts number instead of Animated Value'); // eslint-disable-line
    }
  }

  componentDidMount() {
    const {progress, duration} = this.props;
    if (progress > 0) {
      this.animate(progress, duration);
    }
  }

  generateStyles() {
    this.styles = createStyles(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {progress} = this.props;
    if (nextProps.progress !== progress) {
      this.animate(nextProps.progress, nextProps.duration);
    }
  }

  componentWillUnmount() {
    this.state.animatedProgress.stopAnimation();
  }

  animate(toValue, duration) {
    const {animatedProgress} = this.state;
    Animated.timing(animatedProgress, {
      toValue,
      duration,
    }).start(({finished}) => {
      if (finished) {
        const isDone = toValue >= 100;
        this.setState({
          isDone,
        });
        _.invoke(this.props, 'onBreakpoint', {progress: toValue, isDone});
      }
    });
  }

  renderNew() {
    const {opacity, backgroundColor, hideScannerLine} = this.props;
    const {isDone, animatedProgress} = this.state;
    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
        <Animated.View
          style={[this.styles.container,
            opacity && {opacity},
            backgroundColor && {backgroundColor},
            {
              right: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['100%', '0%'],
              }),
            },
          ]}
        >
          {!isDone && !hideScannerLine && <View style={this.styles.scanner}/>}
        </Animated.View>
      </View>
    );
  }

  render() {
    if (_.isNumber(this.props.progress)) {
      return this.renderNew();
    }
    // todo: deprecate
    return this.renderOld();
  }

  // todo: deprecate
  renderOld() {
    const {progress, opacity, backgroundColor} = this.props;
    return (
      <Animated.View
        style={[this.styles.container,
          opacity && {opacity},
          backgroundColor && {backgroundColor},
          {
            right: progress.interpolate({
              inputRange: [0, 5, 55, 100],
              outputRange: [Constants.screenWidth, Constants.screenWidth / 2, Constants.screenWidth / 3, 0],
            }),
          },
        ]}
      >
        {JSON.stringify(progress) !== '100' && <View style={this.styles.scanner}/>}
      </Animated.View>
    );
  }
}

function createStyles() {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: Colors.white,
      opacity: 0.9,
    },
    scanner: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.dark50,
    },
  });
}
