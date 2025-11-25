const express = require('express');

const app = express()

app.use(function(req, res, next){
  console.log('middle ware is running');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/profile', (req, res) => {
  res.send('profile page')
})

app.listen(3000)