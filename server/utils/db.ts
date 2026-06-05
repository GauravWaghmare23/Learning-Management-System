import mongoose from "mongoose";
require("dotenv").config();
import dns from "dns";

// Temporary DNS workaround for local Atlas connection issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dbUrl = process.env.MONGO_URI || "";

if (!dbUrl) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

export const connectDB = async (): Promise<void> => {
  try {
    const data = await mongoose.connect(dbUrl);

    console.log(
      `MongoDB connected: ${data.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    setTimeout(connectDB, 5000);
  }
};