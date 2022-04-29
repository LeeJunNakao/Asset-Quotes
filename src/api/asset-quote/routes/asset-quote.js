'use strict';

/**
 * asset-price router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::asset-quote.asset-quote');
