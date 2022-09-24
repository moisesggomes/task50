const helpIcon = document.querySelector("main div:first-child h2 img")
helpIcon.addEventListener("click", (event) => {
    const help = document.querySelector("#help")
    if (help.classList.contains("show")) {
        help.classList.remove("show")
    } else {
        help.classList.add("show")
    }
})

const tbody = document.querySelector("main table tbody")
const pageActions = document.querySelector("#pageActions")
const deleteTasksIcon = document.querySelector("#deleteTasks")

let temporaryId = -1
let tasksToBeDeleted = []

getTasks()

async function getTasks(event) {
    const response = await fetch("/tasks")
    const tasks = await response.json()
    writeTasks(tasks)
}


function createTask(event) {
    const task = {
        id: temporaryId,
		task: "Write your task here!",
		description: "Provide some description about your task also!",
		finished: 0,
        new: true
	}
    const row = createRow(task)
    tbody.appendChild(row)
    row.setAttribute("id", `task${temporaryId}`)
    window.location.hash = `task${temporaryId}`
    temporaryId--
}

async function sendTask(event, method) {
    const trContainer = event.target.parentNode.parentNode.parentNode
    const tdFinished = trContainer.querySelector("input[type='checkbox']")
    const tdTask = trContainer.querySelector(".task")
    const tdDescription = trContainer.querySelector(".description")

    const body = {
        task: {
            id: trContainer.dataset.taskId,
            finished: tdFinished.checked ? 1 : 0,
            task: tdTask.innerHTML,
            description: tdDescription.innerHTML
        }
    }

    const xhr = new XMLHttpRequest()
    xhr.open(method, "/tasks", true)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    xhr.send(JSON.stringify(body))
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                console.log(JSON.parse(xhr.response))
                const parsedJSON = JSON.parse(xhr.response)
                if (method === "POST") {
                    trContainer.dataset.taskId = parsedJSON.info.lastInsertRowid
                }
                const editIcon = trContainer.querySelector(".actions > div > img")
                editIcon.src = "assets/edit.svg"
                editIcon.setAttribute("onclick", "sendTask(event, 'PUT')")
            } catch (error) {
                console.log(error)
            }
        }
    }
}

function editedTask(event) {
    let trContainer
    switch (event.target.tagName) {
        case "INPUT":
            trContainer = event.target.parentNode.parentNode.parentNode
            break
        case "TD":
            trContainer = event.target.parentNode
            break
        default:
            return
    }
    const editIcon = trContainer.querySelector(".actions img")
    editIcon.src = "assets/confirm.svg"
}


function deleteTask(event) {
    const trContainer = event.target.parentNode.parentNode.parentNode
    
    const idAlreadyInArray = tasksToBeDeleted.find(value => value.id == trContainer.dataset.taskId)
    if (idAlreadyInArray) {
        tasksToBeDeleted.forEach((value, index) => {
            if (value.id == trContainer.dataset.taskId) {
                tasksToBeDeleted.splice(index, 1)
            }
        })
        trContainer.style.backgroundColor = "#E6E6E6"
    } else {
        tasksToBeDeleted.push({id: trContainer.dataset.taskId})
        trContainer.style.backgroundColor = "salmon"
    }
    
    if (tasksToBeDeleted.length > 0) {
        deleteTasksIcon.classList.add("show")
    } else {
        deleteTasksIcon.classList.remove("show")
    }
    console.clear()
    console.log(tasksToBeDeleted)
}
function deleteTasks() {
    const body = {
        tasks: tasksToBeDeleted
    }

    const xhr = new XMLHttpRequest()
    xhr.open("DELETE", "/tasks", true)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body))
    xhr.onreadystatechange = function() {
        if(this.readyState == 4) {
            try {
                for (let task of tasksToBeDeleted) {
                    const targetTask = tbody.querySelector(`tr[data-task-id="${task.id}"]`)
                    targetTask.remove()
                }
                tasksToBeDeleted = []
                deleteTasksIcon.classList.remove("show")
            } catch (error) {
                console.log(error)
            }
        }
    }
}


function writeTasks(tasks) {
    try {
        if (typeof(tasks) === "string") {
            throw "There are no tasks"
        }

        tbody.innerHTML = ""
        for (let task of tasks) {
            const tr = createRow(task)
            tbody.appendChild(tr)
        }
    } catch (error) {
        console.log("There are no tasks!")
    }
}

function createRow(task) {
    const tr = document.createElement("tr")
    tr.dataset.taskId = task.id

    const tdFinished = createTdFinished(task)
    tr.appendChild(tdFinished)

    const tdTask = createTdTask(task, tr.querySelector(".finished input").checked)
    tr.appendChild(tdTask)

    const tdDescription = createTdDescription(task, tr.querySelector(".finished input").checked)
    tr.appendChild(tdDescription)

    if (task.new) {
        const tdActions = createTdActionsForNewElement()
        tr.appendChild(tdActions)
        return tr
    }
    const tdActions = createTdActions()
    tr.appendChild(tdActions)

    return tr
}

function createTdFinished(task) {
    const tdFinished = document.createElement("td")
    tdFinished.classList.add("finished")

    const div = document.createElement("div")
    tdFinished.appendChild(div)

    const finished = document.createElement("input")
    finished.setAttribute("type", "checkbox")
    finished.addEventListener("change", editedTask)

    finished.addEventListener("change", (event) => {
        const trParent = event.target.parentNode.parentNode.parentNode
        const task = trParent.querySelector(".task")
        const description = trParent.querySelector(".description")

        strikeIfFinished(finished, task, description)
    })
    if (task.finished === 1) {
        finished.checked = true
    } else {
        finished.checked = false
    }
    div.appendChild(finished)
    return tdFinished
}
function strikeIfFinished(finished, task, description) {
    if (finished.checked) {
        task.style.textDecoration = description.style.textDecoration = "line-through"
    } else {
        task.style.textDecoration = description.style.textDecoration = "initial"
    }
}

function createTdTask(task, finished) {
    const tdTask = document.createElement("td")
    tdTask.addEventListener("input", editedTask)

    tdTask.classList.add("task")
    tdTask.setAttribute("contenteditable", "true")
    tdTask.innerHTML = task.task
    if (finished) {
        tdTask.style.textDecoration = "line-through"
    }
    return tdTask
}

function createTdDescription(task, finished) {
    const tdDescription = document.createElement("td")
    tdDescription.addEventListener("input", editedTask)

    tdDescription.classList.add("description")
    tdDescription.setAttribute("contenteditable", "true")
    tdDescription.innerHTML = task.description
    if (finished) {
        tdDescription.style.textDecoration = "line-through"
    }
    return tdDescription
}

function createTdActions() {
    const tdActions = document.createElement("td")
    tdActions.classList.add("actions")
    const div = document.createElement("div")
    tdActions.appendChild(div)
    div.innerHTML = `   <img src="assets/edit.svg" alt="Edit task" title="Send modifications" onclick="sendTask(event, 'PUT')" />
                        <img src="assets/delete.svg" alt="Delete task" title="Delete task" onclick="deleteTask(event)" />
                    `
    return tdActions
}

function createTdActionsForNewElement() {
    const tdActions = document.createElement("td")
    tdActions.classList.add("actions")
    const div = document.createElement("div")
    tdActions.appendChild(div)
    div.innerHTML = `   <img src="assets/confirm.svg" alt="Create task" title="Create task" onclick="sendTask(event, 'POST')" />
                        <img src="assets/delete.svg" alt="Delete task" title="Delete task" onclick="deleteTask(event)" />
                    `
    return tdActions
}