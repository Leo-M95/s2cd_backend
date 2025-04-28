import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    orderId:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true    
    },
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"pending"
    },
    total:{
        type:Number,
        required:true
    },
    labeledTotal:{
        type:String,
        required:true
    },
    product:[
        {
            productInfo:{
                productId:{
                    type:String,
                    required:true
                },
                productName:{
                    type:String,
                    required:true
                },
                image:[String],
                prepTime:{
                    type:Number,
                    required:true
                },
                labeledPrice:{
                    type:Number,
                    required:true
                },
                price:{
                    type:Number,
                    required:true
                },
                
            },
            quantity:{
                type:Number,
                required:true
            }
            
    
        }
    ],

    date:{
        type: Date,
        default: Date.now
    },

})

const Order = mongoose.model("order",orderSchema)
export default Order