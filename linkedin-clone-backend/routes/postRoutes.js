const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { getFeedPosts, createPost, deletePost, getPostById, createComment, likePost } = require("../controllers/postcontroller");
const router = express.Router();

router.get("/", isLoggedIn, getFeedPosts);
router.post("/create", isLoggedIn, createPost);
router.delete("/delete/:id", isLoggedIn, deletePost);
router.get("/:id", isLoggedIn, getPostById);
router.post("/:id/comment", isLoggedIn, createComment);
router.post("/:id/like", isLoggedIn, likePost);

module.exports = router;
