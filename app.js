const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register", async (request, response) => {
  const registerB = request.body;
  const { username, password, name, gender, location } = registerB;
  console.log(registerB);
  const myQuery = ` select * from user where username = '${username}'`;
  console.log("a");
  const userResponse = await db.get(myQuery);
  console.log(userResponse);
  if (userResponse !== undefined) {
    response.status(400);
    response.send("User already exists");
    console.log("1");
  } else {
    const a = password.length;
    console.log(a);
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
      console.log("2");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const myQuery2 = `insert into user(username,name,
                password,gender,location)
            values('${username}','${name}','${hashedPassword}',
            '${gender}','${location}')`;
      await db.run(myQuery2);
      response.status(200);
      response.send("User created successfully");
      console.log("3");
    }
  }
});

app.post("/login", async (request, response) => {
  const loginB = request.body;
  console.log(loginB);
  const { username, password } = loginB;
  const myQuery = `select * from user where username = '${username}'`;
  console.log(myQuery);
  const loginRest = await db.get(myQuery);
  if (loginRest === undefined) {
    response.status(400);
    response.send("Invalid user");
    console.log("4");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      loginRest.password
    );
    if (isPasswordMatched === false) {
      response.status(400);
      response.send("Invalid password");
      console.log("5");
    } else {
      response.status(200);
      response.send("Login success!");
      console.log("6");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const passwordB = request.body;
  const { username, oldPassword, newPassword } = passwordB;
  console.log(passwordB);
  const heQuery = `select * from user where username = '${username}'`;
  const passRest = await db.get(heQuery);
  console.log(passRest);
  if (passRest === undefined) {
    response.status(400);
    response.send("Invalid user");
    console.log("4");
  } else {
    const isPasswordMatched = bcrypt.compare(oldPassword, passRest.password);
    console.log(isPasswordMatched);
    console.log(newPassword.length < 5);
    if (isPasswordMatched) {
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
        console.log("6");
      } else {
        const hashedPassword = bcrypt.hash(newPassword, 10);
        console.log(hashedPassword);
        const myQuery2 = `update user set password = '${hashedPassword}'
               where username = '${username}';`;
        const hello = await db.run(myQuery2);
        console.log(hello);
        response.status(200);
        response.send("Password updated");
        console.log("5");
      }
    } else {
      response.status(200);
      response.send("Invalid current password");
      console.log("A");
    }
  }
});

module.exports = app;
