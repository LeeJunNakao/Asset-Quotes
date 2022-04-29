const { createCoreService } = require('@strapi/strapi').factories;
const yahooFinance = require('yahoo-finance');
const axios = require('axios');
const { dateToString, dateToMilliseconds, dateToSeconds } = require("../../../utils/parser")

module.exports = {
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