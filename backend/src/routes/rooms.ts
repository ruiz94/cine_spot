import express from "express";
import { requireRole } from "../middlewares";
import { validateWithZod } from "../middlewares/validateWithZod";
import { roomController } from "../controllers";
import { createRoomSchema } from "../utils/schemas/rooms";

const router = express.Router();

//Create room, just users with ADMIN role can create a room
router.post('/', requireRole(['ADMIN']), validateWithZod(createRoomSchema, 'body'), roomController.createRoom);

export default router;