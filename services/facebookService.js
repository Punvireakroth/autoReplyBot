import axios from 'axios';


// Maintain a Set to store replied comment IDs
const repliedCommentIds = new Set();

async function postCommentReply(commentId, message, accessToken) {
    // Check if the comment ID has already been replied to
    if (repliedCommentIds.has(commentId)) {
        console.log('Comment already replied to:', commentId);
        return; 
    }

    const postUrl = `https://graph.facebook.com/${commentId}/comments?access_token=${accessToken}`;
    console.log(postUrl);
    try {
        const response = await axios.post(postUrl, { message });
        console.log('Comment reply posted successfully:', response.data);
        // Add the comment ID to the Set of replied comment IDs
        repliedCommentIds.add(commentId);
    } catch (error) {
        console.error('Failed to post comment reply:', error.response.data);
        throw new Error('Failed to post comment reply');
    }
}


module.exports = {
    postCommentReply,
}