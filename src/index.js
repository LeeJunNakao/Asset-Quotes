"use strict";

const { seedDefaultUser } = require("../database/seeds/admin/default-admin");
const {
  seedExchanges,
} = require("../database/seeds/exchange/default-exchanges");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    seedDefaultUser(strapi);
    seedExchanges(strapi);
  },
};
