require('dotenv').config()
const mongoose = require("mongoose")

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URL
console.log('connecting to', url);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB.')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message);
  })

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

phonebookSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject.__v
    delete returnObject._id
  }
})

module.exports = mongoose.model('Phonebook', phonebookSchema)