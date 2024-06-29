import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import TodoModel from "../Model/todoModel";

let mongoServer;
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  mongoose.disconnect();
  mongoServer.stop();
});

describe("TodoController", () => {
  // Mock data for testing
  const mockTodo = {
    description: "Test Todo",
    status: "pending",
  };

  let todoId; // To store the ID of the created Todo for later tests

  // Test case for adding a new todo
  describe("POST /todo", () => {
    it("should add a new todo", async () => {
      const response = await request(app)
        .post("/todo")
        .send(mockTodo)
        .expect(201);
      todoId = response.body.todo._id; // Store the ID for future tests
    });

    it("should return error if description is empty", async () => {
      const response = await request(app)
        .post("/todo")
        .send({ description: "" })
        .expect(400);
      expect(response.body.error).toBeDefined();
    });
  });

  // Test case for getting a single todo
  describe("GET /todo/:id", () => {
    beforeEach(async () => {
      const todo = await TodoModel.create({ description: "Test todo" });
      todoId = todo._id;
    });

    it("should return error if todo ID is invalid", async () => {
      const invalidId = "12345";
      const response = await request(app).get(`/todo/${invalidId}`).expect(400);
      expect(response.body.error).toBe("Todo ID is required");
    });

    it("should return error if todo not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/todo/${nonExistentId}`)
        .expect(404);
      expect(response.body.error).toBe("Todo not found");
    });

    it("should return todo if found", async () => {
      const response = await request(app).get(`/todo/${todoId}`).expect(200); // Valid ID and exists in database
      expect(response.body._id).toBe(todoId.toString());
      expect(response.body.description).toBe("Test todo");
    });
  });

  // Test case for getting all todos
  describe("GET /todos", () => {
    it("should get all todos", async () => {
      await TodoModel.create(mockTodo);
      const response = await request(app).get("/todos").expect(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 404 if no todos are found", async () => {
      const response = await request(app).get("/todos").expect(404);
      expect(response.body.error).toBeDefined();
    });
  });

  // Test case for updating a todo
  describe("PUT /todo/:id", () => {
    beforeEach(async () => {
      const todo = await TodoModel.create({ description: "Todo to update" });
      todoId = todo._id;
    });

    it("should update a todo", async () => {
      const updatedDescription = "Updated Todo Description";
      await TodoModel.findByIdAndUpdate(todoId, {
        description: updatedDescription,
      });

      const response = await request(app)
        .put(`/todo/${todoId}`)
        .send({ description: updatedDescription })
        .expect(200);
      expect(response.body.message).toBe("Todo updated successfully");
    });

    it("should return error if todo ID is invalid", async () => {
      const response = await request(app)
        .put("/todo/invalid-id")
        .send({ description: "Updated Description" })
        .expect(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return error if description is empty", async () => {
      const response = await request(app)
        .put(`/todo/${todoId}`)
        .send({ description: "" })
        .expect(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return error if status is invalid", async () => {
      const response = await request(app)
        .put(`/todo/${todoId}`)
        .send({ status: "invalid-status" })
        .expect(400);
      expect(response.body.error).toBeDefined();
    });
  });

  // Test case for deleting a todo
  describe("DELETE /todo/:id", () => {
    it("should delete a todo", async () => {
      const todo = await TodoModel.create(mockTodo);
      todoId = todo._id;

      await request(app).delete(`/todo/${todoId}`).expect(200);

      const deletedTodo = await TodoModel.findById(todoId);
      expect(deletedTodo).toBeNull();
    });

    it("should return error if todo ID is invalid", async () => {
      await request(app).delete("/todo/invalid-id").expect(400);
    });

    it("should return error if todo does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app).delete(`/todo/${nonExistentId}`).expect(404);
    });
  });

  // Test case for upload todos in csv formate
  describe("POST /todos/upload", () => {
    it("should upload todos from CSV", async () => {
      const csvContent =
        "description,status\nTask 1,pending\nTask 2,completed\n";

      const response = await request(app)
        .post("/todos/upload")
        .attach("file", Buffer.from(csvContent), "todos.csv")
        .expect(201);

      expect(response.body.message).toBe("Todos added successfully");
      expect(response.body.todos.length).toBe(2);
    });

    it("should return error if no file is uploaded", async () => {
      await request(app).post("/todos/upload").expect(400);
    });
  });

  // Test case for download todos as CSV
  describe("GET /todos/download", () => {
    it("should download todos as CSV", async () => {
      await TodoModel.create(mockTodo);

      const response = await request(app)
        .get("/todos/download")
        .expect("Content-Type", /text\/csv/)
        .expect("Content-Disposition", /attachment; filename="?todos\.csv"?/)
        .expect(200);
    });

    it("should return error if no todos exist", async () => {
      await request(app).get("/todos/download").expect(404);
    });
  });

  // Test case for filtering todos
  describe("GET /todos/filter", () => {
    it("should filter todos by status", async () => {
      await TodoModel.create(mockTodo);

      const response = await request(app)
        .get("/todos/filter")
        .query({ status: "pending" })
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe("pending");
    });

    it("should return error if status query parameter is missing", async () => {
      await request(app).get("/todos/filter").expect(400);
    });

    it("should return error if no todos match the filter", async () => {
      await request(app)
        .get("/todos/filter")
        .query({ status: "completed" })
        .expect(404);
    });
  });
});
