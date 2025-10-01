const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const path = require('path')

const app = express()

// ------------------ Middleware ------------------ //
app.use(cors())
app.use(express.json({ limit: '10mb' })) // handle JSON + big base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ✅ Serve frontend files from /photobooth
app.use(express.static(path.join(__dirname, 'photobooth'), { index: false }))

// ------------------ MongoDB Connection ------------------ //
mongoose
  .connect(
    'mongodb+srv://aashvip25:aashvip25@cluster0.llph3dr.mongodb.net/memoroids?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err))

// ------------------ Schemas ------------------ //
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String,
})
const User = mongoose.model('User', userSchema)

const photoSchema = new mongoose.Schema({
  user: String, // username
  image: String, // base64 string
  createdAt: { type: Date, default: Date.now },
})
const Photo = mongoose.model('Photo', photoSchema)

// ------------------ Routes ------------------ //

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const existing = await User.findOne({ username })
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, email, password: hashedPassword })
    await user.save()

    res.json({ message: '✅ User registered successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' })

    res.json({ message: '✅ Login successful', userId: user._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Save Photo
app.post('/save_photo', async (req, res) => {
  try {
    const { username, image } = req.body
    if (!username || !image) {
      return res.status(400).json({ error: 'Missing data' })
    }

    const newPhoto = new Photo({ user: username, image })
    await newPhoto.save()

    res.json({ success: true, message: '✅ Photo saved successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get User Photos
app.get('/my_photos/:username', async (req, res) => {
  try {
    const { username } = req.params
    const photos = await Photo.find({ user: username }).sort({ createdAt: -1 })
    res.json({ photos })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete Photo
app.delete('/delete_photo/:id', async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ------------------ Default Route ------------------ //
// ✅ Force default page → registration.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'photobooth', 'registration.html'))
})

// ------------------ Start Server ------------------ //
app.listen(5000, () =>
  console.log('🚀 Server running on http://localhost:5000')
)
