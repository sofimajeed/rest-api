
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt  = require('bcryptjs');
const jwt  = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        validate(value){
            if(value.length<6){
                throw new Error('length must be graeter than 6')
            }
        }
    },
    email:{
        type:String,
        required: true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('not a valid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
    
})

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},'mynewcourse');
 
    user.tokens = user.tokens.concat({token})
    user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('unable to login')
    }
    return user;
}

userSchema.pre('save',async function(next){
     const user = this;
     if(user.isModified('password')){
         user.password = await bcrypt.hash(user.password,8)
     }
     next()
})

const User = mongoose.model('user',userSchema )

module.exports = User