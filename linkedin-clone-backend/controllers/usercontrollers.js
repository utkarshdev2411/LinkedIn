const User = require("../models/user");
const { cloudinary } = require("../lib/cloudinary");

const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    // find users who are not already connected and also do not recommend our qwn profile!!
    const suggestedUser = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser,
      },
    })
      .select("userName firstName lastName profilePicture headline")
      .limit(3);

    res.json(suggestedUser);
  } catch (error) {
    console.error("Error fetching suggested connections:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.userName }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "userName",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      updatedData.bannerImg = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getSuggestedConnections, getPublicProfile, updateProfile };
