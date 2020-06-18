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

const defaultInstructions = [firstInstruction, secondInstruction, thirdInstruction];

const homeListName = "To do list";

// starts the todo list array, which will be reseted everytime the root route is called
let todoListArray = [];

// custom lists
const customListSchema = new mongoose.Schema({
    name: String,
    taskList: [taskSchema]
})

const CustomList = new mongoose.model( 'List', customListSchema);

const workToDoList = [];

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
                    defaultInstructions,
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
                    theTitle: homeListName,
                    theDate: date.getDate(),
                    todoList: todoListArray                
                })
            }
        }          
    });   

})

app.post( "/", function (req, res) {

    // get the posted info into the Task model
    const newItem = new Task ({
        task: req.body.newTask,
        due: req.body.taskDue
    });

    // get the list name
    const listName = req.body.listName;

    if ( listName === homeListName ) {

        // save it to mongodb
        newItem.save();

        // refresh to render the updated array
        res.redirect("/");

    } else {

        // search the list and save the task to it
        CustomList.findOne( { name: listName }, (err, foundList) => {
            err
            ? console.warn(err)
            : 
                foundList.taskList.push(newItem);
                foundList.save();
        })
        res.redirect(`/${listName}`);
    }
})

app.post( '/delete', function (req, res) {

    // store the task id coming from checkbox value
    const taskId = req.body.checkbox;

    // store the list name coming from hidden input in delete form
    const listName = req.body.deleteFrom;

    // main logic - check if is the main task list or some custom list and handle the request
    if ( listName === homeListName ) {

        Task.deleteOne(
            { _id: taskId },
            (err) => {
                err ? console.warn(err)
                :
                    console.log('Sucessfully deleted task from the list. Well done!')
            }
        )
        res.redirect('/');

    } else {
        
        // find the custom list in db
        CustomList.findOne( { name: listName }, (err, foundList) => {
            if ( err ) {
                console.warn(err);
            } else {

                // store the found list child object taskList
                const theCustomList = foundList.taskList;

                // set default index
                let taskIndex = 0;

                // find task position in taskList array
                for ( var i = 0; i < theCustomList.length; i++ ) {                    
                    const task = theCustomList[i];
                    console.log(task._id)
                    if ( task._id === taskId ) {
                        taskIndex = i;
                    }
                }

                // remove the task from array
                theCustomList.splice(taskIndex, 1);

                // complete operation
                foundList.save();                
            }
        })
        res.redirect(`/${listName}`);          
    } 
})

app.get( '/:customListName', function (req, res) {
    
    // store the name given
    const listName = req.params.customListName;

    CustomList.findOne(
        { name: listName },
        (err, results) => {
            if (err) { console.warn(err) }
            else {
                if ( results === null ) {
                    const list = new CustomList ({
                        name: listName,
                        taskList: defaultInstructions
                    })
                
                    list.save();
                    res.redirect(`/${listName}`);
                } else {
                    res.render( "todolist", {
                        theTitle: listName,
                        theDate: date.getDate(),
                        todoList: results.taskList
                    })                    
                }
            }
        }
    )
    /* */
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