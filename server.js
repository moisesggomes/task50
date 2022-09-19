const path = require("path")
const dotenv = require("dotenv")
dotenv.config()

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
    name: "foo",
    store: new SQLiteStore({
        client: database,
        expired: {
            clear: true,
            intervalMs: 1000 * 60 * 15 // ms = 15min
          }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
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


app.get("/login", isAuthenticated, (request, response) => {
    return response.redirect("/")
})
app.get("/login", (request, response) => {
    return response.render("pages/login")
})


app.post("/login", isAuthenticated, (request, response) => {
    return response.redirect("/login")
})
app.post("/login", express.urlencoded({ extended: false }), (request, response) => {
    validateInput(request, response)
    request.session.regenerate(error => {
        if (error) next(error)
        
        request.session.user = request.body.username.trim()
        request.session.save(error => {
            if (error) next(error)
            
            return response.redirect("/")
        })
    })
})
function validateInput(request, response) {
    try {
        var username = request.body.username.trim()
        if (username == "") throw "Not a valid Username"
    } catch (error) {
        return response.redirect("/login")
    }
}


app.get("/logout", (request, response) => {
    request.session.destroy(error => {
        if (error) next(error)

        return response.redirect("/login")
    })
})