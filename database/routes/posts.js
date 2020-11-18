const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/post');
const User = require('../models/user');
const { debug } = require('console');
const uploadPath = path.join('public', Post.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});



//All posts route
router.get('/',async (req,res) => {
  let query = Post.find();
  if(req.query.title != null && req.query.title != ''){
    query = query.regex('title', new RegExp(req.query.title,'i'));
  }

  if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('postDate',req.query.publishedBefore);
  }

  if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query = query.gte('postDate',req.query.publishedAfter);
  }

  try{
    const posts = await query.exec();
    res.render('posts/index',{
      posts:posts,
      searchOptions:req.query
    });
  }catch{
    res.redirect('/');
  }
  
})

//New post route
router.get('/new',async(req,res) => {
  renderNewPage(res,new Post());
});

//Create post route,
router.post('/',upload.single('cover'), async (req,res) =>{
  const fileName = req.file != null ? req.file.filename : null;
  const post = new Post({
    title: req.body.title,
    user: req.body.user,
    postDate:new Date(req.body.postDate),
    coverImageName: fileName,
    content:req.body.content
  });

  try{
    const newPost = await post.save();
    //res.redirect(`${posts/newPost.id}`);
    res.redirect('posts');
  }catch{
    renderNewPage(res,post,true);
  }
});

async function renderNewPage(res,post,hasError = false){
  try{
    const users = await User.find({});
    const params = {
      users: users,
      post: post
    }
    if(hasError) params.errorMessage = 'Error creating post';
    res.render('posts/new',params);
  }catch{
    if(post.coverImageName != null){
      removePostCover(post.coverImageName);
    }
    res.redirect('/posts');
  }
}

function removePostCover(filename){
  fs.unlink(path.join(uploadPath,filename) , err => {
    if(err) console.error(err);
  });
}

module.exports = router;