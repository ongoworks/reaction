import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";


/**
 * @file ParcelSizeSettings - React Component wrapper for shop default parcel size form displayed in shipping settings
 * @module ParcelSizeSettings
 * @extends Component
*/
class ParcelSizeSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: this.props.getEditFocus() ? true : false,
      size: this.props.size,
      isEditing: false,
      isSaving: false,
      validationStatus: this.props.validation().validate(this.props.size)
    };
    this.handleFieldFocus = this.handleFieldFocus.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCardExpand = this.handleCardExpand.bind(this);
  }

  /**
   * @name handleFieldFocus()
   * @summary Handle input field focus in form
   * @return {function} state for field value
  */
  handleFieldFocus() {
    this.setState({
      isEditing: true
    });
  }

  /**
    * @name handleStateChange()
    * @summary Handle input field change
    * @param {script} event - onChange event when typing in input field
    * @return {function} state for field value
  */
  handleStateChange(event) {
    const { size } = this.state;
    // get target value and remove any space character
    size[event.target.name] = event.target.value.trim();
    this.setState({ size });
  }

  /**
  * @name handleSubmit()
  * @summary Handle form submission
  * @param {script} event - onChange event when typing in input field
  * @return {function} state for field value
  */
  handleSubmit(event) {
    event.preventDefault();
    const { size } = this.state;
    const shopId = Reaction.getShopId();
    this.setState({ isSaving: true });
    const validationStatus = this.props.validation().validate(size);
    if (validationStatus.isValid) {
      this.props.saveDefaultSize(shopId, size, () => {
        this.setState({
          isSaving: false,
          validationStatus: {}
        });
      });
    } else {
      this.setState({
        isSaving: false,
        validationStatus
      });
    }
  }

  /**
  * @name handleCardExpand()
  * @summary Handle card expansion
  * @param {script} event - onChange event when expander is clicked
  * @param {Object} card - card component
  * @param {String} cardName - card name
  * @param {Boolean} isExpanded - boolean value from card component
  * @return {Function} state for field value
  */
  handleCardExpand = (event, card, cardName, isExpanded) => {
    if (this.props.onCardExpand) {
      this.props.onCardExpand(isExpanded ? cardName : undefined);
      this.setState({
        expanded: this.props.getEditFocus() === cardName
      });
    }
  }

  /**
  * renderComponent
  * @method render()
  * @summary React component for displaying default parcel size form
  * @param {Object} props - React PropTypes
  * @property {Boolean} isEditing - show/hide save button
  * @property {Boolean} isSaving - show/hide loading icon on button
  * @property {Object} size - provides parcel weight, lenght, width, and height
  * @return {Node} React node containing form view
  */
  render() {
    const { isEditing, isSaving, size } = this.state;
    // return null if size is undefined
    if (!size) {
      return null;
    }
    return (
      <div className="parcel-setting">
        <Components.CardGroup>
          <Components.Card
            expanded={this.state.expanded}
            name={"parcelSize"}
            onExpand={this.handleCardExpand}
          >
            <Components.CardHeader
              actAsExpander={true}
              i18nKeyTitle="defaultParcelSize.label"
              title="Parcel Size"
            />
            <Components.CardBody expandable={true}>
              <form onSubmit={this.handleSubmit}>
                <Components.TextField
                  label="Weight"
                  type="text"
                  i18nKeyLabel="defaultParcelSize.weight"
                  name="weight"
                  value={size.weight}
                  onChange={this.handleStateChange}
                  onFocus={this.handleFieldFocus}
                  validation={this.state.validationStatus}
                />
                <Components.TextField
                  label="Height"
                  type="text"
                  i18nKeyLabel="defaultParcelSize.height"
                  name="height"
                  value={size.height}
                  onChange={this.handleStateChange}
                  onFocus={this.handleFieldFocus}
                  validation={this.state.validationStatus}
                />
                <Components.TextField
                  label="Width"
                  type="text"
                  i18nKeyLabel="defaultParcelSize.width"
                  name="width"
                  value={size.width}
                  onChange={this.handleStateChange}
                  onFocus={this.handleFieldFocus}
                  validation={this.state.validationStatus}
                />
                <Components.TextField
                  label="Length"
                  type="text"
                  i18nKeyLabel="defaultParcelSize.length"
                  name="length"
                  value={size.length}
                  onChange={this.handleStateChange}
                  onFocus={this.handleFieldFocus}
                  validation={this.state.validationStatus}
                />
                {isEditing &&
                  <Components.Button
                    bezelStyle="solid"
                    status="primary"
                    className="pull-right"
                    type="submit" disabled={isSaving}
                  >
                    { isSaving ?
                      <i className="fa fa-refresh fa-spin" />
                      : <Components.Translation defaultValue="Save" i18nKey="app.save" />
                    }
                  </Components.Button>
                }
              </form>
            </Components.CardBody>
          </Components.Card>
        </Components.CardGroup>
      </div>
    );
  }
}

/**
  * @name ParcelSizeSettings propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Function} getEditFocus provides function that gets edit/focus value in Reaction state
  * @property {Function} onCardExpand provides function that controls card expansion
  * @property {Function} saveDefaultSize provides function / action when form is submitted
  * @property {Object} size provides parcel weight, lenght, width, and height
  * @property {Function} validation provides function that validates form inputs
  * @return {Array} React propTypes
*/

ParcelSizeSettings.propTypes = {
  getEditFocus: PropTypes.func,
  onCardExpand: PropTypes.func,
  saveDefaultSize: PropTypes.func,
  size: PropTypes.object,
  validation: PropTypes.func
};

export default ParcelSizeSettings;
