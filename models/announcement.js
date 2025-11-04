import mongoose from "mongoose";
const announcementschema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
);
const Announcement= await mongoose.model('Announcement', announcementschema);
export default Announcement;