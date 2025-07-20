import express from "express";
import { login, refresh, register } from "../controllers/auth.controller";
import { loginLimiter } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../utils/zodSchemas";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default router;
