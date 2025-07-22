import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function jwtGenerator(req, res, next) {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        res.json({
          message: "Invalid token",
        });
      }
    });
  } else {
    next();
  }
}
