import { composeWithTracker } from "/lib/api/compose";
import { ExampleSettingsForm } from "../components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";

const composer = ({}, onData) => {
  const subscription = Meteor.subscribe("Packages");
  // console.log(Reaction.Collections.Packages.update({
  //   name: "example-paymentmethod",
  //   shopId: Reaction.getShopId() }, {
  //     $set: {
  //       settings: {
  //         apiKey: "123456789"
  //       }
  //     }
  //   }));
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData });
  }
};


const ExampleSettingsFormContainer = composeWithTracker(composer, Loading)(ExampleSettingsForm);

export default ExampleSettingsFormContainer;
