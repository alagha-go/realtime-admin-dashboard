const express = require("express");
var http = require("http");
const mariadb = require('mariadb/callback');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
var server = http.createServer(app);
var io = require("socket.io")(server);


app.use(express.static(path.join(__dirname, 'public')));


//middlewre
app.use(express.json());
app.use(cors());


const conn = mariadb.createConnection({
  host: "localhost", 
  user: "admin", 
  password: "password",
  database: "Dashboard"
});
conn.connect(err => {
if (err) {
console.log("not connected due to error: " + err);
} else {
console.log("connected ! connection id is " + conn.threadId);
}
});



 app.get('/members', (req, res) => {
     res.status(200).send(members);
 });

app.post('/', (req, res) => {
const user = req.body;
clients.push(user);
console.log(user);
res.status(201).send(user);
});


io.on("connection", (socket) => {
  console.log("connected");

////////////////////////////////////////////////////
// signing a new admin user
  socket.on('admin sign', (admin) => {
    Name = admin.name;
    Email = admin.email;
    Phone = admin.phone;
// saving the adminuser to the database 
    conn.query('INSERT INTO Admins(name, email, phone) VALUES (?,?,?)',
     [Name, Email, Phone],
      (err, result) => {
          if (err) {
            //checking if there are errors
            console.log(err);
          }else
          // sending back a response that user has been created
          io.emit('admin sign', "admin created");
          // sending a realtime notification to the admin user
          io.emit('notifications', `an admin with the name ${Name} has signed up`);
      });
  });

/////////////////////////////////////////////////////
//creating a new member
  socket.on('member sign', (member) => {

    Name = member.name;
    Email = member.email;
    Phone = member.phone;
// saving the new member to the database
    conn.query('INSERT INTO Members(name, email, phone) VALUES (?,?,?)',
     [Name, Email, Phone],
      (err, result) => {
          if (err) {
            //checking if there are errors
            console.log(err);
          }else
          // sending back a response that memeber has been craeted
          io.emit('member sign', "member created");
          //sending notification to the admin that a new user has been created
          io.emit('notifications', `a member with the name ${Name} has signed up`);
      });
  });

///////////////////////////////////////////////////////
// letting an admin to login
    socket.on('admin log', (admin) => {

    Name = admin.name;
    Email = admin.email;
    Phone = admin.phone;

    var adminlog;
// checking if the admin exists in our database
      conn.query('SELECT * FROM Admins WHERE name = ?  AND email = ? AND phone = ?', [Name, Email, Phone], (err, rows, fields)=>{
        if(!err){
          if (rows.length <1){
            adminlog = "this admin does not exist";
          }
          else{
            adminlog = "admin logged in";
          }
          // sending back a response that the user is valid and logged in
          io.emit('admin log', adminlog);
          // sending a notification to the admin that an admin has logged in
          io.emit('notifications', `an admin with the name ${Name} has logged in`);
        }
        else{
            console.log(err);
        }
      });
      });
  
////////////////////////////////////////////////////////
// letting an admin to login
      socket.on('member log', (member) => {

          Name = member.name;
          Email = member.email;
          Phone = member.phone;

// checking if the admin exists in our database
        conn.query('SELECT * FROM Members WHERE name = ?  AND email = ? AND phone = ?', [Name, Email, Phone], (err, rows, fields)=>{
          if(!err){
            if (rows.length <1){
              adminlog = "this member does not exist";
            }
            else{
              adminlog = "member logged in";
            }
            // sending back a response that the user is valid and logged in
            io.emit('member log', adminlog);
            // sending a notification to the admin that an admin has logged in
            io.emit('notifications', `a member with the name ${Name} has logged in`);
          }
          else{
              console.log(err);
          }
        });
        });

///////////////////////////////////////////////////////////


// sending all the members to the admin dashboard
conn.query('SELECT * FROM Members ', (err, rows, fields)=>{
  if(!err){
    io.emit('get members', rows);
  }
  else{
      console.log(err);
  }
});

///////////////////////////////////////////////////////////


// sending all the admins to the admin dashboard
conn.query('SELECT * FROM Admins ', (err, rows, fields)=>{
  if(!err){
    io.emit('get admins', rows);
  }
  else{
      console.log(err);
  }
});

///////////////////////////////////////////////////////////

});

server.listen(port, "0.0.0.0", () => {
  console.log(`server is listening at http://127.0.0.1:${port}`);
});
