import { Inngest } from "inngest";
import { 
    createTapestryProfile,
    followUser,
    unfollowUser,
    createTapestryComment,
    createTapestryLike,
    deleteTapestryLike,
    updateTapestryProfile
} from "@/lib/tapestry";
import { prisma } from "@/lib/prisma";

export const inngest = new Inngest({ id: "your-app-name" });

export const syncProfileToTapestry = inngest.createFunction(
  { id: "sync-profile-to-tapestry", retries: 3 }, // Automatically retry up to 3 times on failure
  { event: "profile/created" },
  async ({ event, step }) => {
    const { user } = event.data;

    await step.run("sync-to-tapestry", async () => {
      try {
        await createTapestryProfile({
            walletAddress: user.solanaWalletAddress,
            username: user.username,
            bio: user.bio,
            image: user.image,
        });

        // If successful, update the user's status in Prisma
        await prisma.user.update({
            where: { privyDid: user.privyDid },
            data: { syncStatus: "SYNCED" },
        });

      } catch (error) {
        // If it fails after all retries, mark it as failed
        await prisma.user.update({
            where: { privyDid: user.privyDid },
            data: { syncStatus: "FAILED" },
        });
        // We throw the error to ensure Inngest knows the step failed
        throw error;
      }
    });

    return { message: `Profile for ${user.username} synced successfully.` };
  }
);

// New job for updating a profile
export const updateProfileOnTapestry = inngest.createFunction(
  { id: "update-profile-on-tapestry", retries: 3 },
  { event: "profile/updated" },
  async ({ event, step }) => {
    const { username, dataToUpdate } = event.data;
    await step.run("update-on-tapestry", async () => {
        await updateTapestryProfile({ username, ...dataToUpdate });
    });
    return { message: "Profile updated on Tapestry." };
  }
);

// New job for following a user
export const followUserOnTapestry = inngest.createFunction(
  { id: "follow-user-on-tapestry", retries: 3 },
  { event: "user/followed" },
  async ({ event, step }) => {
    const { followerUsername, followeeUsername, followerId, followeeId } = event.data;
    await step.run("follow-on-tapestry", async () => {
      try {
        await followUser({ followerUsername, followeeUsername });
        await prisma.follow.update({
            where: { followerId_followingId: { followerId, followingId: followeeId } },
            data: { syncStatus: "SYNCED" },
        });
      } catch (error) {
        await prisma.follow.update({
            where: { followerId_followingId: { followerId, followingId: followeeId } },
            data: { syncStatus: "FAILED" },
        });
        throw error;
      }
    });
    return { message: "Follow action synced to Tapestry." };
  }
);

// New job for unfollowing a user
export const unfollowUserOnTapestry = inngest.createFunction(
  { id: "unfollow-user-on-tapestry", retries: 3 },
  { event: "user/unfollowed" },
  async ({ event, step }) => {
    const { followerUsername, followeeUsername } = event.data;
    await step.run("unfollow-on-tapestry", async () => {
        await unfollowUser({ followerUsername, followeeUsername });
    });
    return { message: "Unfollow action synced to Tapestry." };
  }
);

// New job for creating a comment
export const createCommentOnTapestry = inngest.createFunction(
  { id: "create-comment-on-tapestry", retries: 3 },
  { event: "comment/created" },
  async ({ event, step }) => {
    const { commentData, authorUsername, profileUsername } = event.data;
    await step.run("create-comment-on-tapestry", async () => {
      try {
        const tapestryComment = await createTapestryComment({ authorUsername, targetUsername: profileUsername, text: commentData.text });
        const tapestryId = (tapestryComment as any)?.comment?.id;
        // Update the local comment with the ID from Tapestry
        await prisma.comment.update({
            where: { id: commentData.id },
            data: { 
                tapestryCommentId: tapestryId,
                syncStatus: "SYNCED"
            },
        });
      } catch(error) {
        await prisma.comment.update({
            where: { id: commentData.id },
            data: { syncStatus: "FAILED" },
        });
        throw error;
      }
    });
    return { message: "Comment synced to Tapestry." };
  }
);

// New job for liking a comment
export const likeCommentOnTapestry = inngest.createFunction(
  { id: "like-comment-on-tapestry", retries: 3 },
  { event: "comment/liked" },
  async ({ event, step }) => {
    const { username, tapestryCommentId, likeId } = event.data;
    await step.run("like-on-tapestry", async () => {
        try {
            await createTapestryLike({ username, tapestryCommentId });
            await prisma.like.update({
                where: { id: likeId },
                data: { syncStatus: "SYNCED" },
            });
        } catch (error) {
            await prisma.like.update({
                where: { id: likeId },
                data: { syncStatus: "FAILED" },
            });
            throw error;
        }
    });
    return { message: "Like synced to Tapestry." };
  }
);

// New job for unliking a comment
export const unlikeCommentOnTapestry = inngest.createFunction(
  { id: "unlike-comment-on-tapestry", retries: 3 },
  { event: "comment/unliked" },
  async ({ event, step }) => {
    const { username, tapestryCommentId } = event.data;
    await step.run("unlike-on-tapestry", async () => {
        await deleteTapestryLike({ username, tapestryCommentId });
    });
    return { message: "Unlike synced to Tapestry." };
  }
); 