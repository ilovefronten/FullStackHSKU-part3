const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://stm32dev:${password}@phonebook.fabcl.mongodb.net/phonebook?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)

if (process.argv.length === 3) {
    Phonebook
      .find({})
      .then(persons => {
        console.log('phonebook:');
        persons.map(person => {console.log(`${person.name} ${person.number}`)})
        mongoose.connection.close()
      })

} else if(process.argv.length === 5) {
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  const phonebook = new Phonebook({
    name: newName,
    number: newNumber,
  })

  phonebook.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}