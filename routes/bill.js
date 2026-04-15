import express from "express";
import isadmin from "../middlewares/isadmin.js";
import isAuthenticated from "../middlewares/isauthenticated.js";
import upload from "../config/multer.js"; 
import { 
  createBill, 
  getUserBills, 
  getAllBills, 
  uploadPaymentProof, 
  verifyPayment, 
  deleteBill,
  demoPayment
} from "../controller/bill.js";

const billRouter = express.Router();

billRouter.get("/user", isAuthenticated, getUserBills);
billRouter.post("/upload-proof/:billId", isAuthenticated, upload.single('paymentProof'), uploadPaymentProof);
billRouter.post("/demo-payment/:billId", isAuthenticated, demoPayment);

billRouter.post("/create", isadmin, createBill);
billRouter.get("/all", isadmin, getAllBills);
billRouter.put("/verify/:billId", isadmin, verifyPayment);
billRouter.delete("/delete/:billId", isadmin, deleteBill);

export default billRouter;