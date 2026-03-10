const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Petition = require('./models/Petition');

const app = express();
const PORT = process.env.PORT || 8080;

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-long-and-secure';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/petition-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add sample data
const addSampleData = async () => {
  try {
    // Check if users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Create a sample user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const user = new User({
        username: 'demo',
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User'
      });
      
      const savedUser = await user.save();
      console.log('Sample user created:', { username: savedUser.username, password: 'password123' });
      
      // Check if petitions exist
      const petitionCount = await Petition.countDocuments();
      if (petitionCount === 0) {
        // Create sample petitions
        const petitions = [
          {
            title: "Save the Local Park",
            description: "Our local park is in danger of being sold to developers. Sign this petition to protect this vital green space that serves our community.",
            category: "Environment",
            targetSignatures: 1000,
            signatureCount: 245,
            createdBy: savedUser._id
          },
          {
            title: "Improve Public Transport",
            description: "We need more frequent bus services in our town. Sign to show your support for better public transport options.",
            category: "Transport",
            targetSignatures: 500,
            signatureCount: 127,
            createdBy: savedUser._id
          },
          {
            title: "Fund School Music Programs",
            description: "Music education is being cut from schools due to budget constraints. Sign to support continued funding for school music programs.",
            category: "Education",
            targetSignatures: 2000,
            signatureCount: 1568,
            createdBy: savedUser._id
          }
        ];
        
        await Petition.insertMany(petitions);
        console.log('Sample petitions created');
      }
    }
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};

// Initialize sample data
addSampleData();

// In-memory list of Server-Sent Events (SSE) clients
let sseClients = [];

const broadcastEvent = (eventType, payload) => {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    client.res.write(data);
  });
};

