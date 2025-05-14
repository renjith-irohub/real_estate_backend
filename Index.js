require("dotenv").config();

const express = require("express");
const router = require("./routes");
const connect = require("./DB/connect");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const { initializeSocket } = require("./socket");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

connect();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));



app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

initializeSocket(server); // Initialize Socket.IO
app.use(router);
app.use(errorHandler);

server.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
