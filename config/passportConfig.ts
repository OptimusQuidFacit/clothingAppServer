const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy= require('passport-local').Strategy;
const JwtStrategy= require('passport-jwt').Strategy;
const ExtractJwt= require('passport-jwt').ExtractJwt;
const usersModel = require('../models/user');
// const crypto = require('crypto');
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

// Generate a code verifier and challenge
// const codeVerifier = crypto.randomBytes(32).toString('hex');
// const codeChallenge = crypto
//   .createHash('sha256')
//   .update(codeVerifier)
//   .digest('base64url');

// JWT options
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SEC
};


module.exports = (passport:any) => {
    //Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://clothing-app-server.vercel.app/auth/google/callback",
        passReqToCallback: true, // Enable passing request object to callback
        state:true,
        codeChallengeMethod: 'S256' //Required if using PKCE
      },
      async (req:any, accessToken:any, refreshToken:any, profile:any, cb:any) => {
        try {
            const newUser = new usersModel({
                googleId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                displayName: profile.displayName,
                image: profile.photos[0].value,
            });

            // Check if user exists or save the new user
            let user = await usersModel.findOne({ googleId: profile.id });
            if (user) {
                cb(null, user);
            } else {
                await newUser.save();
                cb(null, user);
            }
        } catch (err) {
            console.error(err);
            cb(err, null);
        }
      }
    ));

    passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    async (email: string, password: string, done: any) => {
        try {
            const user = await usersModel.findOne({ email: email }).lean();
            if (!user) {
                return done(null, false, { error: "User does not exist" });
            }

            const passwordIsCorrect = await bcrypt.compare(password, user.password);
            if (!passwordIsCorrect) {
                return done(null, false, { error: "Password is incorrect" });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user: any, cb: any) => {
        process.nextTick(() => {
            return cb(null, {
                id: user.id,
            });
        });
    });

    passport.deserializeUser((user: any, cb: any) => {
        process.nextTick(() => {
            return cb(null, user);
        });
    });

    passport.use(
        new JwtStrategy(jwtOptions, async (jwt_payload: any, done: any) => {
            try {
                let user = await usersModel.findOne({ _id: jwt_payload.id });
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
