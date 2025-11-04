import User from "../models/user.js";

const getuser = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error during admin operation:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteuser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });

  } catch (error) {
    console.error("Error during admin operation:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getuser, deleteuser };
