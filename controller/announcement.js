import Announcement from "../models/announcement.js";
 const newAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newDetails = {
      title,
      description,
      date: new Date(),
    };

    const savedAnnouncement = await Announcement.create(newDetails);

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: savedAnnouncement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ date: -1 }); 
    return res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

 const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ success: false, message: "Announcement ID is required" });
    }

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
      data: deletedAnnouncement,
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export { getAnnouncements,newAnnouncement, deleteAnnouncement };