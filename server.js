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

//Port Listening Server
app.listen(8080);
//Connection to MongoDB
mongoose.connect(
    process.env.DB_CONNECTION,
    {   useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },

    ()=> console.log('Connected to MongoDB!')
);
//Check the connection to MongoDB
mongoose.connection.on('error', console.error.bind(console, 'Error connection to MongoDB'))
//POST Request for user Registration
router.post('/register', (req, res) => {
    const {firstName, lastName, password, isTrainer} = req.body;
    let {email} = req.body;
    //Verify User
    //Convert email to lower case
    email= email.toLowerCase().trim();
    //Verify email doesn't exist
    //**Need to verify this -email veify- method**
    User.find({email:email},(err, previosUsers)=>{
        if(err){
            res.send({
                succes: false,
                message:'Error: Server Error!'});
        } else if (previosUsers.length>1){
            console.log(previosUsers);
            return res.send({
                succes: false,
                message: 'The email address is already exist.'
            });
        }
    });
    //Save the new user
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.isTrainer = isTrainer;
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
            res.send({succes: false,
                error: err,
            });
        } else {
            res.send({
                succes: true,
                message:'Signup succesfuly! Please Login.'
            });

        }
    });
});
//POST Request for user Login
router.post('/login', (req, res, next) => {
    const {password} = req.body
    let {email} = req.body
    //Verify User
    if(!email){
        return res.send({
            succes: false,
            message: 'Email cannot be empty!'
        });
    };
    if(!password){
        return res.send({
            succes: false,
            message: 'Password cannot be empty!'
        });
    };
    //Convert email to lower case
    email = email.toLowerCase();
    //Find the user and check the password
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
                message: 'Invalid e-mail!'
            });
        };
        const user = users[0];
        if(!user.validPassword(password)){
                return res.send({
                    succes: false,
                    message: 'Invalid Password!'
                });
        };
        //Create new user session
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
               isTrainer: user.isTrainer,
               userid: user._id
           });
        });
    });
});
//Verify the token of user
router.get('/verify', (req, res, next) => {
    const {token} = req.query;
//Check the user and token is ok
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
//GET Request for user Logout
router.get('/logout', (req, res, next)=>{
    const {token} = req.query
    //Check the user and set isDeleted to TRUE
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
//Load the user informations for Profile
router.get('/userInfo/', function(req, res){
    const {id}=req.query
    //Find the user in MobgoDB
    User.find({_id: id}, function(err, docs){
        if(err) {
            return res.send({
                succes: false,
                message: 'ERROR: Server ERROR!'
            });s
            //Send the data to FrontEnd
        } else {
            res.send(docs)
        }
    })
});
//Update the user informations(Save)
router.post('/updateUserInfo/', function(req, res){
    const {id}=req.query
    //Data for update
    const dataSend = req.body
    //Find the user in MobgoDB and sent the update
    User.findOneAndUpdate({_id: id}, dataSend, (err, result)=>{
        if(err){
            res.status(404).end({
                succes: false,
                message: 'ERROR: Server ERROR!'
            })
        }
        return res.send({
            succes: true,
            message: 'Update!'
        })
    })//Check the file exist
        .then(doc=>{
            if(!doc){
                return res.status(404).end;
            }
            return res.status(200).json(doc);
        })
        // .catch(err=>console.log(err))
});