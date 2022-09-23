function getTasks(userId, database) {
    const rows = database.prepare("SELECT * FROM tasks WHERE user_id = (SELECT id FROM users WHERE id = ?)").all(userId)
    if (rows.length == 0) {
        return "You don't have tasks yet!"
    }
    return rows;

}
function createTask(task, userId, database) {
    try {
        task.finished = task.finished == 1 ? 1 : 0
        const info = database.prepare("INSERT INTO tasks (user_id, task, description, finished) VALUES (?, ?, ?, ?)")
                                .run(userId, task.task, task.description, task.finished)
        if (info.changes == 0) {
            throw "Coundn't create task"
        }
        return {
            message: "New task created!",
            info,
            data: database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId)
        }
    } catch (error) {
        return "Coundn't create task"
    }
}
function updateTask(task, userId, database) {
    try {
        task.id = Number(task.id)
        const info = database.prepare("UPDATE tasks SET task = ?, description = ?, finished = ? WHERE id = ? AND user_id = ?")
                    .run(task.task, task.description, task.finished, task.id, userId)
        if (info.changes == 0) {
            throw "Coundn't update task"
        }
        return {
            message: "Task updated!",
            info,
            data: database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId)
        }
    } catch(error) {
        return "Coundn't update task"
    }
}
function deleteTasks(taskArray, userId, database) {
    try {
        const statement = database.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
        let tasksDeleted = 0
        for (let task of taskArray) {
            const info = statement.run(task.id, userId)
            if (info.changes > 0) {
                tasksDeleted++
            }
        }
        const tasks = database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId)
        return {
            tasks: [...tasks],
            tasksDeleted
        }
    } catch(error) {
        return "An error occurred"
    }
}

exports.getTasks = getTasks
exports.createTask = createTask
exports.updateTask = updateTask
exports.deleteTasks = deleteTasks