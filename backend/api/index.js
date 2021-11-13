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

router.use("/chat",checkToken, chatRoutes);
router.use("/passwordreset",passwordResetRoutes)
router.use("/register", registerRoutes);
router.use("/signin", signInRoutes);
router.use("/verification", verificationRoutes);

module.exports = router;

