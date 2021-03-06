if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();

}


const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');


const indexRouter = require('./routes/index');
const userRouter = require('./routes/authors');
const postRouter = require('./routes/posts');

app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb' , extended:true}));

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true , useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoose'));


app.use('/',indexRouter);
app.use('/users',userRouter);
app.use('/posts',postRouter);

app.listen(process.env.PORT || 3000);