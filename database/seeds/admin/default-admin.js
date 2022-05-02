const createUser = async (strapi) => {
  const params = {
    firstname: process.env.DEV_ADMIN_FIRSTNAME,
    lastname: process.env.DEV_ADMIN_LASTNAME,
    username: process.env.DEV_ADMIN_USERNAME,
    password: process.env.DEV_ADMIN_PASSWORD,
    email: process.env.DEV_ADMIN_EMAIL,
    isActive: true,
  };

  const [user] = await strapi.query("admin::user").findMany({
    where: {
      email: params.email,
    },
  });

  if (!user) {
    const superAdminRole = await strapi.services["admin::role"].find({
      name: "Super Admin",
    });

    await strapi.service("admin::user").create({
      ...params,
      roles: superAdminRole.map((role) => role.id),
    });
  }
};

const seedDefaultUser = (strapi) => {
  strapi.db.lifecycles.subscribe({
    models: ["admin::role"],
    afterCreate: (event) => {
      if (event.params.data.name === "Super Admin") {
        createUser(strapi);
      }
    },
  });
};

module.exports = { seedDefaultUser };
