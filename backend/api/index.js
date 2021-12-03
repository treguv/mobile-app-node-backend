/**
 *  Neatly combines the routes into one place
 */
const {checkToken} = require("../../middleware/jwt");

const router = require('express').Router();
const registerRoutes = require('./register');
const verificationRoutes = require('./verification');
const signInRoutes = require('./signin');
const passwordResetRoutes = require('./passwordreset');
const chatRoutes = require('./chats');
const searchRoutes = require('./search');
const contactRoutes = require('./contact');
const weatherRoutes = require('./weather')
const messagesRoutes = require('./messages');
const pushyRegisterRoutes = require('./pushyregister');

router.use("/chat",checkToken, chatRoutes);
router.use("/passwordreset",passwordResetRoutes);
router.use("/register", registerRoutes);
router.use("/signin", signInRoutes);
router.use("/verification", verificationRoutes);
router.use("/search", checkToken, searchRoutes);
router.use("/contact", checkToken, contactRoutes);
router.use("/weather",weatherRoutes);
router.use("/messages", checkToken, messagesRoutes);
router.use("/pushyauth", checkToken, pushyRegisterRoutes);

module.exports = router;

