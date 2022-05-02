module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "asset_price"),
      user: env("DATABASE_USERNAME", "strapi"),
      password: env("DATABASE_PASSWORD", "strapi"),
      ssl:
        process.env.STRAPI_ENVIRONMENT === "dev"
          ? env.bool("DATABASE_SSL", false)
          : {
              rejectUnauthorized: false,
            },
    },
  },
});
