const mongoose = require('mongoose');
const Post = require('./post');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

UserSchema.pre('remove', function(next){
  Post.find({user: this.id},(err,posts) =>{
    if(err){
      next(err);
    }else if(posts.length > 0){
      next(new Error('This user has posts still'));
    }else{
      next();
    }
  })
})

module.exports = mongoose.model('User',UserSchema);