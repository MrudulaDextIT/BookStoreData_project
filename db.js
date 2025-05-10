const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 4000;
const User = require("./models/User");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const Admin = require('./models/AdminStagingData'); // Your Mongoose model
const multer = require('multer');
const Product = require('./models/Product');

// Middleware
app.use(express.json());
app.use(cors()); 

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Gmail_DB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Mongoose Schema
const detailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  category: String,
  product: String,
  quantity: Number,
  paymentMethod: String,
});


const Details = mongoose.model("Details", detailsSchema);

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  degree: { type: String, required: true },
  year: { type: String, required: true },
  birthDate: { type: Date, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema, 'studentstaging');

// // Admin Schema
// const adminSchema = new mongoose.Schema({
//   adminId: String,
//   name: String,
//   email: String,
//   password: String,
// });

// const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);


app.post("/submit-form", async (req, res) => {
  try {
    const newEntry = new Details(req.body);
    const savedData = await newEntry.save();
    console.log(savedData);
    res.status(201).json({ message: "Data saved successfully!", data: savedData });
  } catch (error) {
    res.status(500).json({ error: "Failed to save data" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));



app.get("/get-data", async (req, res) => {
  try {
    const allData = await Details.find();
    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


app.delete("/delete-form-data/:id", async (req, res) => {
  try {
    await Details.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
});

app.put("/update-form-data/:id", async (req, res) => {
  try {
    const updatedData = await Details.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to update data" });
  }
}); 

app.get("/get-data/:id", async (req, res) => {
  try {
    const data = await Details.findById(req.params.id);
    
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Signup Student API
app.post('/signup_stu', async (req, res) => {
  const { name, email, phone, college, degree, year, stream, birthDate, password } = req.body; // 👈 include stream

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = `STU-${uuidv4()}`;

    const newStudent = new Student({
      studentId,
      name,
      email,
      phone,
      college,
      degree,
      year,
      stream, // 👈 include stream here too
      birthDate,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully!' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});




app.post("/login",  async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});


app.put("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Password update failed" });
  }
});

// API to register admin
app.post('/signup_admin', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Admin ID
    const adminId = 'ADM-' + uuidv4().slice(0, 8).toUpperCase();

    // Create new Admin
    const newAdmin = new Admin({
      adminId,
      name,
      email,
      password: hashedPassword,
    });

    const savedAdmin = await newAdmin.save();

    res.status(201).json({ message: "Admin signup successful", admin: savedAdmin });
  } catch (error) {
    console.error('Admin Signup Error:', error);
    res.status(500).json({ error: "Admin signup failed" });
  }
});

// 🛡 Create login_admin route
app.post('/login_admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Success
    res.status(200).json({ message: 'Login successful', admin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Setup multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create product
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, quantity, degree, classYear, stream } = req.body;

    const newProduct = new Product({
      name,
      price,
      quantity,
      degree,
      classYear,
      stream,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  // Convert binary to base64 for frontend display
  const response = products.map((p) => ({
    ...p._doc,
    image: `data:${p.image.contentType};base64,${p.image.data.toString('base64')}`,
  }));
  res.json(response);
});

// Delete product by ID
app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Update product (optional)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  const updated = {
    ...req.body,
  };
  if (req.file) {
    updated.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updated, { new: true });
  res.json(product);
});

app.listen(5000, () => console.log('Server running on port 5000'));