var mysql = require('mysql2');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password:"abid123"
});

  try {
    q = "INSERT INTO user(id, username, email, password) VALUES ?";
    users = [
      ["123b", "zahid", "zahid@gmail.com", "abc"],
      ["123c", "hazik", "hazik@gmail.com", "trf"],
    ]
    
    connection.query(q, [users], (err, res) => {
        if (err) {
            throw err;
        }
        console.log(res);
      
    });
} catch (error) {
    console.error("Error occurred:", error);
}

connection.end()





