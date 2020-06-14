const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const taskSchema = new mongoose.Schema({
    task: String,
    due: String
})

const Task = new mongoose.model( 'Task', taskSchema );

/* const lunch = new Task ({
    task: 'Almoçar',
    due: '14:30'
})

const study = new Task ({
    task: 'Seguir este módulo',
    due: '17:00'
})

const draw = new Task ({
    task: 'Desenhar um pouquito',
    due: '16:00'
})
 */
/* Task.insertMany(
    [lunch, study, draw],
    (err) => {
        err ? console.warn(err)
        :
            console.log("Sucessfully saved the tasks.")
    }
) */

// starts the todo list array, which will be reseted everytime the root route is called
let todoListArray = [];


// async function so the todo list array is not reseted at the wrong time
app.get( "/", async function (req, res) {

    todoListArray = [];
    
    await Task.find( {}, (err, tasks) => {
        err ? console.log(err)
        :
            tasks.forEach( (task) => {
                todoListArray.push(task);
            })

            res.render( "todolist", {
                theTitle: "To Do List",
                theDate: date.getDate(),
                todoList: todoListArray                
            })            
    });   

})

app.post( "/", function (req, res) {

    let newItem = new Task ({
        task: req.body.newTask,
        due: req.body.taskDue
    });

    console.log(newItem);

    newItem.save();

    res.redirect("/");

})

app.get("/work", function (req, res) {
    
    res.render( "todolist", {
        theTitle: "To Do List - Work",
        theDate: date.getDate(),
        toDoList: workToDoList
    })

})

app.post("/work", function (req, res) {

    let newItem = req.body.newToDo;
    workToDoList.push(newItem);

    res.redirect("/work");

})

app.get("/about", function (req, res) {
    res.render("about");
})

const desiredPort = 7777;
app.listen(desiredPort, function () {
    console.log(`Server is up and running on port ${desiredPort}, dude!`);
})