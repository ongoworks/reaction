import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Schemas } from "@reactioncommerce/reaction-collections";
import { Discounts } from "./discounts";
import { registerSchema } from "@reactioncommerce/reaction-collections";

const PackageConfig = Schemas.PackageConfig;

/**
* DiscountsPackageConfig Schema
*/

export const DiscountsPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.rates": {
      type: Object,
      optional: true
    },
    "settings.rates.enabled": {
      type: Boolean,
      optional: true,
      defaultValue: false
    },
    "settings.rates.discounts": {
      type: [Discounts],
      optional: true
    }
  }
]);

registerSchema("DiscountsPackageConfig", DiscountsPackageConfig);
