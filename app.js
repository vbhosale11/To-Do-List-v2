

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");

const app = express();

const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB");  //specifies the connection to mongodb data base 


const itemsSchema={
  name:String                                   //schema
};

const Item=mongoose.model("Item", itemsSchema);
                                                            //mongoose model  table like

const item1= new Item({
  name:"Welcome to your todolist."    //new document  tuple like (entires in model)
});

const item2= new Item({
  name:"Hit the + button to add the new item."  //new document tuple like (entries in model)
});

const item3= new Item({
  name:"<--- Hit this to delete an item."
});
 
const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]    //array of items based on array of itemsSchema 
};

const List =mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){


    if(foundItems.length == 0){
      Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  }
  else {
    console.log("Succcessfully saved the items to database.");
  }
})

res.redirect("/");

    }
    else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
 

});


//instead of writing app.get for every new route we create we can use express route parameters which initializes the route dynamically

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);   // use lodash so that even if we capitalise the route name it will come default as small or will take to the same even if we type the naem in small or capital.

List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list= new List({
        name: customListName,     //document for list model
        items:defaultItems
      });
    
      list.save();
      res.redirect("/"+ customListName);
    }
  
    else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
  }
}
});

});
 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();  //instead of insert one or many we can use this to save entry in our module
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }
});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted the checked item.");
        res.redirect("/");
      }
      
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  } 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
