const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const Book = require('./Book.model')
const sgMail = require('@sendgrid/mail');

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use('/public', express.static(__dirname + '/public'))

// Connect to remote MongoDB (Atlas)
mongoose.connect('Atlas MongoDB connection statement', 
  {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
  .then(() => {console.log('Connected to DB!');})
  .catch(err => {console.log('ERROR:', err.message)})

// GET: retrieve all books
app.get('/books', (req, res, next) => {
  Book.find({}, (err, allBooks) => { res.json(allBooks) })
})

// POST: add a new book to the list
app.post('/books', (req, res) => {
  var newBook = new Book();

  newBook.title = req.body.title
  newBook.author = req.body.author
  newBook.category = req.body.category

  newBook.save((err, books) => {
    if(err) {
      res.send('error saving book')
    } else {
      res.send(books);
    }
  })
})

// PUT: update a book's title, author, or category
app.put('/books/:id', (req, res) => {
  Book.findOneAndUpdate({_id: req.params.id}, 
    {$set: {title: req.body.title, author: req.body.author, category: req.body.category}}, 
    {upsert: true}, 
    (err, newTitle) => {
      if(err) {
        console.log('error occured')
      } else {
        res.send(newTitle)
      }
    })
})

// DELETE: remove a book
app.delete('/books/:id', (req, res) => {
  Book.deleteOne({_id: req.params.id},
    (err, deletedBook) => {
      if(err) {
        res.send('error deleting')
      } else {
        res.send(`${deletedBook} deleted.`)
      }
    })
})

//Email message via SendGrid
app.post('/message', (req, res) => {
  sgMail.setApiKey('SendGrid connection key')
  
  let data = req.body

  let msg = {
    to: { email: 'myemail@gmail.com', name: 'Mike McGrain' },
    from: data.from,
    subject: "Message from contact form",
    text: data.content[0].value + '  ' + data.content[0].phone
  }

  sgMail.send(msg)

  console.log(msg)
})

var PORT = 123
app.listen(PORT, function() {
  console.log(`app listening on port: ${PORT}`)
})
