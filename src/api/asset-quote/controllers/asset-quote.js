'use strict';

/**
 *  asset-quote controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::asset-quote.asset-quote', ({ strapi }) => ({
    search: async (ctx) => {
        const { assets, source, date, currency } = ctx.query;
        const parsedAssets = assets.replace(/[\[\]]/g, '').split(",");

        const result = await strapi.service('api::asset-quote.asset-quote').searchAsset({ assetCodes: parsedAssets, source, date, currency });

        return result;
    },
}));
