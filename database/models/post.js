const mongoose = require('mongoose');
const path = require('path');

const coverImageBasePath = 'uploads/postCovers'


const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  postDate:{
    type: Date,
    required: true
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now
  },
  coverImageName:{
    type:String,
    required:true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

PostSchema.virtual('coverImagePath').get(function(){
  if(this.coverImageName != null){
    return path.join('/',coverImageBasePath,this.coverImageName);
  }
});

module.exports = mongoose.model('Post',PostSchema);
module.exports.coverImageBasePath = coverImageBasePath;