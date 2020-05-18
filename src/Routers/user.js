const express = require('express')
const User = require('../Models/user')
const userRouter = new express.Router();
const auth = require('../middleware/auth')

userRouter.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next();
})

//signup route
userRouter.post('/users',async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user,token});
    }catch(e){
       res.status(400).send(e);
    }
})

//login route
userRouter.post('/users/login',async (req,res) =>{
    try{
       const user = await User.findByCredentials(req.body.email,req.body.password);
       const token = await user.generateAuthToken();
       res.send({user,token})
    }catch(e){
        res.status(400).send();
    }
})


//logout
userRouter.post('/users/logout',auth,async (req,res) => {
    try{
       req.user.tokens = req.user.tokens.filter((token) => {
           return token.token !== req.token;
       })
       await req.user.save();
       res.send();
    }catch(e){
       res.status(500).send();
    }
})

//logoutall
userRouter.post('/users/logoutAll',auth, async (req,res) => {
    try{
       req.user.tokens = []
       await req.user.save();
       res.send();
    }catch(e){
       res.status(500).send();
    }
})


//get users route
userRouter.get('/users', auth ,async (req,res) => {

    try{
        const users = await User.find({})
        res.status(201).send(users);
    }catch(e){
       res.status(500).send(e)
    }
})

//read profile
userRouter.get('/users/me', auth ,async (req,res) => {
     res.send(req.user);
})

//get user by id route
userRouter.get('/users/:id',async (req,res) => {
    const _id = req.params.id;
    try{
        const user = await  User.findById(_id)
        if(!user){
            return res.status(404).send();
        }
        res.send(user);
    }catch(e){
       res.status(500).send(e)
    }
  })

  //update user route
  userRouter.patch('/users/me', auth, async (req,res) => {
      const updates = Object.keys(req.body)
      const allowedUpdates = ['name','password','age','email']
      const isValidOperation = updates.every((update)=>{allowedUpdates.includes(update)})
      if(isValidOperation){
          return res.status(400).send('invalid update')
      }
    const _id = req.params.id;
    try{
       
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save();
        res.send(req.user);
    }catch(e){
       res.status(500).send(e)
    }
  })


  //delete user route
  userRouter.delete('/users/me', auth, async (req,res) => {
    // const _id = req.user._id;
    try{
        // const user = await  User.findByIdAndDelete(_id);
        // if(!user){
        //     return res.status(404).send();
        // }
        await req.user.remove()
        res.send(req.user);
    }catch(e){
       res.status(500).send(e)
    }
  })



  module.exports = userRouter;