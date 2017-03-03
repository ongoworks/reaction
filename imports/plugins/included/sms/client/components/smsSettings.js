import React, { Component, PropTypes } from "react";
import { Button, Card, CardHeader, CardBody, CardGroup, TextField, Select } from "/imports/plugins/core/ui/client/components";

class SmsSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings || {},
      isSaving: false
    };
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleStateChange(e) {
    const { settings } = this.state;
    settings[e.target.name] = e.target.value;
    this.setState({ settings });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { saveSettings } = this.props;
    const { settings } = this.state;
    this.setState({ isSaving: true });
    saveSettings(settings, () => this.setState({ isSaving: false }));
  }

  handleSelect(e) {
    const { settings } = this.state;
    settings["smsProvider"] = e;
    this.setState({ settings });
  }

  handleProductFieldSave = (productId, fieldName, value) => {
    let updateValue = value;
    // special case, slugify handles.
    if (fieldName === "handle") {
      updateValue = Reaction.getSlug(value);
    }
    Meteor.call("products/updateProductField", productId, fieldName, updateValue);
  }


  render() {
    const settings = this.state.settings;
    const isSaving = this.state.isSaving;

    const smsProviders = [{
      label: "Twilio", value: "twilio"
    }, {
      label: "Nexmo", value: "nexmo"
    }];

    return (
      <CardGroup>
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="sms.headers.settings"
            title="SMS Provider"
          />
          <CardBody expandable={true}>
            <form onSubmit={this.handleSubmit}>
              <Select
                clearable={false}
                i18nKeyLabel="productDetailEdit.template"
                i18nKeyPlaceholder="productDetailEdit.templateSelectPlaceholder"
                label="Template"
                name="smsProvider"
                onChange={this.handleSelect}
                options={smsProviders}
                value={settings.smsProvider || ""}
                placeholder="Select a template"
              />
              <hr/>
              <TextField
                label="Sms Phone Number"
                type="text"
                i18nKeyLabel="sms.settings.smsPhone"
                name="smsPhone"
                value={settings.smsPhone || ""}
                onChange={this.handleStateChange}
              />
              <TextField
                label="API Key"
                type="password"
                i18nKeyLabel="sms.settings.apiKey"
                name="apiKey"
                value={settings.apiKey || ""}
                onChange={this.handleStateChange}
              />
              <TextField
                label="API Token/Secret"
                type="password"
                i18nKeyLabel="sms.settings.apiToken"
                name="apiToken"
                value={settings.apiToken || ""}
                onChange={this.handleStateChange}
              />
              <Button
                bezelStyle="solid"
                status="primary"
                className="pull-right"
                type="submit" disabled={isSaving}
              >
                {isSaving ?
                    <i className="fa fa-refresh fa-spin"/>
                  : <span data-i18n="app.save">Save</span>}
              </Button>
            </form>
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

SmsSettings.propTypes = {
  saveSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    apiKey: PropTypes.string,
    apiToken: PropTypes.string,
    smsPhone: PropTypes.string,
    smsProvider: PropTypes.string
  })
};

export default SmsSettings;
