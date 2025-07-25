import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// 01.To registrater an user

export async function registerUser(req, res) {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender,
      profilePic: req.body.profilePic,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (err) {
    res.status(400).json({
      message: "Registration unsuccessful",
      error: err.message,
    });
  }
}

// 02. To login an user
export async function userLogin(req, res) {

  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (user == null) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePic: user.profilePic,
          },
          process.env.JWT_KEY
        );
        res.json({
          message: "Login Successful",
          token: token,
          role: user.role,
        });
      } else {
        res.json({
          message: "Invalid password",
        });
      }
    }
  } catch (err) {
    res.json({
      message: "Something went wrong",
      error: err.message,
    });
  }
}

//03. is Admin function
export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}

//04.is Chef

export function isChef(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "chef") {
    return false;
  }
  return true;
}

//05.isSteward
export function isSteward(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "steward") {
    return false;
  }
  return true;
}

//06.isCashier
export function isCashier(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "cashier") {
    return false;
  }
  return true;
}

//07.Get system user
export async function getAllUsers(req, res) {
  try {
    if (isAdmin(req)) {
      const users = await User.find({
        role: { $in: ["chef", "steward", "cashier"] },
      });
      return res.json(users);
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

//08.To delete a system user
export async function deleteUser(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "You don't have the authorization to delete a user",
    });
    return;
  }
  try {
    await User.deleteOne({ email: req.params.email });
    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete the user",
      error: error,
    });
  }
}

//09. login with google
export async function loginWithGoogle(req, res) {
  const token = req.body.accessToken;
  if (token == null) {
    res.status(400).jason({
      message: "Access token is required",
    });
    return;
  }
  const response = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const user = await User.findOne({ email: response.data.email});

  if (user == null) {
    const newUser = await new User({
      email: response.data.email,
      firstName: response.data.given_name,
      lastName: response.data.family_name,
      password: "googleUser",
      phoneNumber: response.data?.phoneNumber || 0,
    });
    await newUser.save();
    const token = jwt.sign(
      {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        profilePic: newUser.profilePic,
      },
      process.env.JWT_KEY
    );
    res.status(200).json({
      message: "Login successful",
      token: token,
      role: newUser.role,
    });
  } else {
    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePic: user.profilePic,
      },
      process.env.JWT_KEY
    );
    res.status(200).json({
      message: "Login successful",
      token: token,
      role: user.role,
    });
  }
}

// 10. To get user to avoid accessing through URL
export function getUser(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "Unauthorized Access",
    });
  } else {
    res.json({
      ...req.user,
    });
  }
}
