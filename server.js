const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDef = protoLoader.loadSync("./todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;
const port = 30000;

const server = new grpc.Server();
server.addService(todoPackage.Todo.service, {
  createTodo: createTodo,
  readTodos: readTodos,
  readTodosStream: readTodosStream,
});
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind gRPC server:", err);
      return;
    }
    console.log("gRPC server is listening on port", port);
    server.start();
  }
);

const todos = [];
// call object - the whole call, we get access to the whole thing the TCP
// callback - that we can send back response to the client-[call]
function createTodo(call, callback) {
  const todoItem = {
    id: todos.length + 1,
    text: call.request.text,
  };
  todos.push(todoItem);
  //   console.log(call);
  callback(null, todoItem);
}

function readTodos(call, callback) {
  callback(null, { items: todos });
}
function readTodosStream(call, callback) {
  todos.forEach((t) => call.write(t));
  call.end();
}
