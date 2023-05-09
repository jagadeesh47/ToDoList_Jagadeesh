//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

const itemSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const Item=mongoose.model("Item",itemSchema);


const item1= new Item({
    name:"eat"
});
const item2= new Item({
   name:"code"
});
const item3= new Item({
  name:"sleep"
});

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {

  //const day = date.getDate();
  Item.find().then((list)=>{
    if(list.length===0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: list});
    }
  });
});

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List=mongoose.model("List",listSchema);
 
app.get("/:pagename",function(req,res){
  const requestedPage=_.capitalize(req.params.pagename);
   if(requestedPage==="About")
   {
    res.render("about");
   }
  List.find({name:requestedPage}).then((arr)=>{
    if(arr.length===0){
      const newList=new List({
        name:requestedPage,
        items:defaultItems
      });
      newList.save();
      res.redirect("/"+requestedPage);
    }
    else{
      res.render("list",{
        listTitle:requestedPage,
        newListItems:arr[0].items
      });
      //console.log("Already existed");
    }
  });
  
  //newList.save();
});

app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",async (req,res) => {
  try{
    //console.log(req.body.checkbox);
    const listName=req.body.listName;
    const todeleteItem=req.body.checkbox;
    if(listName==="Today"){
      await Item.findByIdAndRemove(todeleteItem);
      res.redirect("/");
    }
    else{
      await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:todeleteItem}}});
      res.redirect("/"+listName);
    }
  }catch(err){
    console.log(err);
  }  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
