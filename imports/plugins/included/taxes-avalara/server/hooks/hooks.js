import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks } from "/server/api";
import { Cart, Packages } from "/lib/collections";
import taxCalc from "../methods/taxCalc";

MethodHooks.after("taxes/calculate", function (options) {
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  const shopId = cartToCalc.shopId;
  const pkg = Packages.findOne({
    name: "taxes-avalara",
    shopId: shopId,
    enabled: true
  });

  Logger.debug("Avalara triggered on taxes/calculate for cartId:", cartId);
  if (pkg && pkg.settings.avalara) {
    taxCalc.estimateCart(cartToCalc, function (result) {
      if (result) {
        const taxAmount = parseFloat(result.totalTax);
        const taxRate = taxAmount / taxCalc.calcTaxable(cartToCalc);
        Meteor.call("taxes/setRate", cartId, taxRate);
      }
    });
  }
});

MethodHooks.after("cart/copyCartToOrder", function (options) {
  console.log("options", options);
});
