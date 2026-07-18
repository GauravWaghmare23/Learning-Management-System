import { Redis } from "ioredis";
import logger from "../config/logger";
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

if(!redisUrl){
    logger.warn("REDIS_URL is not defined in environment variables");
    throw new Error("REDIS_URL is not defined in environment variables");
}

export const redis = new Redis(redisUrl);

redis.on("connect", () => {
    logger.info("Redis connected successfully");
    console.log("Redis connected successfully");
});

redis.on("error", (err) => {
    logger.error("Redis connection error:", err);
    console.error("Redis connection error:", err);
});