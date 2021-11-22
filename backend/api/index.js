/**
 *  Neatly combines the routes into one place
 */
const router = require('express').Router();
const registerRoutes = require('./register');
const verificationRoutes = require('./verification');
const signInRoutes = require('./signin');
const passwordResetRoutes = require('./passwordreset');
const messagesRoutes = require('./messages');
const chatsRoutes = require('./chats');
const pushyRegisterRoutes = require('./pushyregister');

const middleware = require('../../middleware');

router.use("/passwordreset",passwordResetRoutes)
router.use("/register", registerRoutes);
router.use("/signin", signInRoutes);
router.use("/verification", verificationRoutes);
router.use("/messages", middleware.checkToken, messagesRoutes);
router.use("/chats", middleware.checkToken, chatsRoutes);
router.use("/pushyregister", middleware.checkToken, pushyRegisterRoutes);

module.exports = router;

