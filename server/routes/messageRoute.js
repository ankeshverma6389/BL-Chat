import express from 'express';
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
const messageRouter = express.Router();
messageRouter.get('/users', protect, getUsersForSidebar);
messageRouter.get('/:id', protect, getMessages);
messageRouter.put('/mark/:id', protect, markMessageAsSeen);
messageRouter.post('/send/:id', protect, sendMessage);


export default messageRouter;