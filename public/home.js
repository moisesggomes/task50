getTasks()

async function getTasks(event) {
    const response = await fetch("/tasks")
    const tasks = await response.json()
    writeTasks(tasks)
}


function createTask(event) {
    const tbody = document.querySelector("tbody")
    const task = {
        id: 0,
		task: "Write your task here!",
		description: "Provide some description about your task also!",
		finished: 0,
        new: true
	}
    const row = createRow(task)
    tbody.appendChild(row)
}
async function sendTask(event) {
    const trContainer = event.target.parentNode.parentNode.parentNode
    const tdFinished = trContainer.querySelector("input[type='checkbox']")
    const tdTask = trContainer.querySelector(".task")
    const tdDescription = trContainer.querySelector(".description")

    const body = {
        task: {
            finished: tdFinished.checked ? 1 : 0,
            task: tdTask.innerHTML,
            description: tdDescription.innerHTML
        }
    }

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/tasks", true)
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(body))
    xhr.onreadystatechange = function() {
        try {
            writeTasks(JSON.parse(xhr.response).data)
        } catch (error) {}
    }
}


function updateTask(event) {

}


function deleteTask(event) {

}


function writeTasks(tasks) {
    const tbody = document.querySelector("tbody")
    tbody.innerHTML = ""
    for (let task of tasks) {
        const tr = createRow(task)
        tbody.appendChild(tr)
    }
}

function createRow(task) {
    const tr = document.createElement("tr")
    tr.setAttribute("meta-taskId", task.id)

    const tdFinished = createTdFinished(task)
    tr.appendChild(tdFinished)

    const tdTask = createTdTask(task)
    tr.appendChild(tdTask)

    const tdDescription = createTdDescription(task)
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
    if (task.finished === 1) {
        finished.checked = true
    } else {
        finished.checked = false
    }
    finished.addEventListener("click", updateTask)
    div.appendChild(finished)
    return tdFinished
}

function createTdTask(task) {
    const tdTask = document.createElement("td")
    tdTask.classList.add("task")
    tdTask.setAttribute("contenteditable", "true")
    tdTask.innerHTML = task.task
    return tdTask
}

function createTdDescription(task) {
    const tdDescription = document.createElement("td")
    tdDescription.classList.add("description")
    tdDescription.setAttribute("contenteditable", "true")
    tdDescription.innerHTML = task.description
    return tdDescription
}

function createTdActions() {
    const tdActions = document.createElement("td")
    tdActions.classList.add("actions")
    const div = document.createElement("div")
    tdActions.appendChild(div)
    div.innerHTML = `   <img src="assets/edit.svg" alt="Edit task" title="Send modifications" onclick="updateTask(event)" />
                        <img src="assets/delete.svg" alt="Delete task" title="Delete task" onclick="deleteTask(event)" />
                    `
    return tdActions
}

function createTdActionsForNewElement() {
    const tdActions = document.createElement("td")
    tdActions.classList.add("actions")
    const div = document.createElement("div")
    tdActions.appendChild(div)
    div.innerHTML = `   <img src="assets/confirm.svg" alt="Create task" title="Create task" onclick="sendTask(event)" />
                        <img src="assets/delete.svg" alt="Delete task" title="Delete task" onclick="deleteTask(event)" />
                    `
    return tdActions
}