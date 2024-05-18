import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: (process.env.PORT || 8000) as number,
  POSTGRES_DB_URL: process.env.POSTGRES_DB_URL as string,
  MONGO_DB_URL: process.env.MONGO_DB_URL as string,
};

export default config;
