const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const { debug } = require('console');
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