const router = require('express').Router();
const homeRoutes = require('./homeRoutes');
const userRoutes = require("./api/user-routes")



router.use('/', homeRoutes);
router.use("/api/users", userRoutes);





module.exports = router;