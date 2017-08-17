import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent, withPermissions } from "@reactioncommerce/reaction-components";

const GroupsTableButton = ({ account, group, handleRemoveUserFromGroup, hasPermissions }) => {
  if (group.slug === "owner") {
    return null;
  }

  if (!hasPermissions) {
    return null;
  }

  return (
    <div className="group-table-button">
      <Components.Button
        status="danger"
        onClick={handleRemoveUserFromGroup(account, group._id)}
        bezelStyle="solid"
        i18nKeyLabel="admin.groups.remove"
        label="Remove"
      />
    </div>
  );
};

GroupsTableButton.propTypes = {
  account: PropTypes.object,
  group: PropTypes.object, // current group in interation
  handleRemoveUserFromGroup: PropTypes.func,
  hasPermissions: PropTypes.bool
};

registerComponent("GroupsTableButton", GroupsTableButton, withPermissions({ roles: ["accounts"] }));

export default GroupsTableButton;
