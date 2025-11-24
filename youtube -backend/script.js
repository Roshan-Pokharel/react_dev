const fs = require('node:fs');
// fs.appendFile("test-file.txt", "I have added this sentance", function(err){
//   if(err) console.error(err);
//   else console.log("done");
// });

// fs.rename('test-file.txt', 'test.txt' ,function(err){
//   if(err) console.log(err);
//   else console.log('done')
// })

// fs.copyFile('test.txt', './copy.txt', function(err){
//    if(err) console.log(err);
//      else console.log('done');
// }
// )

fs.unlink('./copy.txt',function(err){
   if(err) console.log(err);
      else console.log('done');
  }
 )