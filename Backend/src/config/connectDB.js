import { Sequelize } from "sequelize";

const sequelize = new Sequelize("database_ecom", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("DB connection failed:", error);
  }
};

export default connectDB;
