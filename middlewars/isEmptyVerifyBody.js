import { HttpError } from "../helpers/index.js";

const isEmptyVerifyBody = (req, res, next) => {
    const { length } = Object.keys(req.body);
    if (!length) {
      next(HttpError(400, `missing required field email`));
    }
    next();
  };

  export default isEmptyVerifyBody;
