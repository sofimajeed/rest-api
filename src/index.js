const express = require('express');
const userRouter = require('./Routers/user');
require('./db/mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(userRouter)
app.listen(port , () =>{
    console.log('app is listening on port '+port)
});
