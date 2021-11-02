const express = require('express');
const theRoutes = require('./backend/index.js')
const app = express();
const PORT = process.env.PORT || 3000; // this is to be changed to dynamically work with the heroko port 
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(theRoutes);
app.use("/", (req, res) => {
    res.status(404).send("You shouldnt be here");
})

app.listen(PORT, () => {
    console.log(`Server started, listeing on port ${PORT}`);
});