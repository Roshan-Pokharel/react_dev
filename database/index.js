const express = require('express');
const app = express();
const userModel = require('./database')

app.get('/', ( req, res)=>{
  res.send('hello world');
})

app.get('/create', async ( req, res)=>{
 let userData = await userModel.create({
    name:'ramesh',
    email:'ramesh@gmail.com',
    username:'ramesh'
  })
  res.send(userData);
})

app.get('/update', async ( req, res)=>{
 let updateUser = await userModel.findOneAndUpdate({username:'roshan'}, {name:'roshan pokharel'},{new : true}
 )
 res.send(updateUser);
})


app.get('/read', async ( req, res)=>{
let user = await userModel.find()
 res.send(user);
})

// app.get('/read', async ( req, res)=>{
// let user = await userModel.find({username : 'roshan'})
//  res.send(user);
// })


app.get('/delete', async ( req, res)=>{
let user = await userModel.findOneAndDelete({username : 'roshan'})
 res.send(user);
})


app.listen(3000, ()=>{
  console.log('server is running....');
})