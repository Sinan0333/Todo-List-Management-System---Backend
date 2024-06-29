import express from "express"
import multer from "multer"
import { addTodo, deleteTodo, downloadTodo, filterTodo, getAllTodo, getTodo, updateTodo, uploadTodo } from "./Controller/todoController.js"


const app = express()


app.use(express.json());
app.use(express.urlencoded({extended: true }));


const upload = multer({ dest: 'uploads/' });


app.get('/todos', getAllTodo) // to get all todo list //
app.get('/todo/:id', getTodo) // to get a specific todo
app.post("/todo", addTodo) // to add a new todo //
app.put("/todo/:id", updateTodo) // to update a existing todo //
app.delete("/todo/:id", deleteTodo) //to delete a todo
app.post("/todos/upload",upload.single('file'),uploadTodo) // to upload a todos in csv formate
app.get("/todos/download",downloadTodo) // to download todos in csv formate
app.get("/todos/filter",filterTodo) // to filter todos based on the status of todos


export default app