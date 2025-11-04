import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const dbcon = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Database connected successfully');
    }
    catch(error)
    {
        console.error('Database connection failed:', error);

    }
}
export default dbcon;