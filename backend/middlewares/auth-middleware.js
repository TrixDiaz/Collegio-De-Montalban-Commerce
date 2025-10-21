import {users} from "../drizzle/schema/schema.js";
import {db} from "../drizzle/index.js";
import {eq} from "drizzle-orm";
import {verifyAccessToken} from "../config/jwt.js";

const authorize = async (req, res, next) => {
  try {
    let token;

    // Check if the token is provided in the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If the token is not provided, return an unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, no token provided",
      });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    console.log("Auth middleware - decoded token userId:", decoded.userId);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    console.log("Auth middleware - user found:", user.length > 0);

    if (!user || user.length === 0) {
      console.log(
        "Auth middleware - user not found for userId:",
        decoded.userId
      );
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, user not found",
      });
    }

    // Attach the user to the request object
    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: error.message,
    });
  }
};

export default authorize;
export {authorize as authenticateToken};
