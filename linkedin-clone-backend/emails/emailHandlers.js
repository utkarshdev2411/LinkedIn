const { MailtrapClient, sender } = require("mailtrap");
const {
  createWelcomeEmailTemplate,
  createCommentNotificationEmailTemplate,
  createConnectionAcceptedEmailTemplate,
} = require("./emailTemplates");

const dotenv = require("dotenv");
dotenv.config();

const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const sendWelcomeEmail = async (email, firstName, lastName, profileUrl) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to LinkedinClone by parth.dev",
      html: createWelcomeEmailTemplate(firstName, lastName, profileUrl),
      category: "welcome",
    });

    console.log("Welcome Email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const sendCommentNotificationEmail = async (
  recipientEmail,
  recipientName,
  commenterName,
  postUrl,
  commentContent
) => {
  const recipient = [{ email: recipientEmail }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient, // This is already declared above
      subject: "New Comment on your post",
      html: createCommentNotificationEmailTemplate(
        recipientName,
        commenterName,
        postUrl,
        commentContent
      ),
      category: "comment_notification",
    });
    console.log("Email Notification Email sent successfully", response);
  } catch (error) {
    throw error;
  }
};

const sendConnectionAcceptedEmail = async (
  senderEmail,
  senderName,
  recipientName,
  profileUrl
) => {
  const recipient = [{ email: senderEmail }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: `Your connection request has been accepted by ${recipientName}`,
      html: createConnectionAcceptedEmailTemplate(
        recipientName,
        senderName,
        profileUrl
      ),
    });
    console.log("Connection Accepted Email sent successfully", response);
  } catch (error) {
    console.log("Error in acceptConnectionRequest controller", error);
    response.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCommentNotificationEmail,
  sendConnectionAcceptedEmail,
};
