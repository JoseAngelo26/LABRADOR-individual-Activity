const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()


app.use(express.json())
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/mongo-test')
  .then(() => 
    console.log({message: 'Connected to mongo'})
).catch((err) => console.error('Connection failed..', err))



const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  tag: {
    type: [String],
    required: true
  },
});

const yearSchema = new mongoose.Schema(
  {
    "1st Year": [courseSchema],
    "2nd Year": [courseSchema],
    "3rd Year": [courseSchema],
    "4th Year": [courseSchema],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", yearSchema);

  
  app.get('/Courses', async (req, res) => {
    try {
      const allCourses = await Course.find({});
      console.log('All Courses:', allCourses);
      res.json(allCourses);
    } catch (error) {
      console.error('Error retrieving all courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

app.get("/Sort", async (req, res) => {
  try {
    const courseYears = await Course.find();

   
    const allCourses = courseYears.reduce((courses, year) => {
      ["1st Year", "2nd Year", "3rd Year", "4th Year"].forEach(yearKey => {
        if (year[yearKey]) {
          courses.push(...year[yearKey]);
        }
      });
      return courses;
    }, []);

    
    const sortedCourses = allCourses.sort((a, b) => a.description.localeCompare(b.description));
    res.json(sortedCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/BSITandBSIS", async (req, res) => {
  try {
    const courses = (await Course.find()).flatMap(year => ["1st Year", "2nd Year", "3rd Year", "4th Year"].flatMap(yearKey => year[yearKey] || []));
    
    const descriptionsAndTags = courses
      .filter(course => course.tag.includes("BSIT") || course.tag.includes("BSIS"))
      .map(({ description, tag }) => ({ description, tag }));

    res.json(descriptionsAndTags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening to port: ${PORT}`)
})