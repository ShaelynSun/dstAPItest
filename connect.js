let mongoose = require('mongoose');
// var mongodbUri = 'mongodb+srv://shaelyn:qpalzm14602@wit-donation-cluster-aqvk6.mongodb.net/dynamicstory?retryWrites=true&w=majority';
var mongodbUri = 'mongodb://localhost:27017/dstdb';
mongoose.connect(mongodbUri,
    {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;

db.on('error', function (err) {
    console.log('Unable to Connect to [ ' + db.name + ' ]', err);
});

db.once('open', function () {
    console.log('Successfully Connected to [ ' + db.name + ' ]');
});