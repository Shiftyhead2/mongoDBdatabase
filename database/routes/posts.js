const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path')
const Post = require('../models/post');
const User = require('../models/user');
const uploadPath = path.join('public', Post.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})



//All posts route
router.get('/',async (req,res) => {
  res.send('All posts');
})

//New post route
router.get('/new',async(req,res) => {
  renderNewPage(res,new Post())
})

//Create post route,
router.post('/',upload.single('cover'), async (req,res) =>{
  const fileName = req.file != null ? req.file.filename : null
  const post = new Post({
    title: req.body.title,
    user: req.body.user,
    postDate:new Date(req.body.postDate),
    wordCount:req.body.wordCount,
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
})

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

module.exports = router;