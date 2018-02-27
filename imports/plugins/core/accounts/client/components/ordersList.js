import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";


/**
 * @summary React component to display an array of completed orders
 * @memberof Accounts
 * @extends {Component}
 * @property {Array} allOrdersInfo - array of orders
 * @property {Function} handeleDisplayMedia - function to display order image
 * @property {Boolean} isProfilePage - Profile or non-profile page
 */
class OrdersList extends Component {
  static propTypes = {
    allOrdersInfo: PropTypes.array,
    handleDisplayMedia: PropTypes.func,
    isProfilePage: PropTypes.bool
  }

  render() {
    const { allOrdersInfo, handleDisplayMedia } = this.props;

    if (allOrdersInfo) {
      return (
        <div>
          {allOrdersInfo.map((order) => {
            const orderKey = order.orderId;
            return (
              <Components.CompletedOrder
                key={orderKey}
                shops={order.shops}
                order={order.order}
                orderSummary={order.orderSummary}
                paymentMethods={order.paymentMethods}
                productImages={order.productImages}
                handleDisplayMedia={handleDisplayMedia}
                isProfilePage={this.props.isProfilePage}
              />
            );
          })}
        </div>
      );
    }
    return (
      <div className="alert alert-info">
        <span data-i18n="cartCompleted.noOrdersFound">No orders found.</span>
      </div>
    );
  }
}

export default OrdersList;
