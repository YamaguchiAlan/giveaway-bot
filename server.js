const express = require("express")
const app = express()

app.set('port', process.env.PORT || 443);

app.use(express.urlencoded({extended: true}));
app.use(express.json())

module.exports = app