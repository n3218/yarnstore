import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  const token = generateToken(req.user._id);
  const redirect = process.env.OAUTH_SUCCESS_REDIRECT || 'http://localhost:3000/oauth';

  res.redirect(`${redirect}?token=${token}`);
});

export default router;
