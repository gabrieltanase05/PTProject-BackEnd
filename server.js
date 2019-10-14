const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const User = require('./models/user');
const UserSession = require('./models/userSession');
require('dotenv/config');

app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

//Listening Server
app.listen(8080);

//Connect to db.mongo
mongoose.connect(
    process.env.DB_CONNECTION,
    {   useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },

    ()=> console.log('Connected to MongoDB!')

);

//Check the connection to db.mongo
mongoose.connection.on('error', console.error.bind(console, 'Error connection to MongoDB'))


//Register the user
router.post('/register', (req, res, next) => {
    const {firstName, lastName, password} = req.body.dataPost;
    let {email} = req.body.dataPost;

    //Verify User
    //Convert email to lower case
    email= email.toLowerCase();
    //Verify email doesn't exist
    //**Need to verify this -email veify- method**
    User.find({email:email},(err, previosUsers)=>{
        if(err){
            res.status(400).send({
                succes: false,
                message:'Error: Server Error!'});
        } else if (previosUsers){
            return res.status(400).send({
                succes: false,
                msg: 'The email address is already exist.'
            });
        }
    });
    //Save the user!
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = user.generateHash(password);
    if(!firstName){
        return res.end({
            succes: false,
            message: 'ERROR: First Name cannot be empty!'
        });
    };
    if(!lastName){
        return res.end({
            succes: false,
            message: 'ERROR: Last Name cannot be empty!'
        });
    };
    if(!email){
        return res.end({
            succes: false,
            message: 'ERROR: Email cannot be empty!'
        });
    };
    if(!password){
        return res.end({
            succes: false,
            message: 'ERROR: Password cannot be empty!'
        });
    };
    user.save((err) => {
        if (err){
            res.json({succes: false,
                error: err,
            });
        } else {
            res.json({succes: true});
        }

    });
});
//Login the user
router.post('/login', (req, res, next) => {
    const {password} = req.body.dataPost
    let {email} = req.body.dataPost
    //Verify User
    if(!email){
        return res.send({
            succes: false,
            message: 'ERROR: Email cannot be empty!'
        });
    };
    if(!password){
        return res.send({
            succes: false,
            message: 'ERROR: Password cannot be empty!'
        });
    };
    //Convert email to lower case
    email = email.toLowerCase();
    //Fint the user and check the password
    User.find({
    email: email
    }, (err, users)=>{
        if(err){
            return res.send({
                succes: false,
                message: 'ERROR: Server ERROR!'
            });
        };
        if(users.length != 1){
            return res.send({
                succes: false,
                message: 'ERROR: Invalid E-mail!'
            });
        };
        const user = users[0];
        if(!user.validPassword(password)){
                return res.send({
                    succes: false,
                    message: 'ERROR: Invalid Password!'
                });
        };
        const userSession = new UserSession();
        userSession.userID = user._id;
        userSession.save((err, doc)=>{
           if(err){
               return res.send({
                   succes: false,
                   message: "ERROR: Server error!"
               });
           }
           return res.send({
               succes: true,
               message: 'Valid Login!',
               token: doc._id,
               userid: user._id
           });
        });
    });
});
//Verify the user ---INCOMPLETED AND UNVERIFY PROCESS---
router.get('/verify', (req, res, next) => {
//Get the token
    const {token} = req.query;
//Verify the token is one of the kithe_main_appnd and is not deleted
    UserSession.find({
        _id: token,
        isDeleted: false
        },(err, sessions)=>{
            if(err){
                return res.send({
                    succes: false,
                    message: 'ERROR: Server ERROR!'
                });
            };
            if(sessions.length!=1){
                return res.send({
                    succes:false,
                    message: 'ERROR: Invalid'
                });
            } else {
                return res.send({
                    succes:true,
                    message: 'Good!'
                })
            }
        });
});
//Logout
router.get('/logout', (req, res, next)=>{
    const {token} = req.query
    UserSession.findOneAndUpdate({
        _id: token,
        isDeleted: false
    }, {
        $set:{isDeleted:true}
    }, null, (err, sessions)=>{
        if(err){
            return res.send({
                succes: false,
                message: 'ERROR: Server ERROR!'
            });
        };
        return res.send({
            succes:true,
            message: 'Good!'
        });
    })
});
//Load user info
router.get('/userInfo/', function(req, res){
    const {id}=req.query
    User.find({_id: id}, function(err, docs){
        if(err) {
            return res.send({
                succes: false,
                message: 'ERROR: Server ERROR!'
            });s
        } else {
            res.send(docs)
        }
    })
});
//Update user info(Save)
router.post('/updateUserInfo/', function(req, res){
    const {id}=req.query
    const dataSend = req.body
    User.findOneAndUpdate({_id: id}, dataSend, (err, result)=>{
        if(err){
            res.status(404).end
        }
        return console.log(result)
    })
        .then(doc=>{
            if(!doc){
                return res.status(404).end;
            }
            return res.status(200).json(doc);
        })
        // .catch(err=>console.log(err))
});
