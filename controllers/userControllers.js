import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcrypt";

//function for user registration
export async function registerUser(req,res){
    const hashedPassword = bcrypt.hashSync(req.body.password,10)

    const user =  new User(
        {
        email:req.body.email,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        password:hashedPassword,
        phoneNumber:req.body.phoneNumber,
        role:req.body.role,
        dateOfBirth:req.body.dateOfBirth,
        gender:req.body.gender,
        profilePic:req.body.profilePic
    }
)
    // user.save().then(
    //     ()=>{
    //         res.json({
    //             message:"Your registration was successful"
    //         })
    //     }
    // ).catch(
    //     ()=>{
    //         res.json({
    //             message:"Your registration was unsuccessful"
    //         })
    //     }
    // )
    try { user = await User.save()
        res.json({
            message:"Registration successful"
        })
        
    } catch (err) {
        res.json({
            message:"Registration unsuccessful",
            error : err
        })

    }
}

//function for user login

export async function userLogin(req,res){
    // const email = req.body.email
    // const password=req.body.password

    // User.findOne({email:email}).then(
    //     (user)=>{
    //         if (user==null) {
    //             res.status(404).json({
    //                 message:"User not found"
    //             })                
    //         }else{
    //             const isPasswordCorrect=bcrypt.compareSync(password,user.password)
    //             if (isPasswordCorrect) {
    //                 const token = jwt.sign(
    //                     {
    //                         email:user.email,
    //                         firstName:user.firstName,
    //                         role:user.role,
    //                         profilePic:user.profilePic
    //                     },"ShaaC2D#BITPJ@2025"
    //                 )
    //                 res.json({
    //                     message: "Login Successful",
    //                     token:token
    //                 })
                    
    //             }else{
    //                 res.json({
    //                     message: "Invalid password"
    //                 })
    //             }
    //         }
    //     }
    // )
    const email = req.body.email
    const password=req.body.password
try{
    const user = await User.findOne({email:email})
            if (user==null) {
                res.status(404).json({
                    message:"User not found"
                })                
            }else{
                const isPasswordCorrect=bcrypt.compareSync(password,user.password)
                if (isPasswordCorrect) {
                    const token = jwt.sign(
                        {
                            email:user.email,
                            firstName:user.firstName,
                            role:user.role,
                            profilePic:user.profilePic
                        },"ShaaC2D#BITPJ@2025"
                    )
                    res.json({
                        message: "Login Successful",
                        token:token
                    })
                    
                }else{
                    res.json({
                        message: "Invalid password"
                    })
                }
             }
             
            }catch(err){
                res.json({
                    message:"Something went wrong",
                    error:err
                })

            }
        
}

//is Admin function

export function isAdmin(req) {
 if(req.user==null){
    return false
 }
if (req.user.role!="admin") {
    return false
}
return true
}