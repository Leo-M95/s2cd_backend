import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    email:{
        type : String,
        required:true,
        unique:true
    },
    firstName:{
        type : String,
        required: true
    },
    lastName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        default:"Customer"
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender:{
        type:String,
        required:true,
    },
    profilePic:{
        type:String,
        required:false,
        default:"https://avatar.iran.liara.run/public/boy?username=Ash"
    },
    isBlocked:{
        type:Boolean,
        required:true,
        default:false
    }
})
const User = mongoose.model("Users",userSchema)

export default User