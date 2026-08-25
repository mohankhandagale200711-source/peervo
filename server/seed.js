const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Note = require('./models/Note');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peervo';

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for non-destructive seeding...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Upsert System AI Assistant Bot User
    const aiUser = await User.findOneAndUpdate(
      { email: 'ai@peervo.bot' },
      {
        name: 'Peervo AI',
        email: 'ai@peervo.bot',
        password: passwordHash,
        bio: '24/7 AI Assistant powered by Google Gemini & Peervo AI.',
        skills: ['Peervo AI', 'General Knowledge', 'Coding', 'Math', 'Writing'],
        education: 'Peervo AI Engine',
        profilePic: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      },
      { upsert: true, new: true }
    );

    // 2. Upsert Demo Users (Does NOT delete real registered users!)
    const user1 = await User.findOneAndUpdate(
      { email: 'alex@uni.edu' },
      {
        name: 'Alex Morgan',
        email: 'alex@uni.edu',
        password: passwordHash,
        bio: 'Full-stack web developer passionate about React, Node.js, and real-time systems.',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Tailwind CSS'],
        education: 'B.Tech Computer Science, 4th Year',
      },
      { upsert: true, new: true }
    );

    const user2 = await User.findOneAndUpdate(
      { email: 'sarah@uni.edu' },
      {
        name: 'Sarah Chen',
        email: 'sarah@uni.edu',
        password: passwordHash,
        bio: 'AI & Data Structures enthusiast. Loves building clean algorithms & study guides.',
        skills: ['Python', 'Data Structures', 'C++', 'Machine Learning', 'SQL'],
        education: 'B.S. Software Engineering, 3rd Year',
      },
      { upsert: true, new: true }
    );

    const user3 = await User.findOneAndUpdate(
      { email: 'jordan@uni.edu' },
      {
        name: 'Jordan Smith',
        email: 'jordan@uni.edu',
        password: passwordHash,
        bio: 'UI/UX Designer & Frontend Specialist. Open to collaborating on capstone projects!',
        skills: ['UI/UX', 'Figma', 'React', 'Tailwind CSS', 'TypeScript'],
        education: 'Information Technology, Final Year',
      },
      { upsert: true, new: true }
    );

    console.log('Demo accounts & Peervo AI verified/updated safely.');

    // 3. Ensure sample projects exist
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create({
        title: 'Weather Dashboard',
        description: 'Real-time weather application using OpenWeather API with responsive forecast charts.',
        techStack: ['React', 'Node.js', 'Express', 'OpenWeather API'],
        githubLink: 'https://github.com/alex/weather-dashboard',
        liveLink: 'https://weather-demo.vercel.app',
        owner: user1._id,
        likedBy: [user2._id, user3._id],
      });

      await Project.create({
        title: 'AI Code Assistant CLI',
        description: 'Command line interface that leverages LLMs to generate and explain code snippets.',
        techStack: ['Python', 'OpenAI API', 'CLI', 'Docker'],
        githubLink: 'https://github.com/sarah/ai-code-cli',
        liveLink: '',
        owner: user2._id,
        likedBy: [user1._id],
      });
    }

    // 4. Ensure sample notes exist
    const noteCount = await Note.countDocuments();
    if (noteCount === 0) {
      await Note.create({
        title: 'DBMS Unit 3 - Normalization & 3NF',
        course: 'Database Management Systems',
        uploadedBy: user2._id,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        tags: ['normalization', '3NF', 'BCNF', 'semester3'],
        likedBy: [user1._id, user3._id],
        downloads: 14,
      });
    }

    console.log('✨ Safe seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
