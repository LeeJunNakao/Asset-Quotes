const yahooFinance = require('yahoo-finance');
const axios = require('axios');
const { dateToString, dateToMilliseconds, dateToSeconds } = require("../../../utils/parser")
const { InvalidCurrencyError } = require("../../../utils/errors");
const { InexistentAsset } = require('../../../utils/aux-entity');

module.exports = {
    searchB3: async ({ assetCodes, date, currency }) => {
        if (currency !== 'BRL') throw new InvalidCurrencyError();
        const parsedCodes = assetCodes.map(code => `${code}.SA`);

        const result = await yahooFinance.historical({
            symbols: parsedCodes,
        });

        const parsedResult = await strapi.service('api::asset-quote.source-exchange').parseB3Result({ result, date });

        return Object.fromEntries(parsedResult);
    },
    parseB3Result: async ({ result, date }) => {
        const formatKey = (key) => key.split(".")[0];
        const parseAdapter = (fn) => ([key, quotes]) => [key, fn(quotes)];
        const checkAssetValidity = ([key, quotes]) => [key, quotes.length === 0 ? new InexistentAsset(key) : quotes];
        const byDate = i => dateToString(i.date).match(new RegExp(date));
        const selectItemByDate = (quotes) => {
            if (quotes instanceof InexistentAsset) return quotes;

            return quotes.find(byDate) || null
        }
        const formatQuote = (quote) => {
            if (quote instanceof InexistentAsset) return quote;

            return quote ? ({
                date: dateToString(quote.date),
                closePrice: quote.close.toFixed(2),
                currency: 'BRL'
            }) : null
        }
        const formatResponse = (result) => {
            if (result instanceof InexistentAsset) return {
                data: null,
                error: result
            };

            return {
                data: result
            }
        }

        const parsed = Object.entries(result)
            .map(([key, value]) => [formatKey(key), value])
            .map(checkAssetValidity)
            .map(parseAdapter(selectItemByDate))
            .map(parseAdapter(formatQuote))
        // .map(parseAdapter(formatResponse))

        return parsed;
    },
    searchCrypto: async ({ assetCodes, date, currency }) => {
        const promises = assetCodes.map(async code => {
            const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${code}&tsym=${currency}&toTs=${dateToSeconds(date)}&limit=1`);

            if (response.data.Response === 'Error') return [code, new InexistentAsset(code)];

            const quote = response.data.Data.Data[1];
            const parsedDate = new Date(dateToMilliseconds(quote.time));
            const closePrice = quote.close;

            const parsedResponse = {
                date: dateToString(parsedDate),
                closePrice,
                currency,
            }

            return [code, parsedResponse];
        });

        const result = await Promise.all(promises);

        return Object.fromEntries(result)
    },
}