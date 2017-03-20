import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import LineItems from "../components/lineItems.js";

class LineItemsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClosed: false
    };
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.isExpanded = this.isExpanded.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  isExpanded(itemId) {
    if (this.state[`item_${itemId}`]) {
      return true;
    }
    return false;
  }

  handleClose(itemId) {
    event.preventDefault();
    this.setState({
      [`item_${itemId}`]: false
    });
  }

  handleClick(itemId) {
    this.setState({
      [`item_${itemId}`]: true
    });
  }

  handleDisplayMedia(variantObjectOrId) {
    let variantId = variantObjectOrId;

    if (typeof variantId === "object") {
      variantId = variantObjectOrId._id;
    }

    const defaultImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }

    return false;
  }

  render() {
    return (
      <TranslationProvider>
        <LineItems
          onClose={this.handleClose}
          invoice={this.props.invoice}
          isClosed={this.state.isClosed}
          isExpanded={this.isExpanded}
          displayMedia={this.handleDisplayMedia}
          handleClick={this.handleClick}
          uniqueItems={this.props.uniqueItems}
        />
      </TranslationProvider>
    );
  }
}

LineItemsContainer.propTypes = {
  invoice: PropTypes.object,
  uniqueItems: PropTypes.array
};

const composer = (props, onData) => {
  onData(null, {
    uniqueItems: props.items,
    invoice: props.invoice
  });
};

export default composeWithTracker(composer, Loading)(LineItemsContainer);
