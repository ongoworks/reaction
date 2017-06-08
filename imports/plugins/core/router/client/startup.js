// import { Meteor } from "meteor/meteor";
// import { Tracker } from "meteor/tracker";
// import { Reaction } from "/client/api";
// import { initBrowserRouter } from "./browserRouter";
// import { Router } from "../lib";
//
// Meteor.startup(function () {
//   Tracker.autorun(function () {
//     // initialize client routing
//     if (Reaction.Subscriptions.Packages.ready() && Reaction.Subscriptions.Shops.ready()) {
//       initBrowserRouter();
//     }
//   });
//
//   //
//   // we need to sometimes force
//   // router reload on login to get
//   // the entire layout to rerender
//   // we only do this when the routes table
//   // has already been generated (existing user)
//   //
//   Accounts.onLogin(() => {
//     if (Meteor.loggingIn() === false && Router._routes.length > 0) {
//       initBrowserRouter();
//     }
//   });
// });
import { createRouter, logger } from 'meteor/ssrwpo:ssr';
import App from "../lib/app";

createRouter({
  MainApp: App
});
