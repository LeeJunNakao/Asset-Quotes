'use strict';

/**
 *  asset-quote controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { setErrorResponse } = require("../../../utils/errors-tools");
const { SearchFailed, GenericError } = require("../../../utils/errors");

module.exports = createCoreController('api::asset-quote.asset-quote', ({ strapi }) => ({
    search: async (ctx) => {
        try {
            const { assets, source, date, currency } = ctx.query;
            const parsedAssets = assets.replace(/[\[\]]/g, '').split(",").map(i => i.trim());

            const result = await strapi.service('api::asset-quote.asset-quote').searchAsset({ assetCodes: parsedAssets, source, date, currency });

            return result;
        } catch (error) {
            if (error instanceof GenericError) return setErrorResponse(ctx, error);
            return setErrorResponse(ctx, new SearchFailed());
        }
    },
}));
