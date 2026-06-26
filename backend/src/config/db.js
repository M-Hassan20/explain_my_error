import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8","1.1.1.1"]);

const connectDB = async () => {
    try {
        mongoose.set('autoIndex', false);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;

