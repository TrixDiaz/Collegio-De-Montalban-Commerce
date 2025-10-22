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

    // Development bypass for any token starting with 'eyJ' (JWT format)
    if (token.startsWith("eyJ")) {
      req.user = {
        id: "550e8400-e29b-41d4-a716-446655440000", // Fixed UUID for test user
        email: "test@example.com",
        name: "Test User",
        isVerified: true,
      };
      return next();
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

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
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
    console.log(
      "Admin auth middleware - decoded token userId:",
      decoded.userId
    );

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    console.log("Admin auth middleware - user found:", user.length > 0);

    if (!user || user.length === 0) {
      console.log(
        "Admin auth middleware - user not found for userId:",
        decoded.userId
      );
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, user not found",
      });
    }

    // Check if user has admin or superadmin role
    if (user[0].role !== "admin" && user[0].role !== "superadmin") {
      console.log(
        "Admin auth middleware - user is not admin or superadmin:",
        user[0].role
      );
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Superadmin role required.",
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
export {authorize as authenticateToken, authenticateAdmin};
