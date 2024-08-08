var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require('./multer');
const postModel = require("./post")

passport.use(new localStrategy(userModel.authenticate()))
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});
router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});
router.get("/profile", isLoggedIn, async (req, res) => {
  const user = 
  await userModel
  .findOne({ username: req.session.passport.user })
  .populate("posts")
  res.render('profile', { user: user, nav: true })

})
router.get("/search/:titlename", isLoggedIn, async (req, res) => {
  const user = 
  await userModel
  .findOne({ username: req.session.passport.user })
  const regex = new RegExp(`^${req.params.titlename}`,'i');
const post = await postModel.find({title: regex})
  res.render('search', {user, post, nav: true })

})
router.get("/feed", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
const allpost = await postModel.find()
  .populate("user")
  res.render('feed', {  user, allpost, nav: true })

})
router.get("/show/posts", isLoggedIn, async (req, res) => {
  const user = 
  await userModel
  .findOne({ username: req.session.passport.user })
  .populate("posts")
  res.render('show', { user: user, nav: true })

})
router.get("/add", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('add', { user: user, nav: true })

})
router.post("/createpost", isLoggedIn, upload.single("postimage"), async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.desc,
    Image: req.file.filename
  })
  user.posts.push(post._id);
  await user.save()
  res.redirect("/profile")


})
router.post("/fileupload", isLoggedIn, upload.single("image"), async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("/profile")
})
router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact
  })
  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/');
      })
    })
})

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}), function (req, res) {

})
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/")
}
module.exports = router;
