const express = require('express')
const cors = require('cors')
const app = express()
const apiTictapper = require('./apiTictapper');
const main = require('./main');
const bodyParser = require("body-parser")

app.use(bodyParser.json())

var corsOptions = {
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.listen(4300, () => {
  console.log('Node server started!')
})

//wehn getting the http.localhost:XXXX/api/cats it resturns {msg: "hola"}
app.route('/api/machine').get((req, res) => {
  res.send(apiTictapper.machine)
})

app.route('/api/status').get((req, res) => {
  res.send({status: "Everything is Fine"})
})
//when this.http.post<any>('http://localhost:8080/api/cats', {title: 'posts test'}).subscribe(data =>{console.log(data);})
//the msg is in the req.body and with res you can send a response
//post is for creating a new server side object
app.route('/api/createJob').post((req, res) => {
  res.status(201).send(req.body)
  console.log("post req: " + JSON.stringify(req.body));
})

//put is for adding a clied created object to the server side
app.route('/api/cats/:name').put((req, res) => {
  res.send(200, req.body)
  console.log("put");
})

//delete deletes....
app.route('/api/cats/:name').delete((req, res) => {
  res.sendStatus(204)
  console.log("delete");
})


//https://malcoded.com/posts/angular-backend-express/
//https://medium.com/bb-tutorials-and-thoughts/how-to-develop-and-build-angular-app-with-nodejs-e24c40444421
