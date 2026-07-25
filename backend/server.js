const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper for email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// POST endpoint for form submission
app.post('/api/submit', upload.single('profileImage'), (req, res) => {
  try {
    const { fullName, email, role, dob, bio } = req.body;
    const errors = {};

    // 1. fullName validation
    if (!fullName || fullName.trim().length < 3) {
      errors.fullName = 'Full Name must be at least 3 characters long.';
    }

    // 2. email validation
    if (!email || !isValidEmail(email)) {
      errors.email = 'A valid email address is required.';
    }

    // 3. role validation
    const validRoles = ['developer', 'designer', 'manager'];
    if (!role || !validRoles.includes(role)) {
      errors.role = 'Please select a valid role.';
    }

    // 4. dob validation
    if (!dob) {
      errors.dob = 'Date of birth is required.';
    } else {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        errors.dob = 'Invalid date format.';
      } else if (dobDate >= new Date()) {
        errors.dob = 'Date of birth must be in the past.';
      }
    }

    // 5. bio validation (optional, but has max length)
    if (bio && bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters.';
    }

    // 6. profileImage validation
    if (!req.file) {
      errors.profileImage = 'Profile image is required and must be an image type.';
    }

    if (Object.keys(errors).length > 0) {
      // Clean up the uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, errors });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      data: {
        fullName,
        email,
        role,
        dob,
        bio,
        filename: req.file.filename
      }
    });

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

// Error handling middleware for Multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, errors: { profileImage: 'File too large. Max size is 5MB.' } });
    }
    return res.status(400).json({ success: false, errors: { profileImage: err.message } });
  } else if (err) {
    return res.status(400).json({ success: false, errors: { profileImage: err.message } });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
