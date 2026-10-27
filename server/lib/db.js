import mongoose from 'mongoose';
export const connectDB = async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/BL-Chat`);
        console.log("database connected");
    } catch (err) {
        console.log(err);
    }
}