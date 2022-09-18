const path = require("path")
const express = require("express")
const session = require("express-session")

const app = express()
app.listen(8080)

app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    name: "foo",
    secret: "bar",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
}))

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