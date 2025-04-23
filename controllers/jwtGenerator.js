import jwt from "jsonwebtoken";

export default function jwtGenerator(req,res,next){
const tokenString = req.header("Authorization")
if (tokenString!=null) {
    const token = tokenString.replace("Bearer ","")
    jwt.verify (token,"ShaaC2D#BITPJ@2025",
        (err,decoded)=>{
            if (decoded!=null) {
                req.user=decoded
                next()
            }else{
                res.json({
                    message: "Invalid token"
                })
            }
        }
    )
}else{
    next()
}
}