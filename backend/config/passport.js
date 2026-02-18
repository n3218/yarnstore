import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

export const initPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value?.toLowerCase();
          const googleId = profile.id;

          // 1) если уже есть юзер с таким googleId
          let user = await User.findOne({ googleId });
          if (user) return done(null, user);

          // 2) иначе пробуем найти по email и “привязать” googleId
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              await user.save();
              return done(null, user);
            }
          }

          // 3) иначе создаём нового
          user = await User.create({
            name: profile.displayName || 'Google User',
            email: email || `google_${googleId}@no-email.local`,
            googleId,
            // пароль не нужен — это oauth user
            password: 'oauth' // если схема требует, можно поставить рандом и не использовать
          });

          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );
};
