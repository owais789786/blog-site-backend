const jwt = require('jsonwebtoken');

const googleAuth = async (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.redirect(process.env.CLIENT_URL);
};

module.exports = { googleAuth };