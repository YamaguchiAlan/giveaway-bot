const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI
? process.env.MONGODB_URI
: 'mongodb://localhost/databasetest'

mongoose.connect(URI, (err) => {
    if(err) throw err;
    console.log('DB is connected')
});