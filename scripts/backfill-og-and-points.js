import { PrismaClient, PointActionType } from '../src/generated/prisma';
import { isOGUser } from '../src/utils/og-user';
import { POINT_VALUES } from '../src/models/points.models';
const prisma = new PrismaClient();
async function backfillOgAndPoints() {
    console.log('🚀 Starting backfill process for OG status and retroactive points...');
    try {
        const users = await prisma.user.findMany({
            include: {
                authoredComments: true,
                likes: true,
                followers: true,
                following: true,
                pointTransactions: true,
            },
        });
        console.log(`👥 Found ${users.length} users to process.`);
        for (const user of users) {
            // Step 1: Determine and update OG status
            const ogCheck = isOGUser(user.username, user.createdAt, user.privyDid);
            if (ogCheck.isOG && !user.isOG) {
                await prisma.user.update({
                    where: { privyDid: user.privyDid },
                    data: {
                        isOG: true,
                        ogReason: ogCheck.reason,
                    },
                });
                console.log(`👑 User ${user.username} has been marked as OG. Reason: ${ogCheck.reason}`);
            }
            // Step 2: Calculate retroactive points
            let retroactivePoints = 0;
            const pointActions = [];
            // Profile creation
            pointActions.push({ action: PointActionType.PROFILE_CREATION, count: 1 });
            // Comments
            pointActions.push({ action: PointActionType.COMMENT_CREATED, count: user.authoredComments.length });
            // Likes
            pointActions.push({ action: PointActionType.LIKE_GIVEN, count: user.likes.length });
            // Follows
            pointActions.push({ action: PointActionType.FOLLOW_USER, count: user.following.length });
            for (const action of pointActions) {
                if (action.count > 0) {
                    retroactivePoints += (POINT_VALUES[action.action]?.points || 0) * action.count;
                }
            }
            // For simplicity, we are not calculating daily login or streaks retroactively,
            // as it would be complex and computationally expensive. We are focusing on activity-based points.
            // Update user's total points if the new calculation is higher
            if (retroactivePoints > user.totalPoints) {
                await prisma.user.update({
                    where: { privyDid: user.privyDid },
                    data: {
                        totalPoints: retroactivePoints,
                    },
                });
                console.log(`💰 Retroactively updated points for ${user.username} to ${retroactivePoints}.`);
            }
        }
        console.log('✅ Backfill process completed successfully!');
    }
    catch (error) {
        console.error('💥 An error occurred during the backfill process:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
backfillOgAndPoints();
