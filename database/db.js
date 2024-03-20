#!/usr/bin/env node
const mysql = require('mysql2');

// Database Connection
const connection = mysql.createPool({
    host: 'Your Host',
    user: 'Your DB User',
    password: 'Your DB User Password',
    database: 'Your Database Name',
    port: 'Your Port',
    connectionLimit: 10
});

// Database Tables Initialize
function init() {
    connection.query("CREATE TABLE IF NOT EXISTS user(user_id VARCHAR(60) PRIMARY KEY, username VARCHAR(30) UNIQUE, password VARCHAR(60), email VARCHAR(60) UNIQUE, DOB DATE, phone VARCHAR(11) UNIQUE, age INT)");
}

// Query Function
function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

// Checking Existing User Info In DB
function existsFailCodes(err) {
    if (err.includes('user.username')) {
        return (1);
    } else if (err.includes('user.phone')) {
        return (3);
    } else if (err.includes('user.email')) {
        return (2);
    }
}


module.exports = {
    init, query, existsFailCodes
}
