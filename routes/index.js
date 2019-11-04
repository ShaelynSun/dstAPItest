var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
require('../connect.js');
require('../models/usr');
const Usr = mongoose.model('Usr');


/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Dynamic Story Telling' });
});

router.get('/reg',function(req,res,next) {
  res.render('reg', {title: 'register',});
});

router.get('/login',function(req,res,next){
    res.render('login',{title:'login',});
});

router.register_user = (req, res) =>{
  res.setHeader('Content-Type', 'application/json');
  var user = new Usr({
    name:req.body.name,
    pwd:req.body.pwd
  });
  Usr.findOne({'name':user.name},function(err,data){
    if(data != null){
      res.json({ message: 'the user has already existed', data: user} );
      // return res.redirect('/reg');
    }else{
      user.save(function(err){
        if(err){
          res.json({ message: 'User NOT Added!', errmsg : err } );
          // return res.redirect('/');
        }else{
            res.json({data: user.name, message: 'User Added!'});
            // res.redirect('/');
        }
      })
    }
  })
};

router.login_user = (req, res) => {
  Usr.findOne({'name':req.body.name},function(err,user){
    if(!user){
      res.json({ message: 'the user is not existed, go to register'} );
    } else if(user.pwd != req.body.pwd){
      res.json({ message: 'the password is wrong'} );
    } else {
      res.json({data: user.name, message: 'login successfully'});
    }
  });
} ;

module.exports = router;
