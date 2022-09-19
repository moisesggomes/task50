const dotenv = require("dotenv")
dotenv.config()

const crypto = require("crypto")
const sqlite3 = require("better-sqlite3")
const db = new sqlite3("users.sqlite")

const MINIMAL_USERNAME_LENGTH = 2
const MINIMAL_PASSWORD_LENGTH = 6
const INVALID_USERNAME_OR_PASSWORD_MESSAGE = `Invalid username or password. Please be sure that the username is correct and that your password has ${MINIMAL_PASSWORD_LENGTH} or more characters`

exports.signUp = function signUp(username, password) {
    if (!isValidInput(username, password)) {
        return INVALID_USERNAME_OR_PASSWORD_MESSAGE
    }

    const parsedUsername = username.trim()
    const parsedPassword = password.trim()
    const usernameAlreadyInUse = db.prepare("SELECT * FROM users WHERE username = ?").get(parsedUsername)
    if (usernameAlreadyInUse) {
        return "Username already in use"
    }

    const salt = crypto.randomBytes(Number(process.env.SALT_LENGTH)).toString("hex")
    const hashedPassword = hashPassword(parsedPassword, salt)
    const insertNewUser = db.prepare("INSERT INTO users (username, hashed_password) VALUES (?, ?)")
    return insertNewUser.run(parsedUsername, hashedPassword)
}

exports.login = function login(username, password) {
    if (!isValidInput(username, password)) {
        return INVALID_USERNAME_OR_PASSWORD_MESSAGE
    }

    const parsedUsername = username.trim()
    const parsedPassword = password.trim()
    const row = db.prepare("SELECT * FROM users WHERE username = ?").get(parsedUsername)
    if (!row) {
        return "User not found"
    }
    const [ salt, hashedPassword ] = row.hashed_password.split(":")
    if (crypto.scryptSync(parsedPassword, salt, Number(process.env.HASHED_PASSWORD_LENGTH)).toString("hex") === hashedPassword) {
        return row
    }
    return "Wrong password"
}

function isValidInput(username, password) {
    try {
        username = username.trim()
        password = password.trim()
        if (username.length < MINIMAL_USERNAME_LENGTH || password.length < MINIMAL_PASSWORD_LENGTH) {
            throw INVALID_USERNAME_OR_PASSWORD_MESSAGE
        }
    } catch(error) {
        return false
    }
    return true
}

function hashPassword(password, salt) {
    const hashedPassword = crypto.scryptSync(password, salt, Number(process.env.HASHED_PASSWORD_LENGTH)).toString("hex")
    const fullHashedPassword = `${salt}:${hashedPassword}`
    return fullHashedPassword
}
