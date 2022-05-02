const { exchangesData } = require("./data");

const seedExchanges = async (strapi) => {
  const exchanges = await strapi.query("api::exchange.exchange").findMany({
    where: {
      $or: exchangesData,
    },
  });

  if (exchanges.length !== exchangesData.length) {
    await strapi.query("api::exchange.exchange").deleteMany({
      where: {
        $or: exchangesData,
      },
    });

    await strapi.query("api::exchange.exchange").createMany({
      data: exchangesData,
    });
  }
};

module.exports = { seedExchanges };
