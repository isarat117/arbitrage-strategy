const data = require('../app')
const express = require('express')

const depth = require('./depth')
const app = express()
app.set("view engine", "ejs")
const port = 3000

app.get('/tahta/:coin', async(req, res) => {
   
    const tahta = await depth.getDepth(req.params.coin)
       res.render("depth",
       {
        tahta:tahta
       })
       res.end()
      
});

app.get('/percent/:id/:id2', async(req, res) => {
   
    const data = await dataRend(req.params.id,req.params.id2);
    
       res.render("data",
       {
        data:data
       })
       res.end()
      
});

app.get('/', async(req, res) => {
    const data = await dataRend(5,10);
    
       res.render("data",
       {
        data:data
       })
       res.end()
      
  });
const dataRend =async (from,where)=>{
    const data1 = await data.dataEkle(from,where)
    return data1;
}








app.listen(port, () => 
{console.log(`Uygulama ${port} portunda çalışıyor!`)}
)
