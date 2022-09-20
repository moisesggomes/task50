function getTasks(userId, database) {
    const rows = database.prepare("SELECT * FROM tasks WHERE user_id = (SELECT id FROM users WHERE id = ?)").all(userId)
    console.log(userId)
    console.log(rows)
    if (rows.length == 0) {
        return "You don't have tasks yet!"
    }
    return rows;

}
function createTask(task, userId, database) {
    task.finished = task.finished == 1 ? 1 : 0
    try {
        const info = database.prepare("INSERT INTO tasks (user_id, task, description, finished) VALUES (?, ?, ?, ?)")
                                .run(userId, task.task, task.description, task.finished)
        if (info.changes == 0) {
            throw "Coundn't create task"
        }
        return database.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId)
    } catch (error) {
        return "Coundn't create task"
    }
}
function updateTask(task, userId, database) {
    try {
        const info = database.prepare("UPDATE tasks SET task = ?, description = ?, finished = ? WHERE user_id = ?")
                    .run(task.task, task.description, task.finished, userId)
        if (info.changes == 0) {
            throw "Coundn't update task"
        }
        return info
    } catch(error) {
        return "Coundn't update task"
    }
}
function deleteTasks(tasks, userId, database) {
    try {
        const statement = database.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
        let tasksDeleted = 0
        for (let task of tasks) {
            const info = statement.run(task.id, userId)
            if (info.changes > 0) {
                tasksDeleted++
            }
        }
        return tasksDeleted
    } catch(error) {
        return "An error occurred"
    }
}

exports.getTasks = getTasks
exports.createTask = createTask
exports.updateTask = updateTask
exports.deleteTasks = deleteTasks