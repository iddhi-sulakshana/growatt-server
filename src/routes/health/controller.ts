import HTTP_STATUS from "@/types/status-codes";
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
const router: ExpressRouter = Router();

router.get("/", (_, res) => {
    res.sendResponse({
        status: HTTP_STATUS.OK,
        message: "OK",
        data: undefined,
    });
});

export default router;
