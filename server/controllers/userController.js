import bcrypt from "bcryptjs";
import User from "../model/user.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from '../lib/cloudinary.js'
export const signup = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Account already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ fullName, email, password: hashedPassword, bio });
        const token = generateToken(newUser._id);
        const userData = newUser.toObject();
        delete userData.password;

        return res.status(201).json({
            success: true,
            userData,
            token,
            message: "Account created successfully",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Account already exists" });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user._id);
        const userData = user.toObject();
        delete userData.password;

        return res.json({ success: true, userData, token, message: "Logged in successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//controller to check authentication

export const checkAuth = async(req, res) => {
    res.json({ success: true, user: req.user });
}

//controller to update user profile details

export const updateProfile = async(req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        if (!fullName || !bio) {
            return res.status(400).json({ success: false, message: "Name and bio are required" });
        }

        const updates = { fullName, bio };
        if (profilePic) {
            const upload = await cloudinary.uploader.upload(profilePic);
            updates.profilePic = upload.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });
        return res.json({ success: true, user: updatedUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};