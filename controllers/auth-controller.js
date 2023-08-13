import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

import User from "../models/user.js";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError, sendEmail, createVerifyEmail } from "../helpers/index.js";
import "dotenv/config";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

const avatarPath = path.resolve("public", "avatars");

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = createVerifyEmail({email, verificationToken});
  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      subscription: newUser.subscription,
      email: newUser.email,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  
  const user = await User.findOne({ verificationToken });
  if (!user) {
      throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.json({
      message: "Verification successful"
  })
};

const resendVerifyEmail = async(req, res)=> {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) {
      throw HttpError(404, "User not found");
  }

  if(user.verify) {
      throw HttpError(400, "Verification has already been passed")
  }

  const verifyEmail = createVerifyEmail({email, verificationToken: user.verificationToken});

  await sendEmail(verifyEmail);

  res.json({
      message: "Verification email sent"
  })
}


const signin = async (req, res) => {
  const { email, password, subscription = "starter" } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      subscription,
      email,
    },
  });
};
const signout = async (req, res) => {
  const { _id } = req.user;
  const idCompare = await User.findByIdAndUpdate(_id, { token: "" });
  if (!idCompare) {
    throw HttpError(401, "Not authorized");
  }
  res.status(204).json();
};
const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};
const subscriptionUpdate = async (req, res) => {
  const { _id, email } = req.user;
  const { subscription } = req.body;
  await User.findByIdAndUpdate(_id, { subscription });
  res.json({
    email,
    subscription,
  });
};

const avatarUpdate = async (req,res) => {
  const {_id} = req.user;
  const {path: oldPath, filename} = req.file;
  const newPath = path.join(avatarPath, filename);

  const image = await Jimp.read(oldPath);
  image.resize(250, 250).write(oldPath);

  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, {avatarURL});
  res.json({
    avatarURL,
  });
}
export default {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
  subscriptionUpdate: ctrlWrapper(subscriptionUpdate),
  avatarUpdate: ctrlWrapper(avatarUpdate),
};
