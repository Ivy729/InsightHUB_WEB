const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in backend/.env to run tests");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in backend/.env to run tests");
  }

  require("../server");
  await connectDB();
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
});
