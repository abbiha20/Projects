import { Router } from "express";
import { userLogin, userRegistration } from "../controllers/useAuthenticationController.js";
import { verifyToken } from "../middleware/auth.js";
import { deleteUser, getUsers, updateUser } from "../controllers/user.controller.js";


const router = Router()


router.get("/login",userLogin)
router.post("/register",userRegistration)

router.put("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/", verifyToken, getUsers);


export default router