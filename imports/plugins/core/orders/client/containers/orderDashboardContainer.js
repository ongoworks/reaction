import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Media, Orders } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import OrderDashboard from "../components/orderDashboard.js";
import {
  PACKAGE_NAME,
  ORDER_LIST_FILTERS_PREFERENCE_NAME,
  ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME,
  shippingStates
} from "../../lib/constants";

const shippingStrings = ["picked", "packed", "labeled", "shipped"];

const OrderHelper =  {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
      // New orders
      case "new":
        query = {
          "workflow.status": "new"
        };
        break;

      // Orders that have been approved
      case "approved":
        query = {
          "workflow.status": "coreOrderWorkflow/processing",
          "billing.paymentMethod.status": "approved"
        };
        break;

      // Orders that have been captured
      case "captured":
        query = {
          "billing.paymentMethod.status": "completed",
          "shipping.shipped": false
        };
        break;

      // Orders that are being processed
      case "processing":
        query = {
          "workflow.status": "coreOrderWorkflow/processing"
        };
        break;

      // Orders that are complete, including all items with complete status
      case "completed":
        query = {
          "workflow.status": "coreOrderWorkflow/completed"
        };
        break;

      case "canceled":
        query = {
          "workflow.status": "coreOrderWorkflow/canceled"
        };
        break;

      default:
    }

    return query;
  }
};

