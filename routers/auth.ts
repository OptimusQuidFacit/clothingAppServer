import { NextFunction, Request, Response } from "express";

const express= require('express');
const passport = require('passport');
const user = require('../models/user');
const router= express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req:any, res:Response) => {
    // Successful authentication, redirect home.
    // res.redirect('/');
    res.json(req.user);
  });

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
        return res.json(req.session); // Authentication succeeded, send the user object as a response
      });
    })(req, res, next);
  });
  

module.exports= router;