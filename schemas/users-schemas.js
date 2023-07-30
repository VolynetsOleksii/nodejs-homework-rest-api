import Joi from "joi";
import { emailRegexp, subscriptionList } from "../constants/user-constants.js";

const userSignupSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
    subscription: Joi.string().valid(...subscriptionList),
})

export default {
    userSignupSchema,
}