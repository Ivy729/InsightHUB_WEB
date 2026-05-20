const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

function waitForMongoConnection(timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("MongoDB connection timeout (check MONGODB_URI in backend/.env)"));
    }, timeoutMs);

    mongoose.connection.once("connected", () => {
      clearTimeout(timer);
      resolve();
    });
    mongoose.connection.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in backend/.env to run tests");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in backend/.env to run tests");
  }

  require("../server");
  await waitForMongoConnection();
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
});
