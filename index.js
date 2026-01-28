import e from "express";
import express from "express";
import pg from "pg";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

env.config();

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port=3000;
let today=[];
let week=[];
let month=[];

const db=new pg.Client({
    connectionString:process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
        if(!news) throw new Error("Task cannot be empty");
        if(t_start && !t_end){
  await db.query("INSERT INTO today (title,t_start) VALUES($1,$2)",[news,t_start])
        }else if(!t_start && t_end){
  await db.query("INSERT INTO today (title,t_end) VALUES($1,$2)",[news,t_end])
        }else if(t_start && t_end){
  await db.query("INSERT INTO today (title,t_start,t_end) VALUES($1,$2,$3)",[news,t_start,t_end])
        }else{
  await db.query("INSERT INTO today (title) VALUES($1)",[news])
        }
   
     res.redirect("/")
    }catch(err){
        console.log("error on adding new task",err.message);
        res.redirect("/");
    }

})

app.post("/edit",async(req,res)=>{
   const title=req.body.change;
   const times=req.body.timeS;
   const timeE=req.body.timeE;
   const id=req.body.id;

   try{
    if(!title) throw new Error("Task cannot be empty");
     if(!times && timeE){
        await db.query("UPDATE today SET title=$1, t_end=$2 WHERE id=$3;",[title,timeE,id]);
      
     }else if(times && !timeE){
        await db.query("UPDATE today SET title=$1, t_start=$2 WHERE id=$3;",[title,times,id]);
     }else if(!times && !timeE){
        await db.query("UPDATE today SET title=$1 WHERE id=$2;",[title,id]);
     }else{
        await db.query("UPDATE today SET title=$1, t_start=$2, t_end=$3 WHERE id=$4;",[title,times,timeE,id]);
     }
       
       res.redirect("/");
   }catch(err){
    console.log(err);
   }
})
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running on http://localhost:${port}`);
  });
}

export default app; // This is the most important line for Vercel!