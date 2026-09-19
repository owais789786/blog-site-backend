const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        logger.info('Server is Running');

    } catch (err) {
        console.error('MongoDB connection error: ', err.message);
        logger.error('Error in connection to db')
        process.exit(1);
    }
}
 
module.exports = connectDB; 