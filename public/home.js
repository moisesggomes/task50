async function getTasks(event) {
    const response = await fetch("/tasks")
    const tasks = await response.json()
    writeTasks(tasks)
}

function createTask(event) {

}

function updateTask(event) {

}

function deleteTask(event) {

}

function writeTasks(tasks) {
    const tbody = document.querySelector("tbody")
    tbody.innerHTML = ""
    for (let task of tasks) {
        const tr = document.createElement("tr")

        const tdFinished = createTdFinished(task)
        tr.appendChild(tdFinished)

        const tdTask = createTdTask(task)
        tr.appendChild(tdTask)

        const tdDescription = createTdDescription(task)
        tr.appendChild(tdDescription)

        const tdActions = createTdActions()
        tr.appendChild(tdActions)

        tbody.appendChild(tr)
    }
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
    tdTask.setAttribute("contentedidatble", "true")
    tdTask.innerHTML = task.task
    return tdTask
}
function createTdDescription(task) {
    const tdDescription = document.createElement("td")
    tdDescription.classList.add("description")
    tdDescription.setAttribute("contentedidatble", "true")
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