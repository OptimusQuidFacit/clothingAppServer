var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy= require('passport-local').Strategy
const usersModel = require('../models/user');



module.exports= (passport:any)=>{
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async (accessToken:any, refreshToken:any, profile:any, cb:any) => {

        // console.log(profile.id);
        const newUser = new usersModel({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            displayName: profile.displayName,
            image: profile.photos[0].value,
        });
        try{
            let user = await usersModel.findOne({googleId: profile.id})

            if(user){
                cb(null, user)
            }
            else{
                await newUser.save();
                cb(null,user);
            }

        }
        catch(err){
            console.error(err);
        }

        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
    
      }
    ))
    passport.use(new LocalStrategy({
        usernameField:'email'
    },
        async (email:string, password:string, done:any)=> {
           
            try {

                const user = await usersModel.findOne({ email: email })
                if (!user) {
               
                    return done(null, false, {error:"Password is incorrect"}); 
                }
                if(password!==user.password){
                    return done(null, false, {error:"Password is incorrect"});
                }
                return done(null, user);
            }
            catch(err){
                return done(err);
            }
        }
    ))


        passport.serializeUser((user:any, cb:any) => {
         process.nextTick(()=> {
          return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
          });
        });
      });
      
      passport.deserializeUser((user:any, cb:any)=> {
        process.nextTick(()=> {
          return cb(null, user);
        });
      });
}