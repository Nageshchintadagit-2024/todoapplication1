const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database

const initializeDb = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Successfully Running....')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializeDb()

const hasPriorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

const hasTodoProperty = requestQuery => {
  return requestQuery.todo !== undefined
}

//API 1
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status} = request.query
  let data = ''
  let getQuery = ''

  if (hasPriorityAndStatus(request.query)) {
    getQuery = `
    SELECT * 
    FROM todo 
    WHERE todo LIKE '%${search_q}%' 
    AND priority = '${priority}' 
    AND status =  '${status}';
    
    `
  } else if (hasPriorityProperty(request.query)) {
    getQuery = `
    SELECT * 
    FROM todo 
    WHERE todo LIKE '%${search_q}%' 
    AND priority = '${priority}';
    `
  } else if (hasStatusProperty(request.query)) {
    getQuery = `
    SELECT * 
    FROM todo 
    WHERE todo LIKE '%${search_q}%' 
    AND status =  '${status}';
    `
  } else if (hasTodoProperty(request.query)) {
    getQuery = `
    SELECT * 
    FROM todo 
    WHERE todo LIKE '%${search_q}%'
    `
  }

  data = await database.all(getQuery)
  response.send(data)
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `

  SELECT * FROM todo WHERE id=${todoId};
  `
  const getTodo = await database.get(getTodoQuery)
  response.send(getTodo)
})

//API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postQuery = `
     INSERT INTO todo (id,todo,priority,status) 
     VALUES(${id},'${todo}','${priority}','${status}');
  `
  await database.run(postQuery)

  response.send('Todo Successfully Added')
})

//API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
  if (hasTodoProperty(request.body)) {
    const query = `
    UPDATE todo SET todo='${todo}' WHERE id=${todoId};`
    await database.run(query)
    response.send('Todo Updated')
  } else if (hasPriorityProperty(request.body)) {
    const query = `
    UPDATE todo SET priority='${priority}' WHERE id=${todoId};`
    await database.run(query)
    response.send('Priority Updated')
  } else if (hasStatusProperty(request.body)) {
    const query = `
    UPDATE todo SET status='${status}' WHERE id=${todoId};`
    await database.run(query)
    response.send('Status Updated')
  }
})

//API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo WHERE id=${todoId}`
  await database.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
