const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Models
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

// Multer config for file uploads
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

// Basic Route
app.get('/', (req, res) => {
  res.send('ClearPLOT backend is live!');
});

// Register Route
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

// Login Route
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

// Post Property Route
app.post("/post-properties", authenticateUser, upload.array("images", 5), async (req, res) => {
  try {
    const form = req.body;
    const imagePaths = req.files.map(file => file.filename);

    const binaryFields = [
      'Resale','MaintenanceStaff','Gymnasium','SwimmingPool','LandscapedGardens','JoggingTrack','RainWaterHarvesting',
      'IndoorGames','ShoppingMall','Intercom','SportsFacility','ATM','ClubHouse','School','24X7Security','PowerBackup',
      'CarParking','StaffQuarter','Cafeteria','MultipurposeRoom','Hospital','WashingMachine','Gasconnection','AC','Wifi',
      'Childrensplayarea','LiftAvailable','BED','VaastuCompliant','Microwave','GolfCourse','TV','DiningTable','Sofa',
      'Wardrobe','Refrigerator'
    ];

    const BinaryFeatures = {};
    for (const field of binaryFields) {
      if (field in form) BinaryFeatures[field] = form[field];
    }

    let predictedPrice = parseFloat(form.PredictedPrice);
    if (!predictedPrice || isNaN(predictedPrice)) {
      predictedPrice = form.ListingType === 'Rent'
        ? 0.3 * parseFloat(form.Price || 0)
        : parseFloat(form.Price || 0);
    }

    const newProperty = new Property({
      userId: req.userId,
      ListingType: form.ListingType,
      PropertyType: form.PropertyType,
      City: form.City,
      Area: parseFloat(form.Area),
      Bedrooms: parseInt(form['No. of Bedrooms'], 10),
      Latitude: parseFloat(form.Latitude),
      Longitude: parseFloat(form.Longitude),
      Price: parseFloat(form.Price),
      PredictedPrice: predictedPrice,
      BinaryFeatures,
      images: imagePaths,
      Description: form.Description,
    });

    await newProperty.save();
    res.status(201).json({ message: "Property posted successfully", property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post property" });
  }
});

// Get User Details by ID
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

// Get All Properties with Filters and Pagination
app.get('/get-properties', authenticateUser, async (req, res) => {
  try {
    const {
      city, minPrice, maxPrice, amenities, propertyType, listingType, minArea, maxArea,
      page = 1, // Default to page 1 if not specified
      limit = 10 // Default to limit of 10 properties per page
    } = req.query;

    const userId = req.userId;

    // Build the filter object
    let filter = { userId: { $ne: userId } }; // Exclude user's own properties

    if (city) {
      filter.City = city;
    }

    if (minPrice) {
      filter.Price = { $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      filter.Price = { ...filter.Price, $lte: parseFloat(maxPrice) };
    }

    if (propertyType) {
      filter.PropertyType = propertyType;
    }

    if (listingType) {
      filter.ListingType = listingType;
    }

    if (minArea) {
      filter.Area = { ...filter.Area, $gte: parseFloat(minArea) };
    }

    if (maxArea) {
      filter.Area = { ...filter.Area, $lte: parseFloat(maxArea) };
    }

    // Filter for amenities, if provided
    if (amenities) {
      const amenitiesArray = amenities.split(','); // Split amenities by comma
      amenitiesArray.forEach(amenity => {
        filter[`BinaryFeatures.${amenity}`] = "Yes"; // Check for "Yes" value in BinaryFeatures
      });
    }

    // Fetch properties based on filters and pagination
    const properties = await Property.find(filter)
      .skip((page - 1) * limit) // Skip the first (page - 1) * limit items
      .limit(parseInt(limit)); // Limit the number of results per page

    const totalProperties = await Property.countDocuments(filter); // Get the total count for pagination

    res.json({
      properties,
      totalProperties,
      totalPages: Math.ceil(totalProperties / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
