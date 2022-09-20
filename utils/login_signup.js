const { scryptSync, randomBytes } = require("crypto")

const MINIMAL_USERNAME_LENGTH = 2
const MINIMAL_PASSWORD_LENGTH = 6
const INVALID_USERNAME_OR_PASSWORD_MESSAGE = `Invalid username or password. Please be sure that the username is correct and that your password has ${MINIMAL_PASSWORD_LENGTH} or more characters`

function signUp(username, password, db) {
    if (!isValidUsernameAndPassword(username, password)) {
        return INVALID_USERNAME_OR_PASSWORD_MESSAGE
    }

    const parsedUsername = username.trim()
    const parsedPassword = password.trim()
    const usernameAlreadyInUse = db.prepare("SELECT username FROM users WHERE username = ?").get(parsedUsername)
    if (usernameAlreadyInUse) {
        return "Username already in use"
    }

    const salt = randomBytes(Number(process.env.SALT_LENGTH)).toString("hex")
    const hashedPassword = hashPassword(parsedPassword, salt)
    const insertNewUser = db.prepare("INSERT INTO users (username, hashed_password) VALUES (?, ?)")
    const info = insertNewUser.run(parsedUsername, hashedPassword)
    return { ...info, username: parsedUsername }
}

function login(username, password, db) {
    if (!isValidUsernameAndPassword(username, password)) {
        return INVALID_USERNAME_OR_PASSWORD_MESSAGE
    }

    const parsedUsername = username.trim()
    const parsedPassword = password.trim()
    const row = db.prepare("SELECT * FROM users WHERE username = ?").get(parsedUsername)
    if (!row) {
        return "User not found"
    }
    const [ salt, hashedPassword ] = row.hashed_password.split(":")
    if (scryptSync(parsedPassword, salt, Number(process.env.HASHED_PASSWORD_LENGTH)).toString("hex") === hashedPassword) {
        return {
            id: row.id,
            username: row.username
        }
    }
    return "Wrong password"
}

function isValidUsernameAndPassword(username, password) {
    try {
        username = username.trim()
        password = password.trim()
        if (username.length < MINIMAL_USERNAME_LENGTH || password.length < MINIMAL_PASSWORD_LENGTH) {
            throw INVALID_USERNAME_OR_PASSWORD_MESSAGE
        }
        return true
    } catch(error) {
        return false
    }
}

function hashPassword(password, salt) {
    const hashedPassword = scryptSync(password, salt, Number(process.env.HASHED_PASSWORD_LENGTH)).toString("hex")
    return `${salt}:${hashedPassword}`
}

exports.signUp = signUp
exports.login = login
exports.isValidUsernameAndPassword = isValidUsernameAndPassword