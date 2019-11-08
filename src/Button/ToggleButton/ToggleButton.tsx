import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Tooltip
} from 'antd';
import { Icon } from 'react-fa';

import isFunction from 'lodash/isFunction';

import './ToggleButton.less';

import { CSS_PREFIX } from '../../constants';
import { AbstractTooltipProps, TooltipPlacement } from 'antd/lib/tooltip';

interface ToggleButtonDefaultProps {
  type: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger' | 'link';
  /**
   * Additional [antd tooltip](https://ant.design/components/tooltip/)
   * properties to pass to the tooltip component. Note: The props `title`
   * and `placement` will override the props `tooltip` and `tooltipPlacement`
   * of this component!
   */
  tooltipProps: AbstractTooltipProps;
  /**
   * The initial pressed state of the ToggleButton
   */
  pressed: boolean;
  /**
   * The function the gets filtered out
   */
  onClick: () => void;
}

export interface ToggleButtonProps extends Partial<ToggleButtonDefaultProps> {
  className?: string;
  /**
   * The font awesome icon name.
   */
  icon?: string;
  /**
   * The classname of an icon of an iconFont. Use either this or icon.
   */
  fontIcon?: string;
  /**
   * The font awesome icon name.
   */
  pressedIcon?: string;
  /**
   * The tooltip to be shown on hover.
   */
  tooltip?: string;
  /**
   * The position of the tooltip.
   */
  tooltipPlacement?: TooltipPlacement;
  /**
   *
   */
  onToggle: (pressed: boolean, lastClickEvt: any) => void;
}

interface ToggleButtonState {
  pressed: boolean;
  lastClickEvt: any;
  overallPressed: boolean;
  isClicked: boolean;
}

/**
 * The ToggleButton.
 *
 * @class The ToggleButton
 * @extends React.Component
 */
class ToggleButton extends React.Component<ToggleButtonProps, ToggleButtonState> {

  /**
   * The className added to this component.
   * @type {String}
   * @private
   */
  _className = `${CSS_PREFIX}togglebutton`;

  /**
   * The class to apply for a toggled/pressed button.
   * @type {String}
   */
  pressedClass = 'btn-pressed';

  /**
   * The default properties.
   * @type {Object}
   */
  static defaultProps = {
    type: 'primary',
    icon: '',
    pressed: false,
    tooltipProps: {
      mouseEnterDelay: 1.5
    }
  };

  /**
   * The context types.
   * @type {Object}
   */
  static contextTypes = {
    toggleGroup: PropTypes.object
  };

  /**
   * Invoked right before calling the render method, both on the initial mount
   * and on subsequent updates. It should return an object to update the state,
   * or null to update nothing.
   * @param {Object} nextProps The next properties.
   * @param {Object} prevState The previous state.
   */
  static getDerivedStateFromProps(nextProps: ToggleButtonProps, prevState: ToggleButtonState) {

    // Checks to see if the pressed property has changed
    if (prevState.pressed !== nextProps.pressed) {
      return {
        pressed: nextProps.pressed,
        overallPressed: nextProps.pressed,
        isClicked: false,
        lastClickEvt: null
      };
    }
    return null;
  }

  /**
   * Creates the ToggleButton.
   *
   * @constructs ToggleButton
   */
  constructor(props: ToggleButtonProps) {
    super(props);

    // Instantiate the state.
    // components state
    this.state = {
      pressed: props.pressed,
      lastClickEvt: null,
      overallPressed: props.pressed,
      isClicked: false
    };
  }

  /**
   * We will handle the initial state of the button here.
   * If it is pressed, we will have to call its `onToggle`
   * method, if it exists, in order to reflect the initial
   * state correctly (e.g. activating ol.Controls)
   */
  componentDidMount() {
    if (this.props.onToggle && this.props.pressed === true) {
      this.props.onToggle(true, null);
    }
  }

  /**
   * Invoked immediately after updating occurs. This method is not called
   * for the initial render.
   * @method
   */
  componentDidUpdate(prevProps: ToggleButtonProps, prevState: ToggleButtonState) {
    const {
      onToggle
    } = this.props;

    const {
      pressed,
      lastClickEvt,
      overallPressed,
      isClicked
    } = this.state;

    /**
     * the following is performed here as a hack to keep track of the pressed changes.
     *
     * check if the button has been clicked
     * |__ YES: ==> toggle the button
     * |
     * |__ NO: check if the prop has changed
     *        |__ YES: ==> Toggle the button
     *        |__ NO: check if previous update action was a click
     *                |__ YES: ==> run the Toggle function fo the prop value
     */
    let shouldToggle;
    if (isClicked || prevState.pressed !== pressed || prevState.isClicked) {
      if (isClicked) {
        // button is clicked
        shouldToggle = true;
      } else {
        // check for prop change
        if (pressed !== prevState.overallPressed) {
          // pressed prop has changed
          shouldToggle = true;
        } else {
          if (prevState.isClicked) {
            // prop has not changed but the previous was click event
            if (prevState.overallPressed !== overallPressed) {
              shouldToggle = true;
            }
          }
        }
      }
      if (shouldToggle && onToggle) {
        onToggle(overallPressed, lastClickEvt);
      }
    }
  }

  /**
   * Called on click.
   *
   * @param {ClickEvent} evt The ClickEvent.
   * @method
   */
  onClick(evt: any) {
    this.setState({
      overallPressed: !this.state.overallPressed,
      lastClickEvt: evt,
      isClicked: true
    }, () => {
      // This part can be removed in future if the ToggleGroup button is removed.
      if (this.context.toggleGroup && isFunction(this.context.toggleGroup.onChange)) {
        this.context.toggleGroup.onChange(this.props);
        // this allows for the allowDeselect property to be taken into account
        // when used with ToggleGroup. Since the ToggleGroup changes the
        // pressed prop for its child components the click event dose not need to
        // change the pressed property.
        this.setState({overallPressed: !this.state.overallPressed});
      }
    });
  }

  /**
   * The render function.
   */
  render() {
    const {
      className,
      icon,
      pressedIcon,
      fontIcon,
      pressed,
      onToggle,
      tooltip,
      tooltipPlacement,
      tooltipProps,
      ...antBtnProps
    } = this.props;

    const {
      onClick,
      ...filteredAntBtnProps
    } = antBtnProps;

    const finalClassName = className
      ? `${className} ${this._className}`
      : this._className;

    let iconName = icon;
    let pressedClass = '';
    if (this.state.overallPressed) {
      iconName = pressedIcon || icon;
      pressedClass = ` ${this.pressedClass} `;
    }
    return (
      <Tooltip
        title={tooltip}
        placement={tooltipPlacement}
        {...tooltipProps}
      >
        <Button
          className={`${finalClassName}${pressedClass}`}
          onClick={this.onClick.bind(this)}
          {...filteredAntBtnProps}
        >
          <Icon
            name={iconName}
            className={fontIcon}
          />
          {antBtnProps.children}
        </Button>
      </Tooltip>
    );
  }
}

export default ToggleButton;
