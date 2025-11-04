import mongoose from "mongoose";
const pollSchema = new mongoose.Schema(
    {
        question: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            default: '' 
        },
        options: [
            {
                text: { 
                    type: String, 
                    required: true 
                },
                votes: { 
                    type: Number, 
                    default: 0 
                },
                voters: [
                    { 
                        type: mongoose.Schema.Types.ObjectId, 
                        ref: 'User' 
                    }
                ]
            }
        ],
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['active', 'closed'], 
            default: 'active' 
        },
        expiryDate: { 
            type: Date, 
            required: true 
        },
        allowMultiple: { 
            type: Boolean, 
            default: false 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }
);

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;