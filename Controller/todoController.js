import csvParser from "csv-parser";
import { Parser } from 'json2csv';
import fs from "fs";
import TodoModel from "../Model/todoModel.js";

// Get all todos
export const getAllTodo = async (req, res) => {
  try {
    const list = await TodoModel.find();
    if (!list.length) {
      return res.status(404).json({ error: "Todo list is empty" });
    }
    res.status(200).json({ data: list });
  } catch (error) {
    console.error("Error in todoController.getAllTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single todo by ID
export const getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Todo ID is required" });
    }

    const todo = await TodoModel.findById(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error("Error in todoController.getTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new todo
export const addTodo = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    const data = new TodoModel({ description });
    const todo = await data.save();
    res.status(201).json({ message: "Todo added successfully", todo });
  } catch (error) {
    console.error("Error in todoController.addTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a todo by ID
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { description,status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Todo ID is required" });
    }

    if(description && description.trim() === ""){
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    if(status && (status !== "pending" && status !== "completed")){
      return res.status(400).json({ error: "Status can only be pending or completed" });
    }

    const data = {}
    if(description){
      data.description = description
    }
    if(status){
      data.status = status
    }

    const todo = await TodoModel.findByIdAndUpdate(id, data, { new: true });
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: "Todo updated successfully", todo });
  } catch (error) {
    console.error("Error in todoController.updateTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a todo by ID
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Todo ID is required" });
    }

    const todo = await TodoModel.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error in todoController.deleteTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload todos from CSV
export const uploadTodo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          fs.unlinkSync(filePath);
          const insertedTodos = await TodoModel.insertMany(results);
          res.status(201).json({ message: 'Todos added successfully', todos: insertedTodos });
        } catch (error) {
          console.error('Error inserting documents:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    console.error('Error in todoController.uploadTodo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download todos as CSV
export const downloadTodo = async (req, res) => {
  try {
    const list = await TodoModel.find({}, { _id: 0, description: 1,status:1 })
    if (!list.length) {
      return res.status(404).json({ error: "Todo list is empty" });
    }


    // Convert JSON to CSV
    const fields = ['description','status'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(list);

    res.header('Content-Type', 'text/csv');
    res.attachment('todos.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error in todoController.downloadTodo:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Filter todos by status
export const filterTodo = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Status query parameter is required" });
    }

    const list = await TodoModel.find({ status });
    if (!list.length) {
      return res.status(404).json({ error: "Todos not found" });
    }
    res.status(200).json({ data: list });
  } catch (error) {
    console.error("Error in todoController.filterTodo:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
