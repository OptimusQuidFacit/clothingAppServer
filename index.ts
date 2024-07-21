import { graphqlHTTP } from "express-graphql";

// const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const cartModel = require('./models/cart');
const express = require('express');
const { buildSchema } = require('graphql');
const app= express();
const dotenv = require ("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URL as string)
.then(()=>{
    console.log('Successful connection');
})
.catch((err: any)=>console.log(err));

type cartType={
    id: number,
    name: string
    unitPrice:number,
    quantity: number,
    total: number,
    size?: string,
    color?: string,
    category?: string[],
  }
const products = [
    {
        name: 'Cotton Classic',
        price: 15000,
        category: ['Women', 'white'],
        colors:['black', 'white', 'red'],
        sizes: ['S','M', 'L', ],
    },
    {
        name: 'Classic Men\'s Suit',
        price: 25000,
        category: ['Men', 'black'],
        colors:['black', 'brown', 'grey'],
        sizes: ['S','M', 'L', ],
    },
]
const schema = buildSchema(`
    type product {
        name: String!,
        price: Float!,
        category: [String!]!,
        colors: [String!]!,
        sizes: [String!]!
    },
    type cartItem {
        productId: Float!,
        userId: String!,
        name: String!,
        unitPrice:Float!,
        quantity: Int!,
        total: Float!,
        size: String!,
        color: String!,
        category: [String!]!,
    },
    input cartItemInput {
        productId: Float!,
        userId: String!,
        name: String!,
        unitPrice:Float!,
        quantity: Int!,
        total: Float!,
        size: String!,
        color: String!,
        category: [String!]!,
    }
    
    type Query {
        cart(userId: String): [cartItem]
        product: [product]
    },

    type Mutation {
        addToCart(item: cartItemInput): cartItem
        deleteFromCart(id: String): cartItem
    }    
    `)


    const root = {
        product: ()=> products,
        cart: async ({userId}: {userId: string}) => {return (await cartModel.find({userId: userId}).toArray())},
        addCart: async ({cartItem}: {cartItem: cartType})=>{
            try{
                // await cartModel.insertOne(cartItem);
                let cart = new cartModel(cartItem)
                let newCartItem= await cart.save();
                return newCartItem;
            }
            catch(err) {console.log(err)}
        },
        deleteFromCart: async ({id}:{id: string})=>{
            try{
                await cartModel.deleteOne({_id:id});
            }
            catch(err){
                console.log(err);
            }
        }
    }
    app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    }));

app.get('/', (req: Request, res: any)=>res.send('Server is running'))
const port= process.env.PORT || 3000
app.listen(port, () => {
  console.log('Running a GraphQL API server at https://clothing-app-server.vercel.app');
});