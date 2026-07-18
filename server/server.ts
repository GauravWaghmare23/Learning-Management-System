import mongoose from "mongoose";
import { app } from "./app";
import { connectDB } from "./config/db";
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");

  await mongoose.connection.close();

  process.exit(0);
});