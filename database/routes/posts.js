const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const { debug } = require('console');
const { resolveAny } = require('dns');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif' , 'image/jpg'];



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
router.post('/', async (req,res) =>{
  const post = new Post({
    title: req.body.title,
    user: req.body.user,
    postDate:new Date(req.body.postDate),
    content:req.body.content
  });
  saveCover(post, req.body.cover);

  try{
    const newPost = await post.save();
    res.redirect(`/posts/${newPost.id}`);
  }catch{
    renderNewPage(res,post,true);
  }
});

//Show post route
router.get('/:id',async (req,res) =>{
  try{
    const post = await Post.findById(req.params.id).populate('user').exec();
    res.render('posts/show',{post:post});
  }catch{
    res.redirect('/');
  }
});

//Edit post route
router.get('/:id/edit',async(req,res) => {
  try{
    const post = await Post.findById(req.params.id);
    renderEditPage(res,post);
  }catch{
    res.redirect('/');
  }
});

//Update post route,
router.put('/:id', async (req,res) =>{
  let post
  try{
    post = await Post.findById(req.params.id);
    post.title = req.body.title;
    post.user = req.body.user;
    post.postDate = new Date(req.body.postDate);
    post.content = req.body.content;
    if(req.body.cover != null && req.body.cover !== ''){
      saveCover(post,req.body.cover);
    }
    await post.save();
    res.redirect(`/posts/${post.id}`);
  }catch{
    if(post != null){
      renderEditPage(res,post,true);
    }else{
      res.redirect('/');
    }
  }
});

//Delete post page
router.delete('/:id',async(req,res) =>{
  let post
  try{
    post = await Post.findById(req.params.id);
    await post.remove();
    res.redirect('/posts');
  }catch{
    if(post != null){
      res.render('posts/show',{
        post:post,
        errorMessage:'Could not remove post'
      });
    }else{
      res.redirect('/');
    }
  }
});



async function renderNewPage(res,post,hasError = false){
  renderFormPage(res,post,'new',hasError);
}

async function renderEditPage(res,post,hasError = false){
  renderFormPage(res,post,'edit',hasError);
}

async function renderFormPage(res,post,form,hasError = false){
  try{
    const users = await User.find({});
    const params = {
      users: users,
      post: post
    }
    if(hasError){
      if(form === 'edit'){
        params.errorMessage = 'Error updating post';
      }else{
        params.errorMessage = 'Error creating post';
      }
    }
    res.render(`posts/${form}`,params);
  }catch{
    res.redirect('/posts');
  }
}



function saveCover(post,coverEncoded){
  if(coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if(cover != null && imageMimeTypes.includes(cover.type)){
    post.coverImage = new Buffer.from(cover.data,'base64');
    post.coverImageType = cover.type;
  }
}

module.exports = router;