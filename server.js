const path = require("path")
const dotenv = require("dotenv")
dotenv.config()

const { signUp, login } = require("./utils/login_signup")
const { getTasks, createTask, updateTask, deleteTasks } = require("./utils/tasks")

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
app.use(express.json())

app.set("view engine", "ejs")


function isAuthenticated(request, response, next) {
    if (request.session.user) next()
    else next("route")
}


app.get("/", isAuthenticated, (request, response) => {
    return response.render("pages/home", { name: request.session.user })
})
app.get("/", (request, response) => {
    return response.redirect("/login")
})

//---------------------LOGIN---------------------
app.get("/login", isAuthenticated, (request, response) => {
    return response.redirect("/")
})
app.get("/login", (request, response) => {
    request.session.signupErrorMessage = undefined
    return response.render("pages/login", { errorMessage: request.session.loginErrorMessage })
})


app.post("/login", express.urlencoded({ extended: false }), (request, response, next) => {
    const result = login(request.body.username, request.body.password, database)
    if (typeof(result) === "string") {
        request.session.loginErrorMessage = result
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
    request.session.loginErrorMessage = undefined
    return response.render("pages/signup", { errorMessage: request.session.signupErrorMessage })
})
app.post("/signup", express.urlencoded({ extended: false }), (request, response, next) => {
    if (request.body.password != request.body.passwordValidate) {
        request.session.signupErrorMessage = "Passwords don't match"
        return response.redirect("/signup")
    }

    const result = signUp(request.body.username, request.body.password, database)
    if (typeof(result) === "string") {
        request.session.signupErrorMessage = result
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


//---------------------TASKS---------------------
function getUser(request, response, database) {
    const user = database.prepare("SELECT id, username FROM users WHERE username = ?").get(request.session.user)
    if (!user) {
        request.session.regenerate(error => {
            if (error) next(error)

            return response.json({
                message: "User not found"
            })
        })
    }
    return user
}
function redirectNotAuthenticated(request, response) {
    return response.status(401).json({ errorMessage: "Not authenticated" })
}
//---------------------GET---------------------
app.get("/tasks", isAuthenticated, (request, response, next) => {
    const user = getUser(request, response, database)

    const result = getTasks(user.id, database)
    if (typeof(result) == "string") {
        return response.json({
            message: result
        })
    }
    return response.status(200).json(result)
})
app.get("/tasks", (request, response) => {
    return response.status(401).json({ errorMessage: "Not authenticated" })
})

//---------------------CREATE---------------------
app.post("/tasks", isAuthenticated, (request, response) => {
    const user = getUser(request, response, database)

    const result = createTask(request.body.task, user.id, database)
    return response.json(result)
})
app.post("/tasks", redirectNotAuthenticated)

//---------------------UPDATE---------------------
app.put("/tasks", isAuthenticated, (request, response) => {
    const user = getUser(request, response, database)

    const result = updateTask(request.body.task, user.id, database)
    if (typeof(result) == "string") {
        return response.json(database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(user.id))
    }
    return response.status(200).json(result)
})
app.put("/tasks", redirectNotAuthenticated)

//---------------------DELETE---------------------
app.delete("/tasks", isAuthenticated, (request, response) => {
    const user = getUser(request, response, database)

    const result = deleteTasks(request.body.tasks, user.id, database)
    if (typeof(result) == "string") {
        return response.json(database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(user.id))
    }
    return response.status(200).json(result)
})
app.delete("/tasks", redirectNotAuthenticated)