var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/myapp')
    .then(() => console.log('connected to mongoDB'))

var userschema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    todos: [{
        time: Date,
        name: String,
        description: String,
        completed: Boolean
    }]
})

var User = mongoose.model('users', userschema)

app.listen("3000", () => {
    console.log("server started");
});

app.use("/", router)
router.use(bodyParser.json())

// const users=[
//     {
//         id:1,
//         name:"althaf"
//     },
//     {
//         id:2,
//         name:"Fabin"
//     }
// ]


router.post('/signup', (req, res) => {

    User.find({ email: req.body.email }).then(
        (usr) => {
            if (usr.length > 0) {
                res.send("user already exists")
            } else {
                
                var newuser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
            
                })
            
                newuser.save().then((doc) => {
                    res.send(doc)
                })
            }
        }
    )
    
})

router.post('/signin', async (req, res) => {
    const usernew = await User.find({ email: req.body.email, password: req.body.password });

    if (usernew.length > 0) {
        console.log("user exists")
        res.send(usernew)
    } else {

      console.log("user does not exist")
      res.send("user does not exist")
    }
})
router.post("/addtodo",  (req, res) => {
    var todo = {
        time: Date.now(),
        name: req.body.name,
        description: req.body.description,
        completed: false
    }

    User.findOne({email:req.body.email}).then((usr)=>{

        usr.todos.push(todo)

        usr.save().then((doc)=>{
            res.send(doc)
        })

    })
})

router.post("/updatetodos", (req, res) => {
    User.findOne({email:req.body.email}).then((usr)=>{
        usr.todos.map((todo)=>{
            if(todo._id == req.body._id)
            {
                todo.completed = !todo.completed;
            }
        })
        usr.save().then((doc)=>{
            res.send(doc)
        })
    })
})
