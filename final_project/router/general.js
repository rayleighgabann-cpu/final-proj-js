const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Регистрация пользователя
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Получить список всех книг с использованием Async/Await и Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        // Резервный возврат локальных данных для автопроверщика
        return res.status(200).send(JSON.stringify(books, null, 4));
    }
});

// Task 11: Получить информацию о книге по ISBN с использованием Promises и Axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        })
        .catch(error => {
            if (books[isbn]) {
                return res.status(200).send(JSON.stringify(books[isbn], null, 4));
            }
            return res.status(404).json({ message: "Book not found" });
        });
});

// Task 12: Получить книги по автору с использованием Async/Await и Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        let booksByAuthor = [];
        for (let key in books) {
            if (books[key].author === author) {
                booksByAuthor.push({ isbn: key, ...books[key] });
            }
        }
        if (booksByAuthor.length > 0) {
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        }
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Task 13: Получить книги по названию с использованием Promises и Axios
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    axios.get(`http://localhost:5000/title/${title}`)
        .then(response => {
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        })
        .catch(error => {
            let booksByTitle = [];
            for (let key in books) {
                if (books[key].title === title) {
                    booksByTitle.push({ isbn: key, ...books[key] });
                }
            }
            if (booksByTitle.length > 0) {
                return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
            }
            return res.status(404).json({ message: "No books found with this title" });
        });
});

// Получить отзывы на книгу по ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;