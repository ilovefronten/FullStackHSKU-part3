require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Phonebook = require('./models/phonebook')

const app = express()

// Middlewares
app.use(express.static('dist')) // 设置build之后的前端网页(dist)为访问根目录时返回的网址
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
  const logger = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]

  if (tokens.method(req, res) === 'POST') {
    logger.push(JSON.stringify(req.body))
  }

  return logger.join(' ')
}))

/* Phonebook
.find({})
.then(persons => {
  console.log('phonebook:');
  persons.map(person => { console.log(`${person.name} ${person.number}`) })
  
}) */



let phonebook = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

// ChatGPT generated code to format time 
const getRequestTime = () => {
  const now = new Date();

  // 获取东八区时间并格式化
  const options = {
    timeZone: 'Asia/Shanghai', // 设置时区为东八区
    weekday: 'short',          // 星期简写，如 "Sat"
    year: 'numeric',
    month: 'short',            // 月份简写，如 "Dec"
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false              // 24小时制
  };

  // 使用 Intl.DateTimeFormat 格式化日期
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);

  // 手动拼接所需的格式："Sat Dec 14 2024 13:28:10 GMT+0800（Shanghai Time）"
  const formattedTime = `${parts[0].value} ${parts[2].value} ${parts[4].value} ${parts[6].value} ${parts[8].value}:${parts[10].value}:${parts[12].value} GMT+0800（Shanghai Time）`;

  console.log('Request Time:', formattedTime);

  return formattedTime
}

app.get('/api/persons', (request, response, next) => {
  Phonebook.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))    
})

app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(person => {
      if (person) {
        console.log(person);
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

app.get('/info', (request, response, next) => {
  Phonebook.find({})
    .then(persons => {
      const time = getRequestTime()
      const people = persons.length
      const infoText = `
        <p>Phonebook has info for ${people} people</p>
        <p>${time}</p>
      `
      response.send(infoText)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(person => {
      console.log(`${person} is deleted!`);
      response.status(204).end()
    })
    .catch(error => next(error))
})

// 接入数据库后就不需要自己生成id了
function getRandomId(max) {
  let id = Math.floor(Math.random() * max)
  while (phonebook.find(person => person.id === id.toString())) {
    id = Math.floor(Math.random() * max)
  }
  return id
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: `name missing`
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: `number missing`
    })
  }

  Phonebook.find({})
    .then(persons => {
      if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
          error: `${body.name} already exists`
        })
      }

      const newPerson = new Phonebook({
        // id: getRandomId(persons, 100000).toString(),
        ...body
      })

      newPerson.save()
        .then(newPerson => {
          console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
          response.json(newPerson)
        })
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndUpdate(request.params.id, request.body, { new: true })
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
}) 

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknow endpoint' })
}


const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(unknowEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})