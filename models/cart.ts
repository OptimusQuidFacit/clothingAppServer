import mongoose from "mongoose";

const cartSchema= new mongoose.Schema(
    {
        productId: {type: Number, required:true, unique:true},
        userId: {type: String, required:true},
        name: {type: String, required:true,},
        unitPrice:{type: Number, required:true},
        quantity: {type: Number, required:true,},
        total: {type: Number, required:true,},
        size: {type: String, required:true,},
        color: {type: String, required:true,},
        category: {type: Array, required:true,},
        img: {type: Number},
        
    }
)

export default mongoose.model("cart", cartSchema);