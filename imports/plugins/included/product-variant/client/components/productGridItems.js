import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";
import GridItemNoticeContainer from "../containers/gridItemNoticeContainer";
import GridItemControlsContainer from "../containers/gridItemControlsContainer";

class ProductGridItems extends Component {
  static propTypes = {
    additionalMedia: PropTypes.func,
    displayPrice: PropTypes.func,
    isMediumWeight: PropTypes.func,
    isSelected: PropTypes.func,
    itemSelectHandler: PropTypes.func,
    media: PropTypes.func,
    pdpPath: PropTypes.func,
    positions: PropTypes.func,
    product: PropTypes.object,
    weightClass: PropTypes.func
  }

  renderPinned() {
    return this.props.positions().pinned ? "pinned" : "";
  }

  renderVisible() {
    return this.props.product.isVisible ? "" : "not-visible";
  }

  renderOverlay() {
    if (this.props.product.isVisible === false) {
      return (
        <div className="product-grid-overlay" />
      );
    }
  }

  renderMedia() {
    if (this.props.media() === false) {
      return (
        <span className="product-image" style={{ backgroundImage: "url('/resources/placeholder.gif')" }} />
      );
    }
    return (
      <span className="product-image" style={{ backgroundImage: `url(${this.props.media().url({ store: "large" })})` }}/>
    );
  }

  renderAdditionalMedia() {
    if (this.props.additionalMedia() !== false) {
      if (this.props.isMediumWeight()) {
        return (
          <div className={`product-additional-images ${this.renderVisible()}`}>
            {this.props.additionalMedia().map((media) => {
              <span className="product-image" style={{ backgroundImage: `url(${media.url({ store: "medium" })})` }} />;
            })}
            {this.renderOverlay()}
          </div>
        );
      }
    }
  }

  renderNotices() {
    return (
      <div className="grid-alerts">
        <GridItemNoticeContainer product={this.props.product} />
        <GridItemControlsContainer product={this.props.product} itemSelectHandler={this.props.itemSelectHandler} />
      </div>

    );
  }

  renderGridContent() {
    return (
      <div className="grid-content">
        <a
          href={this.props.pdpPath()}
          data-event-category="grid"
          data-event-action="product-click"
          data-event-label="grid product click"
          data-event-value={this.props.product._id}
        >
          <div className="overlay">
            <div className="overlay-title">{this.props.product.title}</div>
            <div className="currency-symbol">{formatPriceString(this.props.displayPrice())}</div>
          </div>
        </a>
      </div>
    );
  }

  render() {
    return (
      <li
        className={`product-grid-item ${this.renderPinned()} ${this.props.weightClass()} ${this.props.isSelected()}`}
        data-id={this.props.product._id}
        id={this.props.product._id}
      >
        <span className="product-grid-item-alerts" />

        <a className="product-grid-item-images"
          href={this.props.pdpPath()}
          data-event-category="grid"
          data-event-action="productClick"
          data-event-label="grid product click"
          data-event-value={this.props.product._id}
        >
          <div className={`product-primary-images ${this.renderVisible()}`}>
            {this.renderMedia()}
            {this.renderOverlay()}
          </div>

          {this.renderAdditionalMedia()}
        </a>

        {this.renderNotices()}
        {this.renderGridContent()}
      </li>
    );
  }
}

export default ProductGridItems;
