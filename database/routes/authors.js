const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');


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
    res.redirect(`users/${newUser.id}`);
  }catch{
    res.render('users/new' , {
      user: user,
      errorMessage: 'Error creating user'
    });
  }
})

router.get('/:id',async(req,res) => {
  try{
    const user = await User.findById(req.params.id);
    const posts = await Post.find({user:user.id}).limit(6).exec();
    res.render('users/show',{
      user:user,
      postsByUser:posts
    })
  }catch{
    res.redirect('/');
  }
});


router.get('/:id/edit', async(req,res) => {
  try{
    const user = await User.findById(req.params.id);
    res.render('users/edit' , {user: user});
  }catch{
    res.redirect('/users');
  }
})

router.put('/:id', async(req,res) => {
  let user
  try{
    user = await User.findById(req.params.id);
    user.name = req.body.name;
    await user.save();
    res.redirect(`/users/${user.id}`);
  }catch{
    if(user == null){
      res.redirect('/')
    }else{
      res.render('users/edit' , {
        user: user,
        errorMessage: 'Error updated the user'
      });
    }
  }
})

router.delete('/:id',async(req,res) => {
  let user
  try{
    user = await User.findById(req.params.id);
    await user.remove();
    res.redirect("/users");
  }catch{
    if(user == null){
      res.redirect('/')
    }else{
      res.redirect(`/users/${user.id}`)
    }
  }
})

module.exports = router;