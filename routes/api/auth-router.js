import express from "express";

import authController from "../../controllers/auth-controller.js";

import {validateBody} from "../../decorators/index.js";

import usersSchemas from "../../schemas/users-schemas.js";

import {authenticate, upload, isEmptyVerifyBody} from "../../middlewars/index.js";


const authRouter = express.Router();

authRouter.post("/register", validateBody(usersSchemas.userSignupSchema), authController.signup)
authRouter.get("/verify/:verificationToken", authController.verify);
authRouter.post("/verify", isEmptyVerifyBody, validateBody(usersSchemas.userEmailSchema), authController.resendVerifyEmail);
authRouter.post("/login", validateBody(usersSchemas.userSigninSchema), authController.signin)
authRouter.post("/logout", authenticate, authController.signout);
authRouter.get("/current", authenticate, authController.getCurrent);
authRouter.patch(
    "/",
    authenticate,
    validateBody(usersSchemas.userSubscriptionUpdateSchema),
    authController.subscriptionUpdate
  );
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.avatarUpdate
);
export default authRouter;
