import express from "express";
import pg from "pg";

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
const port=3000;
let today=[];
let week=[];
let month=[];

const db=new pg.Client({
    user:"postgres",
    password:"geach3212",
    database:"persistance",
    host:"localhost",
    port:5432,
  })
  db.connect();

  async function thistoday() {
    const result =await db.query("SELECT * FROM today ORDER BY id asc;")
    today=result.rows;
  }

app.get("/",async(req,res)=>{
   await thistoday();
   res.render("index.ejs",{
    item:today,
   })
    
})
app.post("/delete",async(req,res)=>{

    const id=req.body.userid;
    try{
        await db.query("DELETE FROM today WHERE id=$1",[id])
        res.redirect("/")
    }catch(err){
        console.log(err);
    }
})

app.post("/add",async(req,res)=>{
    const t_start=req.body.timeS;
    const t_end=req.body.timeE;
    const news=req.body.new;

    try{
     await db.query("INSERT INTO today (title,t_start,t_end) VALUES($1,$2,$3)",[news,t_start,t_end])
     res.redirect("/")
    }catch(err){
        console.log(err);
    }

})

app.post("/edit",async(req,res)=>{
   const title=req.body.change;
   const times=req.body.timeS;
   const timeE=req.body.timeE;
   const id=req.body.id;

   try{
       await db.query("UPDATE today SET title=$1, t_start=$2,t_end=$3 WHERE id=$4;",[title,times,timeE,id]);
       res.redirect("/");
   }catch(err){
    console.log(err);
   }
})
app.listen(port,()=>{
    console.log(`your server is running on port ${port}`)
})