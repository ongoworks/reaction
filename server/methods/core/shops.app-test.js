/* eslint dot-notation: 0 */
import * as Collections from "/lib/collections";
import { createJ$ } from "@sanjo/jasmine-expect";
import { createEnv as createExpectEnv }  from "@sanjo/jasmine-expect";
import { createEnv as createSpyEnv } from "@sanjo/jasmine-spy";
import { Factory } from "meteor/dburles:factory";
import Fixtures from "/server/imports/fixtures";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

Fixtures();

const j$ = createJ$();
const expectEnv = createExpectEnv(j$);
const spyEnv = createSpyEnv(j$);
const spyOn = spyEnv.spyOn;
const expect = expectEnv.expect;


describe("core shop schema", function () {
  beforeEach(function () {
    return Shops.remove({});
  });

  afterEach(function () {
    spyEnv.clearSpies();
  });

  it("should create a new factory shop", function (done) {
    spyOn(Roles, "userIsInRole").and.returnValue(true);
    spyOn(Shops, "insert");
    Factory.create("shop");
    expect(Shops.insert).toHaveBeenCalled();
    return done();
  });
});

describe("core shop methods", function () {
  let shop;
  beforeEach(function () {
    shop = Factory.create("shop");
  });

  afterEach(function () {
    spyEnv.clearSpies();
  });

  describe("shop/createShop", function () {
    beforeEach(function () {
      Shops.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Shops, "insert");
      expect(function () {
        return Meteor.call("shop/createShop");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Shops.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should create new shop for admin for userId and shopObject", function (done) {
      spyOn(Meteor, "userId").and.returnValue("1234678");
      spyOn(Roles, "userIsInRole").and.returnValue(true);

      Meteor.call("shop/createShop", "1234678", shop);

      const newShopCount = Shops.find({name: shop.name}).count();
      expect(newShopCount).toEqual(1);
      return done();
    });

    // it("should create new shop for admin", function (done) {
    //   spyOn(Meteor, "userId").and.returnValue("1234678");
    //   spyOn(Roles, "userIsInRole").and.returnValue(true);
    //
    //   Meteor.call("shop/createShop");
    //
    //   const newShopCount = Shops.find({name: shop.name}).count();
    //   expect(newShopCount).toEqual(1);
    //   return done();
    // });
  });
});
