'use strict';

/**
 *  asset-price controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::asset-price.asset-price', ({ strapi }) => ({
    search: async (ctx) => {
        const { assets, source, date, currency } = ctx.query;
        const parsedAssets = assets.replace(/[\[\]]/g, '').split(",");

        const result = await strapi.service('api::asset-price.asset-price').searchAsset({ assetCodes: parsedAssets, source, date, currency });

        return result;
    }
}));
