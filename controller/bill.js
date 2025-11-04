import Bill from "../models/bill.js";
import fs from 'fs';
import path from 'path';

const createBill = async (req, res) => {
  try {
    const { userId, amount, month, description, dueDate } = req.body;

    if (!userId || !amount || !month || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: "userId, amount, month, and dueDate are required" 
      });
    }

    const newBill = await Bill.create({
      userId,
      amount,
      month,
      description: description || 'Monthly Maintenance Fee',
      dueDate,
      status: 'pending'
    });

    await newBill.populate('userId', 'username email flatno');

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill: newBill
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const getUserBills = async (req, res) => {
  try {
    const userId = req.user.id;

    const bills = await Bill.find({ userId })
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      bills
    });
  } catch (error) {
    console.error("Error fetching user bills:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('userId', 'username email flatno')
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      bills
    });
  } catch (error) {
    console.error("Error fetching all bills:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
const uploadPaymentProof = async (req, res) => {
  try {
    const { billId } = req.params;
    const { transactionId, paymentDate } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID is required" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment proof image is required" 
      });
    }

    const bill = await Bill.findById(billId);

    if (!bill) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ 
        success: false, 
        message: "Bill not found" 
      });
    }
    if (bill.userId.toString() !== userId.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }
    if (bill.paymentProof) {
      const oldPath = path.join('./uploads/payments', path.basename(bill.paymentProof));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    bill.paymentProof = req.file.filename;
    bill.transactionId = transactionId;
    bill.paymentDate = paymentDate || new Date();
    bill.uploadedDate = new Date();
    bill.status = 'pending_verification';
    bill.updatedAt = new Date();

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded successfully",
      bill
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error uploading payment proof:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { approved, rejectionReason } = req.body;
    const adminId = req.user.id;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: "Bill not found" 
      });
    }

    if (approved) {
      bill.status = 'paid';
      bill.verifiedBy = adminId;
      bill.verifiedAt = new Date();
    } else {
      bill.status = 'pending';
      bill.rejectionReason = rejectionReason || 'Payment proof rejected';
            if (bill.paymentProof) {
        const filePath = path.join('./uploads/payments', bill.paymentProof);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      bill.paymentProof = null;
      bill.transactionId = null;
    }

    bill.updatedAt = new Date();
    await bill.save();

    await bill.populate('userId', 'username email flatno');

    res.status(200).json({
      success: true,
      message: approved ? "Payment approved" : "Payment rejected",
      bill
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: "Bill not found" 
      });
    }
    if (bill.paymentProof) {
      const filePath = path.join('./uploads/payments', bill.paymentProof);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Bill.findByIdAndDelete(billId);

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export { 
  createBill, 
  getUserBills, 
  getAllBills, 
  uploadPaymentProof, 
  verifyPayment, 
  deleteBill 
};
