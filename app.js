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


// instruction tasks
const firstInstruction = new Task ({
    task: 'Liste suas tarefas',
    due: 'com uma data de finalização'
})

const secondInstruction = new Task ({
    task: 'Use os campos abaixo para adicionar uma tarefa',
    due: 'today'
})

const thirdInstruction = new Task ({
    task: 'E este botão aqui para excluir',
    due: 'today'
})

// starts the todo list array, which will be reseted everytime the root route is called
let todoListArray = [];

// async function because we need to wait the db check
app.get( "/", async function (req, res) {

    // resets the array to render it after
    todoListArray = [];    
    
    await Task.find( {}, (err, tasks) => {
        if (err) { console.log(err) }
        else {            
            // if there is no tasks in db, create the instruction tasks
            if ( tasks.length === 0 ) {
                Task.insertMany(
                    [firstInstruction, secondInstruction, thirdInstruction],
                    (err) => {
                        err ? console.warn(err)
                        :
                            console.log("Sucessfully saved the tasks.")
                    }
                )

                // reload the route to fall on the else block and render the tasks
                res.redirect('/');
            
            // when we have information in db
            } else {                
                tasks.forEach( (task) => {
                    todoListArray.push(task);
                })

                res.render( "todolist", {
                    theTitle: "To Do List",
                    theDate: date.getDate(),
                    todoList: todoListArray                
                })
            }
        }          
    });   

})

app.post( "/", function (req, res) {

    // get the posted info into the Task model
    let newItem = new Task ({
        task: req.body.newTask,
        due: req.body.taskDue
    });

    // save it to mongodb
    newItem.save();

    // refresh to render the updated array
    res.redirect("/");

})

app.post( '/delete', function (req, res) {
    
    const taskId = req.body.checkbox;

    Task.deleteOne(
        { _id: taskId },
        (err) => {
            err ? console.warn(err)
            :
                console.log('Sucessfully deleted task from the list. Well done!')
        }
    )

    res.redirect('/');

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