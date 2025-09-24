import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_DB_USERNAME, MONGO_DB_PASS, MONGO_DB_NAME } = process.env;

if (!MONGO_DB_USERNAME || !MONGO_DB_PASS || !MONGO_DB_NAME) {
  throw new Error("❌ Missing MongoDB environment variables");
}

const MONGO_URI = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASS}@cluster0.z4dlt12.mongodb.net/${MONGO_DB_NAME}`;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error(" MongoDB connection error:", err));

