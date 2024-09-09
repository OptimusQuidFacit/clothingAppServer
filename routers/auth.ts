import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import { session } from "passport";
import axios from "axios";
const express= require('express');
const passport = require('passport');
const user = require('../models/user');
const jwt = require("jsonwebtoken");
const router= express.Router();
const crypto = require("crypto");
// const codeVerifier = crypto.randomBytes(32).toString('hex');
// router.get('/google',
//   passport.authenticate('google', { scope: ['profile'] }));

// router.get('/google', (req:any, res:any, next:NextFunction) => {



//   passport.authenticate('google', {
//       scope: ['profile', 'email'],

//   })(req, res, next);
// });

router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));



  router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
    const { code, redirectUri } = req.params;  // Extract the authorization code and redirectUri from the client request
    console.log(code);
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
  
    try {
      // Step 1: Exchange authorization code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });
  
      const { access_token, id_token } = tokenResponse.data;
  
      // Step 2: Fetch user info from Google API using access_token
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      const googleUser = userResponse.data;
  
      // Step 3: Check if user exists in your database
      let findUser = await user.findOne({ googleId: googleUser.id });
  
      if (!findUser) {
        // Step 4: If user doesn't exist, create a new user
        findUser = new user({
          googleId: googleUser.id,
          email: googleUser.email,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          profilePicture: googleUser.picture,
        });
        await findUser.save();
      }
  
      // Step 5: Generate a JWT token for the user
      const token = jwt.sign({ id: findUser._id }, process.env.JWT_SEC || "defaultSecret", { expiresIn: "3d" });
  
      // Step 6: Respond with the token and user data
      if (redirectUri) {
        res.redirect(`${redirectUri}?token=${token}&user=${encodeURIComponent(JSON.stringify(findUser))}`);
      } else {
        res.json({ token, findUser });
      }
  
    } catch (error) {
      console.error('Error during Google authentication:', error.response?.data || error.message);
      res.status(500).json({ message: 'Internal server error', error: error.response?.data });
    }
  });
  

// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req:any, res:any) => {
//     // Successful authentication, redirect home.
//     // const {redirect_uri} = req.query;
//     // res.redirect(`${redirect_uri}?success=true&user=${encodeURIComponent(JSON.stringify(req.user))}`);
//     // res.send(req.user);
//     let user = req.user
//     let token= jwt.sign({id:user._id}, process.env.JWT_SEC, {expiresIn: "3d"})
//     res.json({ token, user });

//   });


// router.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req:any, res:Response) => {
//     // Successful authentication, redirect home.
//     // res.redirect('/');
//     res.json(req.user);
//   });

  router.get('/logout', (req:any, res: Response, next: NextFunction)=>{
    req.logout((err:any) => {
        if (err) { return next(err); }
        // res.redirect('/');
        res.json('User Logged out');
      });

  })

  router.post('/register', async (req: Request, res: Response)=>{
    try{
        req.body.googleId= Math.floor(100 + Math.random()*10000);
        req.body.firstName= req.body.displayName.split(' ')[0];
        let salt = await bcrypt.genSalt(10);
        let password= await bcrypt.hash(req.body.password, salt);
        req.body.password= password;
       if ( req.body.displayName.split(' ')[1]){
        req.body.lastName=req.body.displayName.split(' ')[1];
       }
       await user.create(req.body);
       res.json('Successful Registration');
    }
    catch(err){
        console.log(err)
    }
  })

  router.post('/login', (req: any, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err:any, user:any, info:any) => {
      if (err) return next(err); // Handle errors that occurred during the authentication process
      if (!user) return res.status(400).json(info); // Authentication failed, send the info object as a response
      req.logIn(user, (err: any) => {
        if (err) return next(err); // Handle errors that occurred during login
        let token= jwt.sign({id:user._id}, process.env.JWT_SEC, {expiresIn: "3d"})
        return res.json({session: req.session, token}); // Authentication succeeded, send the user object as a response
      });
    })(req, res, next);
  });
  

module.exports= router;