import express from 'express';
import { signup, login, checkAuth, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js'
const userRouter = express.Router();
userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.get("/check", protect, checkAuth)
userRouter.put("/update-profile", protect, updateProfile)


export default userRouter;