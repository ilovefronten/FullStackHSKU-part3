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
  name: {
    type: String,
    minLength: [3, 'name should be at least 3 characters long'],
    require: [true, 'name missing']
  },
  number: {
    type: String,
    validate: {
      validator: (v) => /^(?=(\d{2}-\d{6,}|\d{3}-\d{5,}))\d{2,3}-\d{5,}$/.test(v),
      message: (props) => {
        return `Number ${props.value} not valid`
      }
    },
    require: [true, 'Number missing']
  }
})

phonebookSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject.__v
    delete returnObject._id
  }
})

module.exports = mongoose.model('Phonebook', phonebookSchema)