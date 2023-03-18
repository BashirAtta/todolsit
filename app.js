

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
mongoose.connect('mongodb+srv://bashir_u31:isl-1234@cluster0.lgrhqtu.mongodb.net/todoListDB');

// define schema 
const itemSchema = new mongoose.Schema({
  name: String
});

//declare model 
const Item = mongoose.model("item", itemSchema);

//declare new documents 
const item1 = new Item({
  name: "welcom to your todo List "
});

const item2 = new Item({
  name: "hit + button to add in todo list "
});

const item3 = new Item({
  name: "check the check box to remove item from todo list"
});
const defaultItem = [item1, item2, item3];

// insert documents to the mongo db using model


//get document from collection 

//define list schema and model list for having dynamic and vaiurs list  refe 1.1.2
const listShcema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listShcema);

// define dynamic rout pages for having various list .refe 1.1.1
app.get("/:customlistName", function (req, res) {

  const customListName = _.capitalize(req.params.customlistName);
  List.findOne({ name: customListName }).then(function (foundList) {
    if (Error) {
      if (!foundList) {
        const list1 = new List({
          name: customListName,
          items: defaultItem
        });
        list1.save();
        res.redirect("/" + customListName);


      } else {

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    } else {
      console.log(Error);
    }

  });


});

app.get("/", function (req, res) {

  const day = "Today"
  // get defult items from mongo db
  Item.find().then(function (item) {
    if (item.length === 0) {
      Item.insertMany(defaultItem)
        .then(function () {
          if (!Error) {
            console.log(Error);
          } else {
            console.log("item is added");
            mongoose.connection.close();
          }
        });
      res.redirect("/");

    } else {
      res.render("list", { listTitle: day, newListItems: item });

    }
  });

});






app.post("/", function (req, res) {

  const itemEnterd = req.body.newItem;
  const listName = req.body.list;
  const nItem = new Item({
    name: itemEnterd
  });

  if (listName === "Today") {
    nItem.save();
    res.redirect("/");


  } else {
    List.findOne({ name: listName }).then(function (foundlist) {
      foundlist.items.push(nItem);
      foundlist.save();
      res.redirect("/" + listName);
    });

  }


});

app.post("/remove", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function (removeitem) { console.log(removeitem); });
    res.redirect("/");

  } else { 
    
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(fitem){
      res.redirect("/"+listName);
      console.log("is removed");
    });
    
  }
  



});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
