import {db} from "../drizzle/index.js";
import {users} from "../drizzle/schema/schema.js";
import {eq, like, or, count} from "drizzle-orm";

const getUsers = async (req, res, next) => {
  try {
    // query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const offset = (page - 1) * limit;

    // filter condition
    let whereClause;
    if (search) {
      whereClause = or(
        like(users.email, `%${search}%`),
        like(users.name, `%${search}%`)
      );
    }

    // count total users (using drizzle count)
    const [{total}] = await db
      .select({total: count()})
      .from(users)
      .where(whereClause ?? undefined);

    // fetch paginated + filtered users
    const userList = await db
      .select()
      .from(users)
      .where(whereClause ?? undefined)
      .limit(limit)
      .offset(offset);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      page,
      limit,
      total,
      users: userList,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserName = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {name} = req.body;
    await db
      .update(users)
      .set({
        name: name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    const [user] = await db.select().from(users).where(eq(users.id, id));

    res.status(200).json({
      success: true,
      message: "User name updated successfully",
      user: {
        name: user.name,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const {id} = req.params;
    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: {
        id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // The user data is already attached to req.user by the auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {getUsers, getUserById, updateUserName, deleteUser, getMe};
