import http from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { connectDB } from "./config/db";
import logger from "./config/logger";

require("dotenv").config();

const PORT = Number(process.env.PORT) || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";

let server: http.Server;

const startServer = async (): Promise<void> => {
    try {
        logger.info("Starting LMS Backend...");

        await connectDB();

        server = app.listen(PORT, () => {
            logger.info(
                `🚀 Server is running on http://localhost:${PORT} (${NODE_ENV})`
            );
        });

    } catch (error) {
        logger.error("Failed to start server", { error });

        process.exit(1);
    }
};

startServer();

const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    try {
        server?.close(async () => {
            logger.info("HTTP server closed.");

            await mongoose.connection.close();

            logger.info("MongoDB connection closed.");

            process.exit(0);
        });

    } catch (error) {
        logger.error("Error during graceful shutdown", { error });

        process.exit(1);
    }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection", {
        reason,
    });

    gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
        error,
    });

    process.exit(1);
});