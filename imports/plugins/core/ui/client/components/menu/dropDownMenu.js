import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Menu,
  Popover
} from "../";

class DropDownMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: undefined,
      isOpen: false
    };
  }

  handleDropdownToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleMenuItemChange = (event, value, menuItem) => {
    this.setState({
      label: menuItem.props.label || value,
      isOpen: false
    });

    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }

  get label() {
    let label = this.state.label;
    Children.forEach(this.props.children, (element) => {
      if (element.props.value === this.props.value) {
        label = element.props.label;
      }
    });

    if (!label) {
      const children = Children.toArray(this.props.children);
      if (children.length) {
        return children[0].props.label;
      }
    }

    return label;
  }

  render() {
    return (
      <Popover
        buttonElement={
          this.props.buttonElement ||
          <Button
            icon="fa fa-chevron-down"
            iconAfter={true}
            label={this.label}
          />
        }
        onClick={this.handleDropdownToggle}
        isOpen={this.state.isOpen}
        attachment={this.props.attachment}
        targetAttachment={this.props.targetAttachment}
      >
        <Menu
          className={this.props.className}
          value={this.props.value}
          onChange={this.handleMenuItemChange}
          style={this.props.menuStyle}
        >
          {this.props.children}
        </Menu>
      </Popover>
    );
  }
}

DropDownMenu.propTypes = {
  attachment: PropTypes.string,
  buttonElement: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  menuStyle: PropTypes.object,
  onChange: PropTypes.func,
  targetAttachment: PropTypes.string,
  translation: PropTypes.shape({
    lang: PropTypes.string
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
};

export default DropDownMenu;