class OrderDashboardContainer extends Component {
  static propTypes = {
    handleMenuClick: PropTypes.func,
    orders: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      orders: props.orders,
      multipleSelect: false,
      shipping: {
        picked: false,
        packed: false,
        labeled: false,
        shipped: false
      },
      renderFlowList: false,
      isLoading: {
        picked: false,
        packed: false,
        labeled: false,
        shipped: false,
        capturePayment: false
      },
      ready: false,
      query: {},
      filter: i18next.t("order.filter.status"),
      className: ""
    };
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      orders: nextProps.orders
    });
  }

  toggleShippingFlowList = () => {
    this.setState({
      renderFlowList: !this.state.renderFlowList
    });
    this.setListItemsToDefault();
  }

  setListItemsToDefault() {
    if (this.state.renderFlowList === false) {
      shippingStrings.forEach((value) => {
        this.setState({
          shipping: {
            [value]: false
          }
        });
      });
    }
  }

  handleMenuClick = (event, value) => {
    const query = OrderHelper.makeQuery(value);

    this.setState({
      query,
      filter: i18next.t(`order.filter.${value}`),
      className: "active"
    });
  }

  clearFilter = () => {
    const query = OrderHelper.makeQuery("");

    this.setState({
      query,
      filter: i18next.t("order.filter.status"),
      className: ""
    });
  }

  handleSelect = (event, isInputChecked, name) => {
    this.setState({
      multipleSelect: false,
      renderFlowList: false
    });
    shippingStrings.forEach((value) => {
      this.setState({
        shipping: {
          [value]: false
        }
      });
    });
    const selectedItemsArray = this.state.selectedItems;

    if (!selectedItemsArray.includes(name)) {
      selectedItemsArray.push(name);
      this.setState({
        selectedItems: selectedItemsArray
      });
    } else {
      const updatedSelectedArray = selectedItemsArray.filter((id) => {
        if (id !== name) {
          return id;
        }
      });
      this.setState({
        selectedItems: updatedSelectedArray
      });
    }
  }

  selectAllOrders = (orders, areAllSelected) => {
    this.setState({
      renderFlowList: false
    });
    shippingStrings.forEach((string) => {
      this.setState({
        shipping: {
          [string]: false
        }
      });
    });
    if (areAllSelected) {
      // if all orders are selected, clear the selectedItems array
      // and set multipleSelect to false
      this.setState({
        selectedItems: [],
        multipleSelect: false
      });
    } else {
      // if there are no selected orders, or if there are some orders that have been
      // selected but not all of them, loop through the orders array and return a
      // new array with order ids only, then set the selectedItems array with the orderIds
      const orderIds = orders.map((order) => {
        return order._id;
      });
      this.setState({
        selectedItems: orderIds,
        multipleSelect: true
      });
    }
  }

  handleClick = (order, startWorkflow = false) => {
    Reaction.setActionViewDetail({
      label: "Order Details",
      i18nKeyLabel: "orderWorkflow.orderDetails",
      data: {
        order: order
      },
      props: {
        size: "large"
      },
      template: "coreOrderWorkflow"
    });

    if (startWorkflow === true) {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
      Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, "processing");
    }

    const id = Reaction.Router.getQueryParam("_id");

    if (id === undefined) {
      Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, order._id);
    } else {
      Reaction.Router.go("dashboard/orders", {}, {
        _id: order._id
      });
    }
  }

  /**
   * Media - find media based on a product/variant
   * @param  {Object} item object containing a product and variant id
   * @return {Object|false} An object contianing the media or false
   */
  handleDisplayMedia = (item) => {
    const variantId = item.variants._id;
    const productId = item.productId;

    const variantImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.productId": productId
    });

    if (variantImage) {
      return variantImage;
    }

    const defaultImage = Media.findOne({
      "metadata.productId": productId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }

  /**
   * shippingStatusUpdateCall
   *
   * @summary set selected order(s) to the provided shipping state
   * @param {Array} selectedOrders - array of selected orders
   * @param {String} status - the shipping status to be set
   * @return {null} no return value
   */
  shippingStatusUpdateCall = (selectedOrders, status) => {
    this.setState({
      isLoading: {
        [status]: true
      }
    });
    let orderText = "order";

    if (selectedOrders.length > 1) {
      orderText = "orders";
    }

    // capitalize the first letter of the shipping status passed in
    // e.g. 'shipped' becomes 'Shipped'.
    // status[0].toUpperCase() capitalizes the first letter of the string
    // status.substr(1).toLowerCase() converts every other letter to lower case
    const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
    let orderCount = 0;

    selectedOrders.forEach((order) => {
      Meteor.call(`orders/shipment${capitalizeStatus}`, order, order.shipping[0], (err) => {
        if (err) {
          Alerts.toast(`An error occured while setting the status: ${err}`, "error");
        } else {
          Meteor.call("orders/updateHistory", order._id, "Shipping state set by bulk operation", status);
        }
        orderCount++;
        if (orderCount === selectedOrders.length) {
          this.setState({
            shipping: {
              [status]: true
            },
            isLoading: {
              [status]: false
            }
          });
          Alerts.alert({
            text: i18next.t("order.orderSetToState", {
              orderNumber: selectedOrders.length,
              orderText: orderText,
              status: status
            }),
            type: "success",
            allowOutsideClick: false
          });
        }
      });
    });
  }

  displayAlert = (selectedOrders, status, options) => {
    // capitalize the first letter of the shipping status passed in
    // e.g. 'shipped' becomes 'Shipped'.
    // status[0].toUpperCase() capitalizes the first letter of the string
    // status.substr(1).toLowerCase() converts every other letter to lower case
    const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
    const alertOptions = options || {};
    let orderText = "order";
    let skippedOrdersText = "is";
    let orderAlreadyInStateText = "Order has";

    if (selectedOrders.length > 1) {
      orderText = "orders";
      orderAlreadyInStateText = "Orders have";
    }

    if (alertOptions.falsePreviousStatuses > 1) {
      skippedOrdersText = "are";
    }

    // if the order(s) want to skip the previous states, display alert
    if (alertOptions.falsePreviousStatuses) {
      Alerts.alert({
        text: i18next.t("order.skippedBulkOrdersAlert", {
          selectedOrders: selectedOrders.length, orderText: orderText, status: capitalizeStatus,
          numberOfSkippedOrders: alertOptions.falsePreviousStatuses, skippedOrdersText: skippedOrdersText,
          skippedState: alertOptions.whichFalseState
        }),
        type: "warning",
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: i18next.t("order.approveBulkOrderAction"),
        cancelButtonText: i18next.t("order.cancelBulkOrderAction")
      }, (setSelected) => {
        if (setSelected) {
          // set status of order(s) if this action is confirmed
          this.shippingStatusUpdateCall(selectedOrders, status);
        }
      });

      // if the order(s) are following proper flow, set the status
    } else if (!alertOptions.falsePreviousStatuses && alertOptions.falseCurrentState) {
      this.shippingStatusUpdateCall(selectedOrders, status);
      // display alert if order(s) are already in this state
    } else if (!alertOptions.falsePreviousStatuses && !alertOptions.falseCurrentState &&
      alertOptions.trueCurrentState) {
      Alerts.alert({
        text: i18next.t("order.orderAlreadyInState", {
          orderText: orderAlreadyInStateText,
          status: status
        })
      });
    }
  }

  displayRegressionAlert = (selectedOrders, ordersToRegress, status, options) => {
    // capitalize the first letter of the shipping status passed in
    // e.g. 'shipped' becomes 'Shipped'.
    // status[0].toUpperCase() capitalizes the first letter of the string
    // status.substr(1).toLowerCase() converts every other letter to lower case
    const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
    const alertOptions = options || {};
    let orderText = "order";

    if (ordersToRegress > 1) {
      orderText = "orders";
    }

    Alerts.alert({
      text: i18next.t("order.bulkOrdersRegressionAlert", {
        ordersToRegress: ordersToRegress, orderText: orderText, status: capitalizeStatus
      }),
      type: "warning",
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: i18next.t("order.approveBulkOrderActionRegression"),
      cancelButtonText: i18next.t("order.cancelBulkOrderAction")
    }, (regress) => {
      if (regress) {
        // if some of the order(s) want to skip the previous state, display warning alert for skipping states
        if (alertOptions.falsePreviousStatuses) {
          this.displayAlert(
            selectedOrders, status,
            {
              whichFalseState: alertOptions.whichFalseState,
              falsePreviousStatuses: alertOptions.falsePreviousStatuses,
              falseCurrentState: alertOptions.falseCurrentState,
              trueCurrentState: alertOptions.trueCurrentState
            }
          );
        } else {
          // set status of order(s) if this action is confirmed
          this.shippingStatusUpdateCall(selectedOrders, status);
        }
      }
    });
  }

  pickedShippingStatus = (selectedOrders, status) => {
    let isNotPicked = 0;
    let isPicked = 0;
    let ordersToRegress = 0;

    selectedOrders.forEach((order) => {
      const orderWorkflow = order.shipping[0].workflow;
      // check if the order(s) are in this state already or in the previous state
      if (orderWorkflow.status === "new") {
        isNotPicked++;
      } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
        isPicked++;
      } else {
        // check if the selected order(s) are being regressed back to this state
        if (orderWorkflow.workflow.includes("coreOrderWorkflow/picked")) {
          ordersToRegress++;
        } else if (!orderWorkflow.workflow.includes("coreOrderWorkflow/picked") &&
        (orderWorkflow.status === "coreOrderWorkflow/packed" ||
        orderWorkflow.status === "coreOrderWorkflow/labeled" ||
        orderWorkflow.status === "coreOrderWorkflow/shipped")) {
          ordersToRegress++;
        }
      }
    });

    // display regression alert if order(s) are being regressed
    if (ordersToRegress) {
      this.displayRegressionAlert(selectedOrders, ordersToRegress, status);

      // set status to 'picked' if order(s) are in the previous state OR
      // display alert if order(s) are already in this state
    } else {
      this.displayAlert(selectedOrders, status,
        { falseCurrentState: isNotPicked,
          trueCurrentState: isPicked
        }
      );
    }
  }

  packedShippingStatus = (selectedOrders, status) => {
    let isNotPicked = 0;
    let isNotPacked = 0;
    let isPacked = 0;
    let ordersToRegress = 0;
    const whichFalseState = shippingStates.picked;

    selectedOrders.forEach((order) => {
      const orderWorkflow = order.shipping[0].workflow;
      // check if the order(s) are in this state already or in one of the previous states
      if (orderWorkflow.status === "new") {
        isNotPicked++;
      } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
        isNotPacked++;
      } else if (orderWorkflow.status === "coreOrderWorkflow/packed") {
        isPacked++;
      } else {
        // check if the selected order(s) are being regressed back to this state
        if (orderWorkflow.workflow.includes("coreOrderWorkflow/packed")) {
          ordersToRegress++;
        } else if (!orderWorkflow.workflow.includes("coreOrderWorkflow/packed") &&
          (orderWorkflow.status === "coreOrderWorkflow/labeled" ||
          orderWorkflow.status === "coreOrderWorkflow/shipped")) {
          ordersToRegress++;
        }
      }
    });

    // display regression alert if order(s) are being regressed
    if (ordersToRegress) {
      this.displayRegressionAlert(selectedOrders, ordersToRegress, status,
        { whichFalseState,
          falsePreviousStatuses: isNotPicked,
          falseCurrentState: isNotPacked,
          trueCurrentState: isPacked
        }
      );

      // display proper alert if the order(s) are in this state already or want to skip the previous states
    } else {
      this.displayAlert(selectedOrders, status,
        { whichFalseState,
          falsePreviousStatuses: isNotPicked,
          falseCurrentState: isNotPacked,
          trueCurrentState: isPacked
        }
      );
    }
  }

  labeledShippingStatus = (selectedOrders, status) => {
    let isNotPacked = 0;
    let isNotLabeled = 0;
    let isLabeled = 0;
    let ordersToRegress = 0;
    let whichFalseState = "";

    selectedOrders.forEach((order) => {
      const orderWorkflow = order.shipping[0].workflow;
      // check if the order(s) are in this state already or in one of the previous states
      if (orderWorkflow.status === "new") {
        isNotPacked++;
        whichFalseState = shippingStates.picked;
      } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
        isNotPacked++;
        whichFalseState = shippingStates.packed;
      } else if (orderWorkflow.status === "coreOrderWorkflow/packed") {
        isNotLabeled++;
      } else if (orderWorkflow.status === "coreOrderWorkflow/labeled") {
        isLabeled++;
      } else {
        // check if the selected order(s) are being regressed back to this state
        if (orderWorkflow.workflow.includes("coreOrderWorkflow/labeled") ||
        orderWorkflow.status === "coreOrderWorkflow/shipped") {
          ordersToRegress++;
        }
      }
    });

    // display regression alert if order(s) are being regressed
    if (ordersToRegress) {
      this.displayRegressionAlert(
        selectedOrders, ordersToRegress, status,
        { whichFalseState,
          falsePreviousStatuses: isNotPacked,
          falseCurrentState: isNotLabeled,
          trueCurrentState: isLabeled }
      );

      // display proper alert if the order(s) are in this state already or want to skip the previous states
    } else {
      this.displayAlert(selectedOrders, status,
        { whichFalseState,
          falsePreviousStatuses: isNotPacked,
          falseCurrentState: isNotLabeled,
          trueCurrentState: isLabeled
        }
      );
    }
  }


  shippedShippingStatus = (selectedOrders, status) => {
    let isNotLabeled = 0;
    let isNotShipped = 0;
    let isShipped = 0;
    let whichFalseState = "";

    selectedOrders.forEach((order) => {
      const orderWorkflow = order.shipping[0].workflow.status;
      // check if the order(s) are in this state already or in one of the previous states
      if (orderWorkflow === "new") {
        isNotLabeled++;
        whichFalseState = shippingStates.picked;
      } else if (orderWorkflow === "coreOrderWorkflow/picked") {
        isNotLabeled++;
        whichFalseState = shippingStates.packed;
      } else if (orderWorkflow === "coreOrderWorkflow/packed") {
        isNotLabeled++;
        whichFalseState = shippingStates.labeled;
      } else if (orderWorkflow === "coreOrderWorkflow/labeled") {
        isNotShipped++;
      } else if (orderWorkflow === "coreOrderWorkflow/shipped") {
        isShipped++;
      }
    });

    // display proper alert if the order(s) are in this state already or want to skip the previous states
    this.displayAlert(selectedOrders, status,
      { whichFalseState,
        falsePreviousStatuses: isNotLabeled,
        falseCurrentState: isNotShipped,
        trueCurrentState: isShipped
      }
    );
  }

  /**
   * setShippingStatus
   *
   * @summary call the relevant method based on the provided shipping status
   * @param {String} status - the selected shipping status to be set
   * @param {Array} selectedOrdersIds - array of ids of the selected orders
   * @return {null} no return value
   */
  setShippingStatus = (status, selectedOrdersIds) => {
    this.setState({
      renderFlowList: true
    });
    const selectedOrders = this.state.orders.filter((order) => {
      return selectedOrdersIds.includes(order._id);
    });

    if (status === "picked") {
      this.pickedShippingStatus(selectedOrders, status);
    }

    if (status === "packed") {
      this.packedShippingStatus(selectedOrders, status);
    }

    if (status === "labeled") {
      this.labeledShippingStatus(selectedOrders, status);
    }

    if (status === "shipped") {
      this.shippedShippingStatus(selectedOrders, status);
    }
  }

  handleBulkPaymentCapture = (selectedOrdersIds) => {
    this.setState({
      isLoading: {
        capturePayment: true
      }
    });
    const selectedOrders = this.state.orders.filter((order) => {
      return selectedOrdersIds.includes(order._id);
    });

    let orderCount = 0;

    selectedOrders.forEach((order) => {
      Meteor.call("orders/approvePayment", order, (err) => {
        if (err) {
          this.setState({
            isLoading: {
              capturePayment: false
            }
          });
          Alerts.toast(`An error occured while approving the payment: ${err}`, "error");
        } else {
          Meteor.call("orders/capturePayments", order._id, (error) => {
            if (error) {
              this.setState({
                isLoading: {
                  capturePayment: false
                }
              });
              Alerts.toast(`An error occured while capturing the payment: ${error}`, "error");
            }

            if (order.workflow.status === "new") {
              Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
            }

            orderCount++;
            if (orderCount === selectedOrders.length) {
              this.setState({
                isLoading: {
                  capturePayment: false
                }
              });
              Alerts.alert({
                text: i18next.t("order.paymentCaptureSuccess"),
                type: "success",
                allowOutsideClick: false
              });
            }
          });
        }
      });
    });
  }

  render() {
    return (
      <OrderDashboard
        handleSelect={this.handleSelect}
        orders={this.state.orders}
        query={this.state.query}
        filter={this.state.filter}
        className={this.state.className}
        clearFilter={this.clearFilter}
        handleClick={this.handleClick}
        displayMedia={this.handleDisplayMedia}
        selectedItems={this.state.selectedItems}
        selectAllOrders={this.selectAllOrders}
        multipleSelect={this.state.multipleSelect}
        handleMenuClick={this.handleMenuClick}
        setShippingStatus={this.setShippingStatus}
        shipping={this.state.shipping}
        isLoading={this.state.isLoading}
        renderFlowList={this.state.renderFlowList}
        toggleShippingFlowList={this.toggleShippingFlowList}
        handleBulkPaymentCapture={this.handleBulkPaymentCapture}
      />
    );
  }
}

const composer = (props, onData) => {
  const mediaSubscription = Meteor.subscribe("Media");
  const ordersSubscription = Meteor.subscribe("CustomPaginatedOrders");

  if (mediaSubscription.ready() && ordersSubscription.ready()) {
    const orders = Orders.find().fetch();

    onData(null, {
      orders
    });
  }
};

export default composeWithTracker(composer, Loading)(OrderDashboardContainer);
