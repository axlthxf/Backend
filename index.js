var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const saltRounds = 10



var mongoose = require('mongoose');
app.use(cors("http://localhost:5173"));
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

router.post('/signup', (req, res) => {

    User.find({ email: req.body.email }).then(
        (usr) => {
            if (usr.length > 0) {
                res.status(406).send({ "error": "user already exists" })
            } else {
                bcrypt.hash(req.body.password, saltRounds, function (err, hash) {

                    var newuser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash

                    })

                    newuser.save().then((doc) => {
                        res.send(doc)
                    })
                });
            }
        }
    )

})

router.post('/signin', async (req, res) => {
    const usernew = await User.find({ email: req.body.email });

    if (usernew.length > 0) {

        bcrypt.compare(req.body.password, usernew[0].password, function (err, result) {

            if (err) console.error(err)

            console.log(result)

            res.send({

                "username": usernew[0].username,
                "email": usernew[0].email,
                "todos": usernew[0].todos,
            })

        });
    } else {

        console.log("user does not exist")
        res.status(404).send({ "msg": "user does not exist" })

    }
})

router.post("/addtodo", (req, res) => {
    var todo = {
        time: Date.now(),
        name: req.body.name,
        description: req.body.description,
        completed: false
    }

    User.findOne({ email: req.body.email }).then((usr) => {

        usr.todos.push(todo)

        usr.save().then((doc) => {
            res.send(doc)
        })

    })
})

router.post("/updatetodosstatus", async (req, res) => {
    await User.findOne({ email: req.body.email }).then((usr) => {
        var newone = usr.todos.id(req.body._id)
        newone.completed = !newone.completed

        usr.save().then((doc) => {
            res.send(doc)
        })
    })
})

router.post('/edittodos', async (req, res) => {
    await User.findOne({ email: req.body.email }).then((user) => {
        var edit = user.todos.id(req.body._id)

        if (req.body.name) {
            edit.name = req.body.name
        }

        if (req.body.description) {
            edit.description = req.body.description
        }
        user.save().then((doc) => {
            res.send(doc)
        })
    })
})

router.post('/deletetodo', async (req, res) => {
    await User.findOne({ email: req.body.email }).then((user) => {
        var del = user.todos.id(req.body._id)
        user.todos.pull(del)
        user.save().then((doc) => {
            res.send(doc)
        })
    })
})
