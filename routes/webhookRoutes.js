const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebookService');

let initWebRoutes = (app) => {
  router.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.sendStatus(403);
    }
  });


  let replied = false;

  app.post('/webhook', async (req, res) => {
      const body = req.body;
  
      // Check if the server hasn't replied yet and the request is valid
      if (!replied && body.object === 'page' && body.entry) {
          try {
              // Process webhook event and send reply
              for (const entry of body.entry) {
                console.log(entry.changes);
                  for (const change of entry.changes) {
                      if (change.value && change.value.item === 'comment' && change.value.verb === 'add') {
                          const commentId = change.value.comment_id;
                          const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

                          // Get this information to mention the user.
                          const fromObject = change.value.from;
                          const commenterId = fromObject.id;
                          // console.log(entry.changes.value.from);
                          const message = `@[${commenterId}] Thank you for your comment! Please check your inbox. 📨`
                          await facebookService.postCommentReply(commentId, message, pageAccessToken);
                      }
                  }
              }
              replied = true; // Set flag to true after sending reply
              console.log('Reply sent successfully.');
  
              // Reset replied flag after a timeout (e.g., 5 seconds)
              setTimeout(() => {
                  replied = false;
                  console.log('Cooldown period expired. Ready to reply to new comments.');
              }, 5000); // Adjust cooldown period as needed (in milliseconds)
          } catch (error) {
              console.error('Failed to send reply:', error);
          }
      }
  
      res.status(200).send('EVENT_RECEIVED');
  });
  return app.use('/', router);
}

module.exports = initWebRoutes;

