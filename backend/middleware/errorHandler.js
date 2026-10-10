const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, "Resource not found."));
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again.";

  // Translate common MySQL errors into safe, friendly messages.
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "That value is already in use. Please choose another.";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Related record not found.";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message = "This record is in use and cannot be deleted.";
  } else if (err.code && err.code.startsWith("ER_")) {
    // Any other raw database error: hide details from the client.
    statusCode = 500;
    message = "Something went wrong. Please try again.";
  }

  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  const body = { message };
  if (err.errors) body.errors = err.errors;
  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
