import express from "express";

import authController from "../../controllers/auth-controller.js";

import {validateBody} from "../../decorators/index.js";

import usersSchemas from "../../schemas/users-schemas.js";

import {authenticate} from "../../middlewars/index.js";


const authRouter = express.Router();

authRouter.post("/register", validateBody(usersSchemas.userSignupSchema), authController.signup)
authRouter.post("/login", validateBody(usersSchemas.userSigninSchema), authController.signin)
authRouter.post("/logout", authenticate, authController.signout);
export default authRouter;
