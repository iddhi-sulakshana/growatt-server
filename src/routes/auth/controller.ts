import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { loginService } from "./service";
import { loginSchema, type LoginRequest } from "./dto";

const router: ExpressRouter = Router();

router.post("/login", async (req, res) => {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);
        const loginData: LoginRequest = {
            username: validatedData.username,
            password: validatedData.password,
        };

        const response = await loginService(loginData);
        res.sendResponse(response);
    } catch (error: any) {
        res.sendResponse(error);
    }
});

export default router;
