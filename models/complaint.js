import mongoose from "mongoose";

const complaintschema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        subject: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], 
            default: 'Pending' 
        },
        comments: [
            {
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                adminName: String,
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
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

const Complaint = mongoose.model('Complaint', complaintschema);
export default Complaint;