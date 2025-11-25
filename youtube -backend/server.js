import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('this is main page')
})

app.get('/profile', (req, res) => {
  res.send('Hello World')
})

app.listen(3000)