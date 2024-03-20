#!/usr/bin/env node
const e = require('express');
const db = require('../database/db.js');
const tools = require('../functions/tools.js');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

// User Class
class User{
    constructor (body) {
        this.user_id = uuid.v4();
        this.username = body["username"];
        this.password = body["password"];
        this.email = body["email"].toLowerCase();
        this.phone = body["phone"];
        this.DOB = new Date(body["DOB"]);
        this.age = tools.calcAge(this.DOB);
    }

    // Adding User To Database
    async user_add() {
        this.password = bcrypt.hashSync(this.password, 12);
        const params = [this.user_id, this.username, this.password,
            this.email, this.phone, this.DOB, this.age];
        try {
            await db.query("INSERT INTO user (user_id, username, password, email, phone, DOB, age) VALUES (?, ?, ?, ?, ?, ?, ?)", params);
            return 0;
        } catch (err) {
            if (err.code == "ER_DUP_ENTRY") {
                return db.existsFailCodes(err.sqlMessage);
            } else {
                return -1;
            }
        }
    }

    // Check User's Password
    async user_auth() {
        const result = await db.query("SELECT password FROM user WHERE email = ?", [this.email]);
        try {
            if (result.length != 0 && bcrypt.compareSync(this.password, result[0]['password'])) {
                return 0;
            } else {
                return -2;
            }
        } catch (err) {
            console.log(err);
            return -1;
        }
    }

    // Returning User As a Object By Custom Key Or By It's Email
    async to_obj(key=null, value=null) {
        if (key && value) {
            const result = await db.query(`SELECT * FROM user WHERE BINARY ${key} = ?`, [value]);
            if (result.length != 0) {
                return result[0];
            } else {
                return false;
            }
        } else {
            const result = await db.query("SELECT * FROM user WHERE BINARY email = ?", [this.email]);
            if (result.length != 0) {
                return result[0];
            } else {
                return false;
            }
        }
    }

    // Checking User's Unique Fields
    async info_check() {
        let keys = ["username", "phone", "email"]
        let values = [this.username, this.phone, this.email];
        for (let i = 0; i < 3; i++) {
            let result = await this.to_obj(keys[i], values[i]);
            if (result != false) {
                return keys[i];
            }
        }
        return 0;
    }
}

module.exports = {
    User,
}
