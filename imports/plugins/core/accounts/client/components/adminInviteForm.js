import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { getInvitableGroups, getDefaultUserInviteGroup } from "../helpers/accountsHelper";

class AdminInviteForm extends Component {
  static propTypes = {
    canInviteToGroup: PropTypes.func,
    groups: PropTypes.array
  };

  constructor(props) {
    super(props);
    const { groups } = props;
    const groupsInvitable = getInvitableGroups(groups, this.props.canInviteToGroup);

    this.state = {
      alertId: "admin-invite-form",
      groups: groupsInvitable,
      name: "",
      email: "",
      group: getDefaultUserInviteGroup(groups),
      alertArray: []
    };

    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { groups } = nextProps;
    const groupsInvitable = getInvitableGroups(groups, this.props.canInviteToGroup);

    this.setState({ groups: groupsInvitable, group: getDefaultUserInviteGroup(groups) });
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleGroupSelect = (event, group) => {
    this.setState({ group });
  };

  removeAlert = (oldAlert) => {
    return this.setState({
      alertArray: this.state.alertArray.filter((alert) => !_.isEqual(alert, oldAlert))
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const { name, email, group, alertId } = this.state;

    // if no group is select, show alert that group is required to send invitation
    if (!group._id) {
      return this.setState({
        alertArray: [{
          mode: "danger",
          options: { autoHide: 4000, i18nKey: "accountsUI.error.groupRequired" }
        }]
      });
    }

    const options = { email, name, shopId: Reaction.getShopId(), groupId: group._id  };
    const alertOptions = { placement: alertId, id: alertId, autoHide: 4000 };

    return Meteor.call("accounts/inviteShopMember", options, (error, result) => {
      let message = "";
      if (error) {
        let messageKey;
        if (error.reason === "Unable to send invitation email.") {
          messageKey = "accountsUI.error.unableToSendInvitationEmail";
        } else if (error.reason === "A user with this email address already exists") {
          messageKey = "accountsUI.error.userWithEmailAlreadyExists";
        } else if (error.reason === "cannot directly invite owner") {
          messageKey = "admin.groupsInvite.inviteOwnerError";
        } else if (error.reason === "cannot invite to group") {
          messageKey = "admin.groupsInvite.cannotInvite";
        } else if (error.reason === "") {
          message = error.reason;
        } else {
          messageKey = "accountsUI.error.errorSendingEmail";
        }
        ReactionAlerts.add(message, "danger", Object.assign({}, alertOptions, { i18nKey: messageKey }));
      }

      if (result) {
        this.setState({ name: "", email: "" });
        ReactionAlerts.add(
          null,
          "success",
          Object.assign({}, alertOptions, { i18nKey: "accountsUI.info.invitationSent" })
        );
      }
    });
  }

  renderDropDownButton() {
    const { group } = this.state;

    if (!group._id) {
      return null;
    }
    const buttonElement = (opt) => (
      <Components.Button bezelStyle="solid" label={group.name && _.startCase(group.name)} >
        &nbsp;
        {opt && opt.length && // add icon only if there's a list of options
          <i className="fa fa-chevron-down" />
        }
      </Components.Button>
    );

    // current selected option and "owner" should not show in list options
    const dropOptions = this.state.groups.filter((grp) => grp._id !== group._id);
    if (!dropOptions.length) { return buttonElement(); } // do not use dropdown if only one option

    return (
      <Components.DropDownMenu
        buttonElement={buttonElement(dropOptions)}
        onChange={this.handleGroupSelect}
        attachment="bottom right"
        targetAttachment="top right"
      >
        {dropOptions
          .map((grp, index) => (
            <Components.MenuItem
              key={index}
              label={_.startCase(grp.name)}
              selectLabel={_.startCase(grp.name)}
              value={grp}
            />
          ))}
      </Components.DropDownMenu>
    );
  }

  renderForm() {
    return (
      <div className="admin-invite-form">
        <Components.Alerts placement={this.state.alertId} id={this.state.alertId} onAlertRemove={this.removeAlert} />
        <div className="panel-body">
          <form className="">
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="accountsUI.name"
                label="Name"
                name="name"
                id="member-form-name"
                type="text"
                i18nKeyPlaceholder="admin.groupsInvite.name"
                value={this.state.name}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="accountsUI.email"
                label="Email"
                name="email"
                id="member-form-email"
                type="text"
                i18nKeyPlaceholder="admin.groupsInvite.email"
                value={this.state.email}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group action-select">
              {this.renderDropDownButton()}
              <div className="form-btns add-admin justify">
                <Components.Button
                  status="primary"
                  buttonType="submit"
                  onClick={this.handleSubmit}
                  bezelStyle="solid"
                  i18nKeyLabel="accountsUI.info.sendInvitation"
                  label="Send Invitation"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Components.Card expanded={true}>
        <Components.CardHeader
          actAsExpander={true}
          data-i18n="accountsUI.info.addAdminUser"
          title="Add Admin User"
          id="accounts"
        />
        <Components.CardBody expandable={true}>
          {this.renderForm()}
        </Components.CardBody>
      </Components.Card>
    );
  }
}

registerComponent("AdminInviteForm", AdminInviteForm);

export default AdminInviteForm;
