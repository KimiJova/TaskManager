const express = require('express');
const app = express();

const {mongoose} = require('./db/mongoose');
const bodyParser = require('body-parser');

// Load middleware
app.use(bodyParser.json());

//Load in the mongoose models

const {List, Task} = require('./db/models');

//CORS HEADER MIDDLEWARE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

/* ROUTE HANDLERS */


/* LIST ROUTES */


//GET /lists to get all lists
app.get('/lists', (req, res) => {
    //res.send("Hello World!");
        // We want to return an array of all the lists in the database
        List.find({}).then((lists) => {
            res.send(lists);
        });
});

//POST /lists to create lists
app.post('/lists', (req, res)=> {
    //We want to create a new lis and return the new list doucemnt back to the user which includes the id
    //the list info will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc)=>{
        // the full list document is returned
        res.send(listDoc);
    })
});

//PATCH /lists/:id update a specified list
app.patch('/lists/:id', (req, res) => {
    //We want to update the specifeid list with the new values spceified in the JSON body of the request
    List.findOneAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(()=>{
        res.sendStatus(200);
    });
});

app.delete('/lists/:id', (req, res) =>{
    //We want to delete the specified list
    List.findOneAndRemove({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});

/* TASK ROUTES */

//GET /lists/:listId/tasks to get all tasks from a specific list
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({
        _listId: req.params.listId // Use req.params.listId instead of req.params._listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId, // Use req.params.taskId instead of req.params._id
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
});

//POST /lists/:listId/tasks to create a new task in a specific list
app.post('/lists/:listId/tasks', (req, res) => {
    //We want to create a new task in a list specified by listId
    
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    })
});

//PATCH /lists/:listId/tasks/taskId to update an existing task specified by task id
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({_id: req.params.taskId , _listId: req.params._listId
    }, {
        $set: req.body
    }
    ).then(()=>{
        res.sendStatus(200);
    })
});

//DELETE /lists/:listId/tasks/:taskId to delete the task
app.delete('/lists/:listId/tasks/:taskId', (req, res)=> {
    Task.findOneAndRemove({
        _id: req.params.taskId,
        _listId: req.params._listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    })
});


app.listen(3000, () =>{
    console.log("Server is listening on port 3000");
});