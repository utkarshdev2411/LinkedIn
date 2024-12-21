const { sendCommentNotificationEmail } = require("../emails/emailHandlers");
const { cloudinary } = require("../lib/cloudinary");
const Post = require("../models/posts");
const user = require("../models/user");
const Notification = require("../models/notifications");

const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "firstName userName profilePicture headline")
      .populate("comments.user", "firstName profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;
    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
      await newPost.save();
      res.status(201).json(newPost);
    }
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not the Authorized to delete this post",
      });
    }

    //deleting the image from cloudinary as well
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[1]
      );
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "firstName userName profilePicture headline")
      .populate("comments.user", "firstName profilePicture userName, headline");
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: { user: req.user._id, content } },
      },
      { new: true }
    ).populate("author", "firstName email userName profilePicture headline");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // create a notification if the comment owner is not the post owner
    if ((post.author.toString() !== req.user._id, toString())) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: req.params.id,
      });
      await newNotification.save();

      // send email notification to the post owner when a new comment is made
      try {
        const postUrl = process.env.CLIENT_URL + "/post/" + req.params._id;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.firstName,
          req.user.firstName,
          postUrl,
          content
        );
      } catch (error) {
        console.error("Error sending comment notification email:", error);
        res.status(500).json({
          message: "Error sending notification email",
          error: error.message,
        });
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      ); // unlike the post
    } else {
      post.likes.push(req.user._id); //  like the post

      // create a notification if the post owner is not the user who liked
      if (post.author.toString() !== req.user._id.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: req.user._id,
          relatedPost: req.params.id,
        });

        await newNotification.save();
      }
    }

    await post.save();

    res.status(200).json({ post });
  } catch (error) {
    console.error("Error liking or unliking post:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getFeedPosts,
  createPost,
  deletePost,
  getPostById,
  createComment,
  likePost,
};
