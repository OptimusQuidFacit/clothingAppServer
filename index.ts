const { graphqlHTTP } = require("express-graphql");
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
const schema = buildSchema(`
    type product {
        name: String!,
        price: Float!,
        category: [String!]!,
        img: Float,
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
    }
    
    type Query {
        cart(userId: String): [cartItem]
    },

    type Mutation {
        addToCart(item: cartItem): cartItem
        deleteFromCart(id: String): cartItem
    }    
    `)

    const root = {
        cart: async ({userId}: {userId: string}) => {return (await cartModel.find({userId: userId}).toArray())},
        addCart: async ({cartItem}: any)=>{
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

app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://192.168.135.132:4000/graphql');
});