const path = require("path")
const dotenv = require("dotenv")
dotenv.config()

const { signUp, login, isValidUsernameAndPassword } = require("./utils/login_signup")

const express = require("express")
const session = require("express-session")
const sqlite3 = require("better-sqlite3")
const better_sqlite3_session_store = require("better-sqlite3-session-store")

const database = new sqlite3("databases/database.sqlite")

const app = express()
app.listen(8080)

const SQLiteStore = better_sqlite3_session_store(session)

app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    store: new SQLiteStore({
        client: database,
        expired: {
            clear: true,
            intervalMs: 1000 * 60 * 15 // ms = 15min
          }
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
}))

app.set("view engine", "ejs")


function isAuthenticated(request, response, next) {
    if (request.session.user) next()
    else next("route")
}


app.get("/", isAuthenticated, (request, response) => {
    return response.render("pages/hello", { name: request.session.user })
})
app.get("/", (request, response) => {
    return response.redirect("/login")
})

//---------------------LOGIN---------------------
app.get("/login", isAuthenticated, (request, response) => {
    return response.redirect("/")
})
app.get("/login", (request, response) => {
    return response.render("pages/login", { errorMessage: request.session.errorMessage })
})


app.post("/login", express.urlencoded({ extended: false }), (request, response, next) => {
    const result = login(request.body.username, request.body.password, database)
    if (typeof(result) === "string") {
        request.session.errorMessage = result
        return response.redirect("/login")
    }
    
    request.session.regenerate(error => {
        if (error) next(error)
        
        request.session.user = request.body.username.trim()
        request.session.save(error => {
            if (error) next(error)
            
            return response.redirect("/")
        })
    })
})


//---------------------SIGNUP---------------------
app.get("/signup", isAuthenticated, (request, response) => {
    return response.redirect("/")
})
app.get("/signup", (request, response) => {
    return response.render("pages/signup", { errorMessage: request.session.errorMessage })
})
app.post("/signup", express.urlencoded({ extended: false }), (request, response, next) => {
    if (request.body.password != request.body.passwordValidate) {
        request.session.errorMessage = "Passwords don't match"
        return response.redirect("/signup")
    }

    const result = signUp(request.body.username, request.body.password, database)
    if (typeof(result) === "string") {
        request.session.errorMessage = result
        return response.redirect("/signup")
    }
    
    request.session.regenerate(error => {
        if (error) next(error)

        request.session.user = result.username
        request.session.save(error => {
            if (error) next(error)

            return response.redirect("/")
        })
    })
})


//---------------------LOGOUT---------------------
app.get("/logout", (request, response) => {
    request.session.destroy(error => {
        if (error) next(error)

        return response.redirect("/login")
    })
})