const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const User = require('./model/User');
const Property = require('./model/Property');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Auth Middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('ClearPLOT backend is live!');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post("/post-properties", authenticateUser, upload.array("images", 5), async (req, res) => {
  try {
    const {
      ownerName,
      contactNumber,
      propertyType,
      bhkType,
      city,
      area,
      propertyAge,
      facing,
      furnishing,
      builtUpArea,
      carpetArea,
      floorNumber,
      totalFloors,
      amenities,
      price,
      description,
      location,
    } = req.body;

    const imagePaths = req.files.map(file => file.filename);

    const newProperty = new Property({
      userId: req.userId,
      ownerName,
      contactNumber,
      propertyType,
      bhkType,
      city,
      area,
      propertyAge,
      facing,
      furnishing,
      builtUpArea,
      carpetArea,
      floorNumber,
      totalFloors,
      amenities,
      price,
      description,
      location,
      images: imagePaths,
    });

    await newProperty.save();

    res.status(201).json({ message: "Property posted successfully", property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post property" });
  }
});

app.get("/get-user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user info" });
  }
});

app.get('/get-properties', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const properties = await Property.find({ userId: { $ne: userId } }); // Exclude user's own properties
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
