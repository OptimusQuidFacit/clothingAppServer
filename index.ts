import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { buildSchema } from 'graphql';
import cart from './models/cart';

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log('Successful connection');
  })
  .catch((err: any) => console.log(err));

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
    userId: String!
    name: String!
    unitPrice: Float!
    quantity: Int!
    total: Float!
    size: String!
    color: String!
    category: [String!]!
    img: Float!
  }

  input CartItemInput {
    productId: Float!
    userId: String!
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
    addToCart(item: CartItemInput): CartItem
    deleteFromCart(id: String): CartItem
  }
`);

const root = {
  products: () => productsArray,
  cart: async ({ userId }: { userId: string }) => {
    return await cart.find({ userId }).exec();
  },
  addToCart: async ({ item }: { item: any }) => {
    try {
      const newCart = new cart(item);
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
  },
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.get('/', (req: Request, res: Response) => res.send('Server is running'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Running a GraphQL API server at http://localhost:' + port);
});
