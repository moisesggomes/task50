const dotenv = require("dotenv")
dotenv.config()

const crypto = require("crypto")
const sqlite3 = require("better-sqlite3")
const db = new sqlite3("users.sqlite")

const MINIMAL_USERNAME_LENGTH = 2
const MINIMAL_PASSWORD_LENGTH = 6

exports.signUp = function signUp(username, password) {
    if (!isValidInput(username, password)) {
        return `Invalid username or password. Please be sure that the username is correct and that your password has ${MINIMAL_PASSWORD_LENGTH} or more characters`
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
    insertNewUser.run(parsedUsername, hashedPassword)
    return true
}

exports.login = function login(username, password) {
    if (!isValidInput(username, password)) {
        return "Invalid username or password. Please be sure that the username is correct and that your password has 6 or more characters"
    }

    const parsedUsername = username.trim()
    const parsedPassword = password.trim()
    const row = db.prepare("SELECT * FROM users WHERE username = ?").get(parsedUsername)
    if (!row) {
        console.log("User not found")
        return "User not found"
    }
    console.log(row)
    const [ salt, hashedPassword ] = row.hashed_password.split(":")
    if (crypto.scrypt(parsedPassword, salt, Number(process.env.HASHED_PASSWORD_LENGTH)) != hashedPassword) {
        return true
    }
    return "Wrong password"
}

function isValidInput(username, password) {
    try {
        username = username.trim()
        password = password.trim()
        if (username.length < MINIMAL_USERNAME_LENGTH || password.length < MINIMAL_PASSWORD_LENGTH) throw "Invalid username or password. Please be sure that the username is correct and that your password has 6 or more characters"
    } catch(error) {
        console.log(error)
        return false
    }
    return true
}

function hashPassword(password, salt) {
    const hashedPassword = crypto.scryptSync(password, salt, Number(process.env.HASHED_PASSWORD_LENGTH)).toString("hex")
    const fullHashedPassword = `${salt}:${hashedPassword}`
    console.log(fullHashedPassword)
    return fullHashedPassword
}
