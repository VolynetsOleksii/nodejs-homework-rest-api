import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import "dotenv/config";

const { JWT_SECRET } = process.env;


const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    user: {
      subscription: newUser.subscription,
      email: newUser.email,
    },
  });
};
const signin = async (req, res) => {
  const { email, password, subscription="starter" } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
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
const signout = async(req, res)=> {
    const {_id} = req.user;
   const idCompare=  await User.findByIdAndUpdate(_id, {token: ""});
    if (!idCompare) {
        throw HttpError(401, "Not authorized");
      }
    res.status(204).json();
};
const getCurrent = (req, res)=> {
    const { email, subscription} = req.user;

    res.json({
        email,
        subscription,
    })
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

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
  subscriptionUpdate: ctrlWrapper(subscriptionUpdate),
};
