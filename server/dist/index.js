// import express from "express";
// import { ApolloServer } from "@apollo/server";
// import { expressMiddleware } from "@apollo/server/express4";
// import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// import { createServer } from "http";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// dotenv.config();
// // import typeDefs from "./schemas";
// import typeDefs from "./typeDefs.js";
// import { resolvers } from "./resolvers"; // Same for ./resolvers
// import { connectToDb } from "./utils/mongoDb";
// const PORT = process.env.PORT || 4000;
// (async () => {
//   await connectToDb();
//   const app = express();
//   app.use(cors());
//   app.use(bodyParser.json());
//   const httpServer = createServer(app);
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
//   });
//   await server.start();
//   app.use("/graphql", bodyParser.json(), expressMiddleware(server));
//   httpServer.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}/graphql`);
//   });
// })();
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { Schema, model } from "mongoose";
// //  import typeDefs and resolvers
// import typeDefs  from "./typeDefs";
// import { resolvers } from "./resolvers";
// Mongoose Schemas
// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true }, // Unique username
    fname: { type: String, required: true }, // First name
    lname: { type: String, required: true }, // Last name
}, { timestamps: true }); // Automatically add createdAt and updatedAt
// Post Schema
const postSchema = new Schema({
    user_id: { type: String, required: true }, // User ID (reference)
    title: { type: String, required: true }, // Title of the post
    content: { type: String, required: true }, // Content of the post
    cover_image: { type: String, required: true }, // Cover image URL
}, { timestamps: true });
// Comment Schema
const commentSchema = new Schema({
    postid: { type: Schema.Types.ObjectId, ref: "Post", required: true }, // Post ID (reference)
    sender: { type: String, required: true }, // Sender's username
    text: { type: String, required: true }, // Comment text
    replies: [
        {
            messageId: { type: Schema.Types.ObjectId, ref: "Comment" }, // Message ID being replied to
            sender: { type: String, required: true }, // Sender's username for the reply
            text: { type: String, required: true }, // Reply text
        },
    ],
}, { timestamps: true });
// Models
const User = model("User", userSchema);
const Post = model("Post", postSchema);
const Comment = model("Comment", commentSchema);
const typeDefs = `#graphql
# GraphQL Schema
type User {
  id: ID! # MongoDB ObjectId as the unique identifier
  username: String!
  fname: String!
  lname: String!
}

type Post {
  id: ID! # MongoDB ObjectId
  user_id: String # References User's ObjectId
  title: String!
  content: String!
  cover_image: String!
  # created_at: String! # ISO String of creation date
}

type Reply {
  id: ID! # MongoDB ObjectId
  messageId: ID! # References Comment's ObjectId
  sender: String!
  timestamp: String! # ISO String of timestamp
  text: String!
}

type Comment {
  id: ID! # MongoDB ObjectId
  postid: ID! # References Post's ObjectId
  sender: String!
  timestamp: String! # ISO String of timestamp
  text: String!
  replies: [Reply!] # List of replies
}

# Queries
type Query {
  getUsers: [User!]!
  getUser(id: ID!): User
  getPosts: [Post!]!
  getPost(id: ID!): Post
  getComments(postid: ID!): [Comment!]!
}

# Mutations
type Mutation {
  createUser(username: String!, fname: String!, lname: String!): User!
  createPost(user_id: String!, title: String!, content: String!, cover_image: String!): Post!
  createComment(postid: ID!, sender: String!, text: String!): Comment!
  addReply(commentId: ID!, messageId: ID!, sender: String!, text: String!): Reply!
}
`;
const resolvers = {
    Query: {
        // Fetch all users
        async getUsers() {
            try {
                return await User.find({});
            }
            catch (error) {
                throw new Error("Error fetching users: " + error.message);
            }
        },
        // Fetch a single user by ID
        async getUser(_, { id }) {
            try {
                return await User.findById(id);
            }
            catch (error) {
                throw new Error("Error fetching user: " + error.message);
            }
        },
        // Fetch all posts
        async getPosts() {
            try {
                return await Post.find({});
            }
            catch (error) {
                throw new Error("Error fetching posts: " + error.message);
            }
        },
        // Fetch a single post by ID
        async getPost(_, { id }) {
            try {
                return await Post.findById(id);
            }
            catch (error) {
                throw new Error("Error fetching post: " + error.message);
            }
        },
        // Fetch comments by post ID
        async getComments(_, { postid }) {
            try {
                return await Comment.find({ postid });
            }
            catch (error) {
                throw new Error("Error fetching comments: " + error.message);
            }
        },
    },
    Mutation: {
        // Create a new user
        async createUser(_, { username, fname, lname }) {
            try {
                const newUser = new User({ username, fname, lname });
                return await newUser.save();
            }
            catch (error) {
                throw new Error("Error creating user: " + error.message);
            }
        },
        // Create a new post
        async createPost(_, { user_id, title, content, cover_image }) {
            try {
                const newPost = new Post({
                    user_id,
                    title,
                    content,
                    cover_image,
                    created_at: new Date().toISOString(),
                });
                return await newPost.save();
            }
            catch (error) {
                throw new Error("Error creating post: " + error.message);
            }
        },
        // Create a new comment
        async createComment(_, { postid, sender, text }) {
            try {
                const newComment = new Comment({
                    postid,
                    sender,
                    timestamp: new Date().toISOString(),
                    text,
                    replies: [],
                });
                return await newComment.save();
            }
            catch (error) {
                throw new Error("Error creating comment: " + error.message);
            }
        },
        // Add a reply to a comment
        async addReply(_, { commentId, messageId, sender, text }) {
            try {
                const reply = {
                    id: 11,
                    messageId,
                    sender,
                    timestamp: new Date().toISOString(),
                    text,
                };
                const updatedComment = await Comment.findOneAndUpdate({ _id: commentId }, { $push: { replies: reply } }, { new: true });
                if (!updatedComment) {
                    throw new Error("Comment not found");
                }
                return reply;
            }
            catch (error) {
                throw new Error("Error adding reply: " + error.message);
            }
        },
    },
};
// // mongoDB
// //----------------------------------------------------------------//
async function connectToDb() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log("🍃 Connected to MongoDB Atlas successfully");
    }
    catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error.message);
        process.exit(1);
    }
}
connectToDb();
//----------------------------------------------------------------//
// const localMongoUrl = process.env.MONGODB_LOCAL_URI;
// mongoose.connect(localMongoUrl);
// const db = mongoose.connection;
// db.on("error", (err) => {
//   console.error("Error connecting to MongoDB:", err);
//   process.exit(1);
// });
// db.once("open", () => {
//   console.log(colors.bgMagenta("🍃 Connected to MongoDB LOCAL successfully"));
// });
// process.on("warning", (e) => console.warn(e.stack));
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    // console.log(`Memory Usage: 
    //   RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
    //   Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
    //   Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
    //   External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
}, 5000); // Log memory usage every 5 seconds
const used = process.memoryUsage();
// console.log(`Memory Usage ++++++++++++++:
//   RSS: ${(used.rss / 1024 / 1024).toFixed(2)} MB
//   Heap Total: ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB
//   Heap Used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB
//   External: ${(used.external / 1024 / 1024).toFixed(2)} MB`);
// const PORT = process.env.PORT || 4000;
const PORT = 4000;
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
app.use(cors({
    origin: "*", // Allows all origins
    methods: ["GET", "POST"], // Most GraphQL servers only need these
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Use true if authentication is required
}));
// Static file setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../etc/secrets")));
app.use(express.static(path.join(__dirname, "../public")));
const filePath = path.join(__dirname, "../public/index.html");
(async () => {
    try {
        const index = await fs.readFile(filePath, "utf-8");
        app.get("/", (_, res) => {
            res.send(index);
        });
    }
    catch (error) {
        console.error("Error reading file:", error);
    }
})();
// Create and start Apollo Server
const httpServer = createServer(app);
const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use("/graphql", bodyParser.json(), expressMiddleware(server));
// Start HTTP server
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/graphql`);
});
