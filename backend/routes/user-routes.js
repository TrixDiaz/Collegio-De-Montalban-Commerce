import {Router} from "express";
import {
  getUsers,
  getUserById,
  updateUserName,
  deleteUser,
  getMe,
} from "../controllers/user-controller.js";
import authorize from "../middlewares/auth-middleware.js";

const userRouter = Router();

userRouter.get("/me", authorize, getMe);
userRouter.get("/", authorize, getUsers);
userRouter.get("/:id", authorize, getUserById);
userRouter.put("/:id", authorize, updateUserName);
userRouter.delete("/:id", authorize, deleteUser);

export {userRouter};
