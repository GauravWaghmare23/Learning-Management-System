import { Redis } from "ioredis";
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

if(!redisUrl){
    throw new Error("REDIS_URL is not defined in environment variables");
}

export const redis = new Redis(redisUrl);

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});