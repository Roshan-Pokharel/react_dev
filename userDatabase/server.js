const express = require('express');
const app = express();
const path = require('path');
const userData = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.get('/', (req, res)=>
{
  res.render('index');
})

app.get('/read', async (req, res)=>{
 let users = await userData.find();
 res.render('read', {users})
})

app.post('/create', async (req, res)=>
{
  let {name , email , image } = req.body;
  let createdUser = await userData.create({
    name,
    email,
    image
  })
  res.redirect('/read');
  //res.render('read' , {users : createdUser});
})

app.get('/delete/:userId',async (req,res)=>{
 await userData.findOneAndDelete({ _id : req.params.userId});
  res.redirect('/read');
} )

app.get('/edit/:userId',async (req,res)=>{
 const user = await userData.findOne({ _id : req.params.userId});
  res.render('edit', {user});
} )

app.post('/update/:id', async (req, res)=>
{
  let {name , email , image } = req.body;

  let createdUser = await userData.findOneAndUpdate({_id:req.params.id}, {name, email, image}, {new:true})
  res.redirect('/read');
  //res.render('read' , {users : createdUser});
})

app.listen(3000);