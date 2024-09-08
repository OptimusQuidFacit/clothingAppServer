import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import { session } from "passport";
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
    passport.authenticate('google', { failureRedirect: '/' }, async (err: any, user: any) => {
      if (err || !user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
  
      try {
        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SEC || "defaultSecret", { expiresIn: "3d" });
  
        // Extract the redirect URI (from mobile app, passed in the query params)
        const { redirectUri } = req.query;
  
        // Respond with the token and user data
        // if (redirectUri) {
        //   res.redirect(`${redirectUri}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        // } else {
          res.json({ token, user });
        // }
  
      } catch (err) {
        console.error("Error during authentication:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    })(req, res, next);
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