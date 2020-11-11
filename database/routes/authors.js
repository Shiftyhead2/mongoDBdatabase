const express = require('express');
const router = express.Router();
const User = require('../models/user');


//All users route
router.get('/',async (req,res) => {
  let searchOptions = {}
  if(req.query.name != null && req.query.name !== ''){
    searchOptions.name = new RegExp(req.query.name , 'i')
  }
  try{
    const users = await User.find(searchOptions);
    res.render('users/index' , {user: users , searchOptions: req.query});
  }catch{
    res.redirect('/');
  }
  
})

//New user route
router.get('/new',(req,res) => {
  res.render('users/new' , {user: new User()});
})

//Create user route
router.post('/', async (req,res) =>{
  const user = new User({
    name:req.body.name
  })
  try{
    const newUser = await user.save();
    res.redirect('users');
  }catch{
    res.render('users/new' , {
      user: user,
      errorMessage: 'Error creating user'
    });
  }
})

module.exports = router;