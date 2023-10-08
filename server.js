
const http = require('http');
const app = require('./app.js')

require('dotenv').config();

const port = process.env.PORT || 8000;


const server = http.createServer(app);

function startServer(){
    server.listen(port, ()=>{
        console.log('listning to port 8000')
    })
}

startServer();