import mongoose from "mongoose";

const cartSchema= new mongoose.Schema(
    {
        userId: {type:String, required:true, unique:true},
        cart: {type: Array, required: true},
        
    },
    {timestamps: true}
)

export default mongoose.model("cart", cartSchema);