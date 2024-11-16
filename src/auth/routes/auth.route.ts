import { Router } from "express";
import { LoginDto } from "../dto/login.dto";
import { validateDto } from "../../middlewares/validate-dto";
import { googleLogin, login } from "../controller/auth.controller";

const router = Router();

router.post('/login', validateDto(LoginDto),login ); 
router.post('/google', googleLogin);


export default router;
