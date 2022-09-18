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
const db_sessions = new sqlite3("databases/sessions-db.sqlite")

app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    name: "foo",
    store: new SQLiteStore({
        client: db_sessions,
        expired: {
            clear: true,
            intervalMs: 1000 * 60 * 15 // ms = 15min
          }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
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

app.get("/login", (request, response) => {
    if (request.session.user) return response.redirect("/")
    return response.render("pages/login")
})

app.post("/login", express.urlencoded({ extended: false }), (request, response) => {
    const body = request.body
    if (!body || !body.username || body.username.trim() === "") {
        return response.redirect("/login")
    }
    request.session.regenerate(error => {
        if (error) console.log(error)
        
        request.session.user = body.username.trim()
        request.session.save(error => {
            if (error) console.log(error)
            return response.redirect("/")
        })
    })
})

app.get("/logout", (request, response) => {
    request.session.user = null
    request.session.save(error => {
        if (error) console.log(error)

        request.session.regenerate(error => {
            if (error) console.log(error)
            return response.redirect("/")
        })
    })
})