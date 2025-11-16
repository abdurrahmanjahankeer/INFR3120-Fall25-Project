/* I moved the URL to .env to hide the secret MongoDB password */

require('dotenv').config();
module.exports = {URI: process.env.MONGO_URI};