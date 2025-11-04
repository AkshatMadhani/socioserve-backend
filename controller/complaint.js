import Complaint from "../models/complaint.js";
import User from "../models/user.js";

const registerComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.id;

    console.log('📝 Registering complaint for user:', userId);

    if (!subject || !description) {
      return res.status(400).json({ 
        success: false,
        message: "Subject and description are required" 
      });
    }

    const newComplaint = {
      userId: userId, 
      subject,
      description,
      status: "Pending", 
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedComplaint = await Complaint.create(newComplaint);
    await savedComplaint.populate('userId', 'username email flatno');

    console.log('✅ Complaint registered successfully:', savedComplaint._id);

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error("Error registering complaint:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📋 Fetching complaints for user:', userId);

    const complaints = await Complaint.find({ userId: userId })
      .populate("userId", "username email flatno")
      .sort({ createdAt: -1 });

    console.log('✅ Found', complaints.length, 'complaints');

    res.status(200).json({ 
      success: true,
      complaints 
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Resolved", "Closed"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status value. Must be one of: Pending, In Progress, Resolved, Closed" 
      });
    }

    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: "Complaint not found" 
      });
    }

    complaint.status = status;
    complaint.updatedAt = new Date();
    await complaint.save();

    await complaint.populate('userId', 'username email flatno');

    res.status(200).json({ 
      success: true,
      message: "Complaint status updated successfully", 
      complaint 
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "username email flatno")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All complaints fetched successfully",
      total: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching all complaints (admin):", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;
    const adminId = req.user.id;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment text is required" 
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: "Complaint not found" 
      });
    }
    const admin = await User.findById(adminId);

    complaint.comments.push({
      adminId: adminId,
      adminName: admin.username,
      text: text,
      createdAt: new Date()
    });

    complaint.updatedAt = new Date();
    await complaint.save();

    await complaint.populate('userId', 'username email flatno');

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      complaint
    });
  } catch (error) {
    console.log("Error adding comment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findByIdAndDelete(complaintId);

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: "Complaint not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export { 
  registerComplaint, 
  getComplaints, 
  getAllComplaintsAdmin, 
  updateComplaintStatus, 
  addComment,
  deleteComplaint 
};
