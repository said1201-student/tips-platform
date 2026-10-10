const ApiError = require("../utils/ApiError");

/**
 * validate(schema) returns an Express middleware.
 *
 * schema example:
 * {
 *   username: [required("Username"), isUsername("Username")],
 *   email: [required("Email"), isEmail("Email")],
 * }
 *
 * It collects every field error and throws a single 422 ApiError.
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = {};

    for (const field of Object.keys(schema)) {
      for (const rule of schema[field]) {
        const message = rule(data[field]);
        if (message) {
          if (!errors[field]) errors[field] = message;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      return next(new ApiError(422, first, errors));
    }

    return next();
  };
}

module.exports = validate;
