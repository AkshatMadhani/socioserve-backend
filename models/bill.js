import mongoose from "mongoose";
const billSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        month: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            default: 'Monthly Maintenance Fee' 
        },
        dueDate: { 
            type: Date, 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['pending', 'pending_verification', 'paid', 'overdue'], 
            default: 'pending' 
        },
        paymentProof: { 
            type: String, 
            default: null 
        },
        transactionId: { 
            type: String, 
            default: null 
        },
        paymentDate: { 
            type: Date, 
            default: null 
        },
        uploadedDate: { 
            type: Date, 
            default: null 
        },
        verifiedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            default: null 
        },
        verifiedAt: { 
            type: Date, 
            default: null 
        },
        rejectionReason: { 
            type: String, 
            default: null 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
        updatedAt: { 
            type: Date, 
            default: Date.now 
        }
    }
);

const Bill = mongoose.model('Bill', billSchema);
export default Bill;