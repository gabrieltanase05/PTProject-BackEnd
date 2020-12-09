const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    dateOfBirth: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    foodType: {
        type: String,
        default: ''
    },
    goal: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    medicalIssues: {
        type: String,
        default: ''
    },
    training: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: 'https://live.mgm-tp.com/wp-content/uploads/2019/04/default-avatar.png'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isTrainer: {
        type: Boolean,
        default: false
    }
});
//Crypt the user password
    UserSchema.methods.generateHash = function(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };
    UserSchema.methods.validPassword =function(password) {
        return bcrypt.compareSync(password, this.password);
    };


module.exports = mongoose.model('User', UserSchema)