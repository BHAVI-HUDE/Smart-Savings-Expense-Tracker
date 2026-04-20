const jwt = require("jsonwebtoken");
const sendError = require("../utils/sendError");

const protect = (req, res, next) => {
  const header = req.headers.authorization;

   if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, 401, "AUTH_REQUIRED", "Authorization token is required");
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id; 
    next();
  }  catch (error) {
    return sendError(res, 401, "INVALID_TOKEN", "Invalid or expired token");
  }
};

module.exports = protect;