import { registerComplaint, getComplaints, getAllComplaintsAdmin, updateComplaintStatus, addComment,deleteComplaint } from "../controller/complaint.js";
import express from "express";
import isAuthenticated from "../middlewares/isauthenticated.js";
import isadmin from "../middlewares/isadmin.js";
const complaintRouter = express.Router();

complaintRouter.post("/register", isAuthenticated, registerComplaint);
complaintRouter.get("/user", isAuthenticated, getComplaints);
complaintRouter.get("/admin", isadmin, getAllComplaintsAdmin);
complaintRouter.put("/update/:complaintId", isadmin, updateComplaintStatus);
complaintRouter.post("/comment/:complaintId", isadmin, addComment); 
complaintRouter.delete("/delete/:complaintId", isadmin,deleteComplaint);

export default complaintRouter;