// SSE endpoint for real-time petition updates
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  sseClients.push(newClient);

  // Send a comment to keep the connection alive
  res.write(`: connected ${clientId}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

// Routes
app.get('/api/petitions', async (req, res) => {
  try {
    const petitions = await Petition.find().sort({ createdAt: -1 });
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching petitions' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide username, email and password' });
  }
  
  try {
    // Check if username or email already exists
    const userExists = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (userExists) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      name: name || username
    });
    
    // Save user
    const savedUser = await newUser.save();
    
    // Generate token
    const token = jwt.sign({ 
      _id: savedUser._id, 
      username: savedUser.username 
    }, JWT_SECRET, { expiresIn: '1h' });
    
    // Return user info (excluding password) and token
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Generate token
    const token = jwt.sign({ 
      _id: user._id, 
      username: user.username 
    }, JWT_SECRET, { expiresIn: '1h' });
    
    // Return user info (excluding password) and token
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new petition
app.post('/api/petitions', authenticateToken, async (req, res) => {
  const { title, description, targetSignatures, category } = req.body;
  
  if (!title || !description || !targetSignatures) {
    return res.status(400).json({ error: 'Please provide title, description and target signatures' });
  }
  
  try {
    const newPetition = new Petition({
      title,
      description,
      category: category || 'Other',
      targetSignatures,
      createdBy: req.user._id
    });
    
    const savedPetition = await newPetition.save();
    res.status(201).json(savedPetition);

    // Notify connected clients about the new petition
    broadcastEvent('petition_created', savedPetition);
  } catch (error) {
    res.status(500).json({ error: 'Error creating petition' });
  }
});

// Get petitions created by the authenticated user
app.get('/api/my-petitions', authenticateToken, async (req, res) => {
  try {
    const petitions = await Petition.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching your petitions' });
  }
});

// Get single petition
app.get('/api/petitions/:id', async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id).populate('createdBy', 'name username');
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    res.json(petition);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching petition' });
  }
});

// Sign petition
app.post('/api/petitions/:id/sign', authenticateToken, async (req, res) => {
  const { comment, location } = req.body;
  
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    // Check if user has already signed
    const alreadySigned = petition.signatures.some(sig => sig.userId.toString() === req.user._id);
    if (alreadySigned) {
      return res.status(400).json({ error: 'You have already signed this petition' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Add signature
    petition.signatures.push({
      userId: req.user._id,
      name: user.name,
      location: location || undefined,
      comment,
      signedAt: new Date()
    });
    
    // Update signature count
    petition.signatureCount = petition.signatures.length;
    
    await petition.save();
    res.json(petition);

    // Notify connected clients about the updated petition
    broadcastEvent('petition_updated', petition);
  } catch (error) {
    res.status(500).json({ error: 'Error signing petition' });
  }
});

// Simple AI-style petition analyzer (rule-based mock)
app.post('/api/petitions/analyze', authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Please provide title and description to analyze.' });
  }

  const lengthScore = Math.min(description.length / 500, 1); // good if >= 500 chars
  const hasWhy = /because|due to|so that|in order to/i.test(description);
  const hasCallToAction = /sign|support|join|act now|we call on/i.test(description);
  const hasWho = /government|council|minister|school|company|official/i.test(description);

  let score = 0.3 + lengthScore * 0.3;
  if (hasWhy) score += 0.1;
  if (hasCallToAction) score += 0.15;
  if (hasWho) score += 0.15;
  score = Math.min(score, 0.98);

  const suggestions = [];

  if (!hasWhy) {
    suggestions.push('Explain clearly why this issue matters and who is impacted (use phrases like "because", "so that").');
  }
  if (!hasCallToAction) {
    suggestions.push('Add a strong call to action asking people to sign and share the petition.');
  }
  if (!hasWho) {
    suggestions.push('Mention who should act (e.g., specific government body, official, or organization).');
  }
  if (description.length < 400) {
    suggestions.push('Add more detail and context so readers fully understand the problem and solution (aim for at least 400–600 characters).');
  }

  if (suggestions.length === 0) {
    suggestions.push('Your petition is already strong. Consider adding recent facts, statistics, or personal stories to make it even more compelling.');
  }

  res.json({
    successProbability: Math.round(score * 100),
    suggestions
  });
});

// AI-style sentiment analysis of petition comments
app.get('/api/petitions/:id/sentiment', async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    const signatures = petition.signatures || [];
    const comments = signatures
      .map((s) => s.comment)
      .filter((c) => typeof c === 'string' && c.trim().length > 0);

    if (comments.length === 0) {
      return res.json({
        totalComments: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        overallLabel: 'No data yet'
      });
    }

    const positiveWords = ['support', 'great', 'important', 'love', 'hope', 'good', 'brave', 'thank', 'essential', 'vital'];
    const negativeWords = ['angry', 'upset', 'bad', 'terrible', 'disappointed', 'frustrated', 'hate', 'unfair', 'worried'];

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    comments.forEach((raw) => {
      const text = raw.toLowerCase();
      let score = 0;
      positiveWords.forEach((w) => {
        if (text.includes(w)) score += 1;
      });
      negativeWords.forEach((w) => {
        if (text.includes(w)) score -= 1;
      });

      if (score > 0) positive += 1;
      else if (score < 0) negative += 1;
      else neutral += 1;
    });

    const total = positive + neutral + negative;
    let overallLabel = 'Mixed';
    if (positive / total > 0.6) overallLabel = 'Mostly positive';
    else if (negative / total > 0.6) overallLabel = 'Mostly negative';
    else if (neutral / total > 0.7) overallLabel = 'Mostly neutral';

    res.json({
      totalComments: total,
      positive,
      neutral,
      negative,
      overallLabel
    });
  } catch (error) {
    res.status(500).json({ error: 'Error analyzing sentiment' });
  }
});

// Simple chat assistant for petition-related questions (rule-based mock)
app.post('/api/chat', async (req, res) => {
  const { message, petitionTitle, petitionDescription } = req.body || {};
  const text = (message || '').toLowerCase();

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const title = petitionTitle || 'this petition';
  const desc = petitionDescription || '';
  const descSnippet =
    desc.length > 260 ? desc.slice(0, 260).trim() + '...' : desc.trim();

  let reply = "I'm here to help you understand and improve this petition.";

  // Questions mainly asking "what is this petition about"
  if (
    text.includes('what is the petition') ||
    text.includes('what\'s the petition') ||
    text.includes('what is this petition') ||
    text.includes('what is it about') ||
    text.includes('what is this about') ||
    text.includes('basically about') ||
    text.includes('summary') ||
    text.includes('explain this petition')
  ) {
    reply =
      `In simple terms, "${title}" is a petition about ` +
      (descSnippet
        ? `${descSnippet} `
        : 'an issue that affects a specific group of people or community. ') +
      'The goal is to clearly describe the problem, who is affected, and what concrete action you want decision‑makers to take.';
  } else if (text.includes('title') || text.includes('headline')) {
    reply =
      "To write a strong title, make it specific, action-oriented, and short. For example: \"Protect our local park from development\" instead of \"Park issue\". Mention who or what should act, and what you want them to do.";
  } else if (text.includes('description') || text.includes('improve') || text.includes('rewrite')) {
    reply =
      "A good petition description usually has: (1) a short summary of the problem, (2) who is affected, (3) what exactly you want to change, and (4) a clear call to action asking people to sign and share. Add 1–2 real examples or stories to make it more personal.";
  } else if (text.includes('who should i send') || text.includes('who should i contact') || text.includes('who to contact')) {
    reply =
      "Think about who has the direct power to fix this issue: a local council, school board, government department, company, or specific official. Your petition is most effective when it clearly names the decision-maker you are calling on to act.";
  } else if (text.includes('how to get more signatures') || text.includes('more signatures') || text.includes('share')) {
    reply =
      "To get more signatures: (1) share the petition in relevant groups and communities, (2) ask friends to re-share, (3) keep the title and first paragraph very clear, and (4) post short updates or stories to remind people why it matters.";
  } else if (text.includes('success') || text.includes('win') || text.includes('work')) {
    reply =
      "Petitions are more likely to succeed when they are focused on a concrete, realistic demand, backed by clear facts or stories, and targeted at a specific decision-maker. It also helps to set a clear deadline and keep supporters updated on any responses.";
  } else {
    reply =
      "You can ask me about how to write a stronger title, improve your description, choose who to target, or how to get more signatures. For example: \"How can I improve my petition description?\" or \"Who should I send this to?\"";
  }

  res.json({ reply });
});

// Update government response status (petition creator only)
app.patch('/api/petitions/:id/government-response', authenticateToken, async (req, res) => {
  const { status, text } = req.body;

  const allowedStatuses = ['Not Sent', 'Sent', 'Viewed', 'Responded', 'Implemented'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    if (petition.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Only the petition creator can update government response' });
    }

    if (status) {
      petition.governmentResponseStatus = status;
    }
    if (typeof text === 'string') {
      petition.governmentResponseText = text;
    }
    petition.governmentLastUpdated = new Date();

    await petition.save();

    res.json({
      governmentResponseStatus: petition.governmentResponseStatus,
      governmentResponseText: petition.governmentResponseText,
      governmentLastUpdated: petition.governmentLastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating government response' });
  }
});
// Root route for homepage
app.get('/', (req, res) => {
  res.send("AI Petition Platform Backend is Running 🚀");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 