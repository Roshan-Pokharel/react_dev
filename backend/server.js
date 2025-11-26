const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(express.static(path.join(__dirname,'public')));
// app.set('view engine', 'ejs');

// app.use(function(req, res, next){
//   console.log('middle ware is running');
//   next();
// })
//
// app.get('/', (req, res) => {
//   res.render("index.ejs");
// })

app.get('/profile/:username', (req, res) => {
  res.send(`welcome ${req.params.username}`)
})
 
app.listen(3000)