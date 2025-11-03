const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try{
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ message: 'Email already used' });
    const u = await User.create({ name, email, password });
    const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ user: { id: u._id, name: u.name, email: u.email }, token });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try{
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if(!u || !(await u.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ user: { id: u._id, name: u.name, email: u.email }, token });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listUsers = async (req,res) => {
  const users = await User.find().select('-password');
  res.json(users);
};
