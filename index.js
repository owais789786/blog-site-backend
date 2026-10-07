const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const passport = require('passport');
require('dotenv').config();
require('./src/config/passport');

const connectDB = require('./src/config/db');
const { logErrors, errorStatus, formatError, sendErrorResponse } = require('./src/middlewares/error.middleware');
const { apiLimiter } = require('./src/middlewares/rateLimiter.middleware');
const userRoutes = require('./src/modules/users/user.route');
const authRoutes = require('./src/modules/auth/auth.route');

const port = process.env.PORT || 3000;
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
    const cookieParser = require('cookie-parser');
    app.use(express.json());
    app.use(cookieParser());
    app.set('trust proxy', 1);
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.CLIENT_URL 
            : 'http://localhost:5173',
        credentials: true,
    }));
    app.use(['/api', '/graphql'], apiLimiter);
    app.use(passport.initialize());

    // DB Connection ----
    await connectDB();

    const postRoutes = require('./src/modules/posts/post.route');

    // Rest Routes ----
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/posts', postRoutes);

    // GraphQL Route ----
    const apolloServer = new ApolloServer({ 
        typeDefs, 
        resolvers,
        introspection: process.env.NODE_ENV !== 'production'
    });
    await apolloServer.start();
    app.use('/graphql', expressMiddleware(apolloServer));

    // Error Handling (always at last) ----
    app.use(errorStatus, logErrors, formatError, sendErrorResponse);

    app.listen(port, () => {
        console.log(`REST: http://localhost:${port}/api`);
        console.log(`GraphQL: http://localhost:${port}/graphql`);
    });
}

startServer();