const mysql = require('mysql2');

const pool = mysql.createPool({
    "user": "root",
    "password": "NeyCarioM@gmail.com.2000",
    "database": "taxi_utec",
    "host": "localhost",
    "port": 3306
});

module.exports = pool;