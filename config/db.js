import mongoose from "mongoose";

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri) {
		throw new Error("Missing MONGO_URI in environment variables");
	}

	await mongoose.connect(mongoUri);
};

export default connectDB;
