import mongoose from "mongoose";

const cartSchema= new mongoose.Schema(
    {
        productId: {type: Number, required:true, unique:true},
        userId: {type: String, required:true, unique:true},
        name: {type: String, required:true, unique:true},
        unitPrice:{type: Number, required:true, unique:true},
        quantity: {type: Number, required:true, unique:true},
        total: {type: Number, required:true, unique:true},
        size: {type: String, required:true, unique:true},
        color: {type: String, required:true, unique:true},
        category: {type: Array, required:true, unique:true},
    }
)

module.exports = mongoose.model("cart", cartSchema);