const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/', function(req, res){
  fs.readdir('./files', function(err, files){
   // console.log(files);
    res.render('index', {files: files});
  })
})


app.post('/submit', function(req, res){
  fs.writeFile(`./files/${req.body.title.split(' ').join('')}.txt`, req.body.details, function(err){
    console.error(err);
    res.redirect('/')
  });
  // console.log(req.body);
  // res.send('your form is submitted');
})

app.get('/more/:filename', function(req, res){
  fs.readFile(`./files/${req.params.filename}`, 'utf-8', function(err, filedata){
    res.render('show', {file:filedata});
  })
  });

  app.get('/edit/:filename', function(req, res){
    res.render('edit', {filename: req.params.filename})
  });

   app.post('/edits', function(req, res){
   fs.rename(`./files/${req.body.oldname}`,`./files/${req.body.newname}.txt`, function(err){
    console.error(err);
     res.redirect('/');
   });
  });


app.listen(3000, function(){
  console.log('server is running......');
});