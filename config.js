const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_CONNECTION_STRING: "mongodb://localhost:27017",
  JWT_SECRET: process.env.JWT_SECRET
};