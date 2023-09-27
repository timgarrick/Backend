const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://xxxx', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const OfficeLocationEnum = ['Office', 'Remote', 'Hybrid'];

const JobRoleEnum = ['Junior', 'Mid', 'Senior', 'Lead'];

const itTechnologies = [
    'JavaScript',
    'Node.js',
    'React',
    'Angular',
    'Python',
    'Java',
    'C#',
    'Ruby',
    'HTML/CSS',
    'SQL',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'DevOps',
    'Machine Learning',
    'Data Science',
    'Blockchain',
    'Cybersecurity',
    'Frontend',
    'Backend',
  ];
  
  const ukCities = [
    { city: 'London', country: 'England' },
    { city: 'Manchester', country: 'England' },
    { city: 'Birmingham', country: 'England' },
    { city: 'Glasgow', country: 'Scotland' },
    { city: 'Liverpool', country: 'England' },
    { city: 'Edinburgh', country: 'Scotland' },
    { city: 'Leeds', country: 'England' },
    { city: 'Sheffield', country: 'England' },
    { city: 'Bristol', country: 'England' },
    { city: 'Newcastle upon Tyne', country: 'England' },
    { city: 'Cardiff', country: 'Wales' },
    { city: 'Belfast', country: 'Northern Ireland' },
  ];

  const jobPostingSchema = new mongoose.Schema({
    jobTitle: String,
    city: String,
    country: String,
    salaryStart: Number,
    salaryEnd: Number,
    jobDescription: String,
    tags: [String],
    officeLocation: {
      type: String,
      enum: OfficeLocationEnum,
    },
    fullTime: Boolean, // Added isFullTime field
    role: {
      type: String,
      enum: JobRoleEnum,
    },
  });

  const createAndSaveJobPostings = async () => {
    try {
      for (let i = 1; i <= 40; i++) {
        const randomTags = getRandomTags(3);
        const randomCity = getRandomCity();
        const randomJobRole = getRandomJobRole();
        const isFullTime = getRandomFullTime();
        const salaryRange = getSalaryRangeByRole(randomJobRole, isFullTime);
        const salaryStart = getRandomSalaryInRange(salaryRange.start, salaryRange.end);
        const salaryEnd = getRandomSalaryInRange(salaryRange.start, salaryRange.end);
        const officeLocation = getRandomOfficeLocation();
        const jobTitle = generateJobTitle(randomCity, randomJobRole, randomTags, salaryStart, salaryEnd, isFullTime);
  
        const jobDescription = `We are looking for a ${jobTitle} with expertise in ${randomTags.join(', ')}.
        This role offers a competitive salary range of £${salaryStart} - £${salaryEnd} per year and is ${officeLocation.toLowerCase()}-based.
        This is a ${isFullTime ? 'full-time' : 'part-time'} position. Apply now to join our team!`;
  
        const jobPostingData = {
          jobTitle,
          city: randomCity.city,
          country: randomCity.country,
          salaryStart,
          salaryEnd,
          jobDescription,
          tags: randomTags,
          officeLocation,
          fullTime: isFullTime,
          role: randomJobRole,
        };
  
        const newJobPosting = new JobPosting(jobPostingData);
        await newJobPosting.save();
        console.log(`Job Posting ${i} saved successfully.`);
      }
    } catch (err) {
      console.error('Error creating and saving job postings:', err);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
  };

  const getRandomTags = (count) => {
    const shuffledTechnologies = itTechnologies.sort(() => 0.5 - Math.random());
    return shuffledTechnologies.slice(0, count);
  };

  const getRandomCity = () => {
    return ukCities[Math.floor(Math.random() * ukCities.length)];
  };

  const getRandomOfficeLocation = () => {
    return OfficeLocationEnum[Math.floor(Math.random() * OfficeLocationEnum.length)];
  };

  const generateJobTitle = (city, jobRole, tags, salaryEnd, isFullTime) => {
    const employmentType = isFullTime ? 'Full time' : 'Part time';
    const technologies = tags.join(' / ');
    const location = `${city.city} (${city.country})`;
    const salary = `up to £${salaryEnd.toLocaleString()} based on experience`;
  
    return `${employmentType} ${jobRole} ${technologies} developer based in ${location}, ${salary}`;
  };

  const getRandomFullTime = () => {
    return Math.random() < 0.5;
  };

  const getSalaryRangeByRole = (role, isFullTime) => {
    switch (role) {
      case 'Junior':
        return { start: isFullTime ? 30000 : 15000, end: isFullTime ? 50000 : 25000 };
      case 'Mid':
        return { start: isFullTime ? 50001 : 25001, end: isFullTime ? 70000 : 35000 };
      case 'Senior':
        return { start: isFullTime ? 70001 : 35001, end: isFullTime ? 90000 : 45000 };
      case 'Lead':
        return { start: isFullTime ? 90001 : 45001, end: isFullTime ? 100000 : 50000 };
      default:
        return { start: isFullTime ? 30000 : 15000, end: isFullTime ? 100000 : 50000 };
    }
  };

  const getRandomJobRole = () => {
    const randomIndex = Math.floor(Math.random() * JobRoleEnum.length);
    return JobRoleEnum[randomIndex];
  };

  const getRandomSalaryInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

app.use(express.json());

const JobPosting = mongoose.model('JobPosting', jobPostingSchema);

  app.get('/api/getAll', async (req, res) => {
    try {
      const jobPostings = await JobPosting.find();
      res.json(jobPostings);
      console.log("All Jobs requested");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/getAllJobTechnologies', async (req, res) => {
    try {
      const jobTech = await JobPosting.distinct("tags");
      res.json(jobTech);
      console.log("All Jobs requested");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/getCountriesAndCities', async (req, res) => {
    try {
      const result = await JobPosting.aggregate([
        {
          $group: {
            _id: '$country',
            cities: { $addToSet: '$city' },
          },
        },
      ]);
        const countriesAndCities = result.map((item) => ({
        country: item._id,
        cities: item.cities,
      }));
  
      res.json(countriesAndCities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  });

  app.post('/api/searchJob', (req, res) => {
    const filters = req.body;

    const filterConditions = {};
  
    if (filters.jobTitle) {
      filterConditions.jobTitle = new RegExp(filters.jobTitle, 'i');
    }
  
    if (filters.city) {
      filterConditions.city = new RegExp(filters.city, 'i');
    }
  
    if (filters.country) {
      filterConditions.country = new RegExp(filters.country, 'i');
    }
  
    JobPosting.find(filterConditions, (err, jobPostings) => {
      if (err) {
        console.error('Error querying MongoDB:', err);
        res.status(500).json({ error: 'Server error' });
        return;
      }
  
      res.json(jobPostings);
    });
  });

  app.get('/api/generateJobs', async (req, res) => {
    createAndSaveJobPostings();
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});