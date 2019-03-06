var express = require('express');

var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const flash = require('express-flash')

app.use(flash());

app.listen(8000, function () {
    console.log("************CONNECTED************")
});

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messageboard');
mongoose.Promise = global.Promise;

var CommentSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 4 },
    content: { type: String, required: true, minlength: 4 }
}, { timestamps: true });

var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 4 },
    content: { type: String, required: true, minlength: 4 },
    comments: [CommentSchema]
}, { timestamps: true });

const Comment = mongoose.model('Comment', CommentSchema);
const Message = mongoose.model('Message', MessageSchema);

app.get('/', function (req, res) {

    Message.find({}).populate("comments").exec(function (err, data) {
        if (err) {
            console.log('Something went wrong', err);
        } else {
            res.render('index', { messages: data });
        };
    });
});

app.post('/message', function (req, res) {
    console.log(req.body);

    var new_message = new Message(req.body)

    new_message.save(function (err) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log('Successfully added')
            res.redirect('/')
        }
    });
});

app.post("/comment/:id", function (req, res) {
    console.log(req.params.id);
    Comment.create(req.body, function (err, data) {
        if (err) {
            console.log("FIRST ERROR", err)
            res.redirect("/")
        } else {
            Message.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: data } }, function (err, data) {
                if (err) {
                    console.log("SECOND ERROR", err)
                    res.redirect("/")
                } else {
                    console.log("SUCCESS")
                    res.redirect("/")
                }
            })
        }
    })
});

