'use strict';

/**
 * asset-price service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const yahooFinance = require('yahoo-finance');
const axios = require('axios');

const dateToString = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const parsedMonth = month < 10 ? `0${month}` : month;
    const parsedDay = day < 10 ? `0${day}` : day;

    return `${year}-${parsedMonth}-${parsedDay}`
}

const findItemByDate = date => i => dateToString(i.date).match(new RegExp(date));
const getItem = (items, date) => key => [key.split(".")[0], items[key].find(findItemByDate(date))]
const parseResponse = ([key, item]) => [key, {
    date: dateToString(item.date),
    closePrice: item.close,
    currency: 'BRL'
}]


module.exports = createCoreService('api::asset-price.asset-price', ({ strapi }) => ({
    searchB3: async ({ assetCodes, date }) => {
        const parsedCodes = assetCodes.map(code => `${code}.SA`);

        const result = await yahooFinance.historical({
            symbols: parsedCodes,
        });

        const parsedResult = Object.keys(result)
            .map(getItem(result, date))
            .map(parseResponse);

        return Object.fromEntries(parsedResult);
    },
    searchCrypto: async ({ assetCodes, date, currency }) => {
        const promises = assetCodes.map(async code => {
            const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${code}&tsym=${currency}&toTs=${new Date(date).getTime()}&limit=1`);

            const firstQuote = response.data.Data.Data[0];

            const parsedDate = new Date(`${firstQuote.time}`.length < 13 ? firstQuote.time * 1000 : firstQuote.time);
            const closePrice = response.data.Data.Data[0].close;

            const parsedResponse = {
                date: dateToString(parsedDate),
                closePrice,
                currency,
            }

            await strapi.service('api::asset-price.asset-price')

            // return Object.fromEntries([code, parsedResponse]);
            return [code, parsedResponse];
        });

        const result = await Promise.all(promises);

        return Object.fromEntries(result)
    },
    searchAsset: async ({ assetCodes, source, date, currency }) => {

        const exchange = await strapi.service('api::asset-price.asset-price').searchExchange(source);


        const quotes = strapi.service('api::asset-price.asset-price').searchQuotes({
            assetCodes, source, date, currency, exchange
        })

        return quotes;

    },
    searchQuotes: async ({ assetCodes, source, date, currency, exchange }) => {
        const promises = assetCodes.map(async code => {
            const quote = await strapi.db.query('api::asset-price.asset-price').findOne({
                select: '*',
                where: { asset: { name: code }, closeDate: date, currency },
            })

            if (quote) return {
                [code]: {
                    date: quote.closeDate,
                    closePrice: quote.closePrice,
                    currency: quote.currency
                }
            }

            const asset = await strapi.service('api::asset-price.asset-price').searchAssetEntity(code, exchange);
            const externalQuote = await strapi.service('api::asset-price.asset-price').searchExternalQuotes({ assetCodes, source, date, currency, exchange })

            await strapi.db.query('api::asset-price.asset-price').create({
                data: {
                    asset,
                    closeDate: date,
                    currency,
                    closePrice: externalQuote[code].closePrice
                }
            })

            return [code, quote || externalQuote]
        })

        return await Promise.all(promises);
    },
    searchExternalQuotes: async (params) => {
        const { source } = params;

        if (source === 'B3') {
            return await strapi.service('api::asset-price.asset-price').searchB3(params)
        }

        if (source === 'crypto') {
            return await strapi.service('api::asset-price.asset-price').searchCrypto(params)
        }
    },
    searchAssetEntity: async (code, exchange) => {
        const asset = await strapi.db.query('api::asset.asset').findOne({
            select: '*',
            where: { name: code }
        })

        if (asset) return asset;

        return await strapi.db.query('api::asset.asset').create({
            data: {
                name: code,
                exchange
            }
        })
    },
    searchExchange: async (source) => {
        const exchange = await strapi.db.query('api::exchange.exchange').findOne({
            select: '*',
            where: { name: source }
        })

        if (exchange) return exchange;

        return await strapi.db.query('api::exchange.exchange').create({
            data: {
                name: source
            }
        })
    }
}));
