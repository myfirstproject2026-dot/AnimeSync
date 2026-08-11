const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function createToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function register(req, res) {
  try {
    const { email, username, password, displayName } = req.body;

    if (!email || !username || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: "email, username, password and displayName are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1",
      [normalizedEmail, normalizedUsername]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already in use"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
        (email, username, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, display_name,
                 avatar_url, bio, role, status, created_at`,
      [
        normalizedEmail,
        normalizedUsername,
        passwordHash,
        displayName.trim()
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      user,
      token: createToken(user)
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create account"
    });
  }
}

async function login(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "email/username and password are required"
      });
    }

    const identity = emailOrUsername.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, email, username, password_hash,
              display_name, avatar_url, bio, role, status, created_at
       FROM users
       WHERE email = $1 OR username = $1
       LIMIT 1`,
      [identity]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    delete user.password_hash;

    res.status(200).json({
      success: true,
      user,
      token: createToken(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  }
}

module.exports = {
  register,
  login
};
