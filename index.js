const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
require('dotenv').config();

const port = process.env.PORT || 3000;

const connectDB = require('./src/config/db');
const { logErrors, errorStatus, formatError, sendErrorResponse } = require('./src/middlewares/error.middleware');
const userRoutes = require('./src/routes/user.route');

const typeDefs = `#graphql
    type Query{
        hello: String
    }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello Bro, graphql is running'
    },
};

async function startServer() {
    const app = express();
    app.use(express.json());

    // DB Connection ----
    await connectDB();

    // Rest Routes ----
    app.get('/api', userRoutes);

    // GraphQL Route ----
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();
    app.use('/graphql', cors(), express.json(), expressMiddleware(apolloServer));

    // Error Handling (always at last) ----
    app.use(logErrors, errorStatus, formatError, sendErrorResponse);

    app.listen(port, () => {
        console.log(`REST: http://localhost:${port}/api`);
        console.log(`GraphQL: http://localhost:${port}/graphql`);
    });
}

startServer();