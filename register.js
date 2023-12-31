const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
// Create an Express application
const app = express();
app.use(cors());
const port = 3000;

// Parse JSON request bodies
app.use(bodyParser.json());

// Define MongoDB connection string
const mongoURI =
  'mongodb+srv://ravi:HelloWorld%401234@rechargeapp.9uks18k.mongodb.net/SchoolDB';

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a MongoDB Schema for students
const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  class: Number,
  section: String,
  contactNumber: String,
  appRegNumber: String,
  motherName: String,
  fatherName: String,
  address: String,
  loginID: String,
  password: String,
});

// Pre-save hook to generate loginID and password
studentSchema.pre('save', function (next) {
    const student = this;
    const randomWord = Math.random().toString(36).substring(2, 5).toUpperCase(); // Random 3-character word (in uppercase)
    const randomNumbers = Math.random().toString().substring(2, 6); // Random 4-digit number
  
    // Construct loginID and password based on the provided criteria
    student.loginID = randomWord + randomNumbers;
    student.password = student.name.substring(0, 3) + student.appRegNumber.substring(0, 4);
  
    next();
  });

// Create a MongoDB model for students
const Student = mongoose.model('Student', studentSchema);

// Define a route to save a student
app.post('/students', async (req, res) => {
  try {
    const {
      name,
      age,
      class: studentClass,
      section,
      contactNumber,
      appRegNumber,
      motherName,
      fatherName,
      address,
    } = req.body;

    const student = new Student({
      name,
      age,
      class: studentClass,
      section,
      contactNumber,
      appRegNumber,
      motherName,
      fatherName,
      address,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Could not save student' });
    console.log(error)
  }
});

    // Define a route to get students by class
    app.get('/get-students', async (req, res) => {
        try {
        const className = req.query.class;
    
        // If className is not provided, retrieve all students
        const query = className ? { class: className } : {};
    
        const students = await Student.find(query);
        res.status(200).json(students);
        } catch (error) {
        res.status(500).json({ error: 'Could not fetch students' });
        }
    });

  app.get('/get-classes', async (req, res) => {
    try {
      const classes = await Student.distinct('class');
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ error: 'Could not fetch classes' });
    }
  });

  // Update a student by loginID
    app.put('/students/loginID/:loginID', async (req, res) => {
        try {
        const loginID = req.params.loginID;
        const updatedData = req.body;
    
        // Update the student record in the database using loginID
        const updatedStudent = await Student.findOneAndUpdate(
            { loginID: loginID },
            { $set: updatedData },
            { new: true }
        );
    
        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
    
        res.status(200).json(updatedStudent);
        } catch (error) {
        res.status(500).json({ error: 'Could not update student' });
        }
    });

    // Delete a student by loginID
    app.delete('/students/loginID/:loginID', async (req, res) => {
        try {
        const loginID = req.params.loginID;
    
        // Delete the student record from the database using loginID
        const deletedStudent = await Student.findOneAndRemove({ loginID: loginID });
    
        if (!deletedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
    
        res.status(204).send();
        } catch (error) {
        res.status(500).json({ error: 'Could not delete student' });
        }
    });
  
  
  

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// {
//     type: String,
//     validate: {
//       validator: function (v) {
//         return /^\d{11}$/.test(v); // Validate contactNumber format (10 digits)
//       },
//       message: 'Contact number must be 10 digits long.',
//     },
//   }