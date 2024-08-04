import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { buildSchema } from 'graphql';
import cart from './models/cart';
import MongoStore from 'connect-mongo';
const passportConfig = require("./config/passportConfig");
const session = require("express-session");
const passport= require('passport')
const authRouter= require('./routers/auth');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const connectToDatabase = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL as string);
      console.log('Successfully connected to MongoDB Atlas');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas:', error);
      process.exit(1); // Exit process with failure
    }
  };

connectToDatabase();

type CartType = {
  productId: number;
  userId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  size?: string;
  color?: string;
  category?: string[];
  img?: number;
};

const productsArray = [
  {
    name: 'Cotton Classic',
    price: 15000,
    category: ['Women', 'white'],
    colors: ['black', 'white', 'red'],
    sizes: ['S', 'M', 'L'],
  },
  {
    name: 'Classic Men\'s Suit',
    price: 25000,
    category: ['Men', 'black'],
    colors: ['black', 'brown', 'grey'],
    sizes: ['S', 'M', 'L'],
  },
];

const schema = buildSchema(`
  type Product {
    name: String!
    price: Float!
    category: [String!]!
    colors: [String!]!
    sizes: [String!]!
  }

  type CartItem {
    productId: Float!
    name: String!
    unitPrice: Float!
    quantity: Int!
    total: Float!
    size: String!
    color: String!
    category: [String!]!
    img: Float!
  } 
type Cart {
    userId: String!
    cart: [CartItem!]!
}
input CartItemInput {
    productId: Float!
    name: String!
    unitPrice: Float!
    quantity: Int!
    total: Float!
    size: String!
    color: String!
    category: [String!]!
    img: Float!
}

  type Query {
    cart(userId: String): [CartItem]
    products: [Product!]
  }

  type Mutation {
    updateCart(items: [CartItemInput], userId:String): Cart
    deleteFromCart(id: String): CartItem
  }
`);

const root = {
  products: () => productsArray,
  cart: async ({ userId }: { userId: string }, context:any ) => {
    if(!context.user){
      throw new Error('You are not allowed to do this')
    }
    const cartObject= await cart.findOne({userId});
    return cartObject?.cart;
  },
//   Mutation: {
    updateCart: async ({items, userId}: {items: any, userId:string}, context:any) => {
    if(!context.user){
      throw new Error(`You are not allowed to do this, please sign in ${context.user}`)
    }
      try {
        const cartExists= await cart.findOne({userId})
        if(cartExists){
            let value= await cart.findOneAndUpdate({userId}, {cart:items});
            return value;
        }
        const newCart = new cart({
            userId,
            cart:items
        });
        const newCartItem = await newCart.save();
      return newCartItem;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
    deleteFromCart: async ({ id }: { id: string }) => {
    try {
      const deletedItem = await cart.findByIdAndDelete(id).exec();
      return deletedItem;
    } catch (err) {
      console.log(err);
      return null;
    }
    },}
// };



//passport configurations
passportConfig(passport);
try{

    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({mongoUrl: process.env.MONGO_URL})
      }));
}
catch(err){
    console.log(err)
}

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req: Request, res: Response) => res.send('Server is running'));
app.use('/auth', authRouter)

app.use('/graphql', passport.authenticate("jwt", {session:false}) ,
  graphqlHTTP((req: any, res: any)=>({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: {user: req.user}
  })
));
  
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Running a GraphQL API server at http://localhost:' + port);
});
