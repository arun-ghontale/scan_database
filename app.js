const express = require('express')
const path = require('path');
const app = express()
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const socketIO = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const publicPath = path.join(__dirname, './public');
const CookieIdentifier = 'AAET'

app.use(cookieParser());


// /////////////////////////////to maintain sessions///////////////////////////
// const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: CookieIdentifier
}));


//allow cross origin sharing
const cors = require('cors');
app.use(cors());
app.options('*', cors());



const bodyParser = require('body-parser')
//Do not include the rich text formats by setting it to false
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

const mongoDB = 'mongodb://localhost:27017/scan-database';
mongoose.connect(mongoDB, {
    useNewUrlParser: true
});
const scanRoutes = require('./routes/scan')
const sessionRoutes = require('./routes/user_session')

var server = http.createServer(app);
//socket IO with server
var io = socketIO(server);
//listen to a specific event

app.set('socketio', io);
app.use(express.static(publicPath));
app.use('/scan', scanRoutes);
app.use('/sessions', sessionRoutes);

server.listen(port, () => console.log(`Example app listening on port ${port}!`))