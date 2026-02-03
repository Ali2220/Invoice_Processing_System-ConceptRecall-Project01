import mongoose from "mongoose";

async function connectDB() {
  await mongoose
    .connect("mongodb://localhost:27017/invoice-processing")
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
}

export default connectDB;
