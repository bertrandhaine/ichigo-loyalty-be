import { Sequelize } from "sequelize-typescript";
import { Customers, Orders } from "./models";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  username: "loyalty_user",
  password: "loyalty",
  database: "loyalty_db",
  models: [Customers, Orders],
});

export default sequelize;
