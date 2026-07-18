import mongoose from "mongoose";
import dns from "dns";
import logger from "./logger";

require("dotenv").config();

// Temporary DNS workaround for local Atlas connection issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dbUrl = process.env.MONGO_URI || "";

if (!dbUrl) {
    logger.error("MONGO_URI is not defined in environment variables");
    throw new Error("MONGO_URI is not defined in environment variables");
}

export const connectDB = async (): Promise<void> => {
    try {
        const data = await mongoose.connect(dbUrl);

        logger.info(
            `MongoDB connected successfully: ${data.connection.host}`
        );
    } catch (error) {
        logger.error("MongoDB connection failed", error);

        logger.info("Retrying MongoDB connection in 5 seconds...");

        setTimeout(connectDB, 5000);
    }
};