import mongoose from "mongoose";

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI || "MONGO_URI=mongodb+srv://shivamPractice:Utr%401010@cluster0.jianegr.mongodb.net/bohdpeima?retryWrites=true&w=majority";

	if (!mongoUri) {
		throw new Error("Missing MONGO_URI in environment variables");
	}

	await mongoose.connect(mongoUri);
};

export default connectDB;
