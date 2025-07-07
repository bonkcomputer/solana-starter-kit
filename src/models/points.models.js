// Points System Models and Types
import { PointActionType, AchievementCategory } from '../generated/prisma';
// Re-export enums for use in other modules
export { PointActionType, AchievementCategory };
// Enums are imported from Prisma client
// Point values configuration
export const POINT_VALUES = {
    [PointActionType.PROFILE_CREATION]: {
        actionType: PointActionType.PROFILE_CREATION,
        points: 100,
        description: 'Welcome! Profile created',
        dailyLimit: 1
    },
    [PointActionType.DAILY_LOGIN]: {
        actionType: PointActionType.DAILY_LOGIN,
        points: 10,
        description: 'Daily login bonus',
        dailyLimit: 1
    },
    [PointActionType.STREAK_BONUS]: {
        actionType: PointActionType.STREAK_BONUS,
        points: 20,
        description: 'Login streak bonus',
        dailyLimit: 1
    },
    [PointActionType.COMMENT_CREATED]: {
        actionType: PointActionType.COMMENT_CREATED,
        points: 5,
        description: 'Created a comment',
        dailyLimit: 20
    },
    [PointActionType.LIKE_GIVEN]: {
        actionType: PointActionType.LIKE_GIVEN,
        points: 2,
        description: 'Liked a comment',
        dailyLimit: 50
    },
    [PointActionType.FOLLOW_USER]: {
        actionType: PointActionType.FOLLOW_USER,
        points: 3,
        description: 'Followed a user',
        dailyLimit: 25
    },
    [PointActionType.TRADE_COMPLETED]: {
        actionType: PointActionType.TRADE_COMPLETED,
        points: 25,
        description: 'Completed a trade',
        dailyLimit: 100
    },
    [PointActionType.REFERRAL_BONUS]: {
        actionType: PointActionType.REFERRAL_BONUS,
        points: 500,
        description: 'Referral bonus',
        dailyLimit: 10
    },
    [PointActionType.PROFILE_UPDATE]: {
        actionType: PointActionType.PROFILE_UPDATE,
        points: 10,
        description: 'Updated profile',
        dailyLimit: 5
    },
    [PointActionType.PORTFOLIO_VIEW]: {
        actionType: PointActionType.PORTFOLIO_VIEW,
        points: 1,
        description: 'Viewed portfolio',
        dailyLimit: 1
    },
    [PointActionType.ACHIEVEMENT_UNLOCKED]: {
        actionType: PointActionType.ACHIEVEMENT_UNLOCKED,
        points: 0, // Points are defined by the achievement itself
        description: 'Achievement unlocked'
    },
    [PointActionType.ADMIN_ADJUSTMENT]: {
        actionType: PointActionType.ADMIN_ADJUSTMENT,
        points: 0, // Variable
        description: 'Admin adjustment'
    }
};
// Streak multipliers
export const STREAK_MULTIPLIERS = {
    7: 1.5, // 7 days = 1.5x
    14: 2.0, // 14 days = 2x
    30: 2.5, // 30 days = 2.5x
    60: 3.0, // 60 days = 3x
    100: 4.0 // 100 days = 4x
};
// Default achievements
export const DEFAULT_ACHIEVEMENTS = [
    {
        name: 'First Steps',
        description: 'Create your first profile',
        icon: '🎯',
        pointsReward: 50,
        category: AchievementCategory.MILESTONE,
        requirement: { action: PointActionType.PROFILE_CREATION, count: 1 }
    },
    {
        name: 'Social Butterfly',
        description: 'Follow 10 users',
        icon: '🦋',
        pointsReward: 100,
        category: AchievementCategory.SOCIAL,
        requirement: { action: PointActionType.FOLLOW_USER, count: 10 }
    },
    {
        name: 'Conversation Starter',
        description: 'Create 25 comments',
        icon: '💬',
        pointsReward: 150,
        category: AchievementCategory.SOCIAL,
        requirement: { action: PointActionType.COMMENT_CREATED, count: 25 }
    },
    {
        name: 'Trader',
        description: 'Complete 10 trades',
        icon: '📈',
        pointsReward: 250,
        category: AchievementCategory.TRADING,
        requirement: { action: PointActionType.TRADE_COMPLETED, count: 10 }
    },
    {
        name: 'Day Trader',
        description: 'Complete 50 trades',
        icon: '🚀',
        pointsReward: 500,
        category: AchievementCategory.TRADING,
        requirement: { action: PointActionType.TRADE_COMPLETED, count: 50 }
    },
    {
        name: 'Whale',
        description: 'Complete 100 trades',
        icon: '🐋',
        pointsReward: 1000,
        category: AchievementCategory.TRADING,
        requirement: { action: PointActionType.TRADE_COMPLETED, count: 100 }
    },
    {
        name: 'Loyal User',
        description: 'Maintain a 7-day login streak',
        icon: '🔥',
        pointsReward: 200,
        category: AchievementCategory.ENGAGEMENT,
        requirement: { streak: 7 }
    },
    {
        name: 'Dedicated User',
        description: 'Maintain a 30-day login streak',
        icon: '💎',
        pointsReward: 750,
        category: AchievementCategory.ENGAGEMENT,
        requirement: { streak: 30 }
    },
    {
        name: 'Referral Champion',
        description: 'Refer 5 users',
        icon: '👑',
        pointsReward: 1000,
        category: AchievementCategory.REFERRAL,
        requirement: { referrals: 5 }
    },
    {
        name: 'Millionaire',
        description: 'Earn 1,000,000 points',
        icon: '💰',
        pointsReward: 10000,
        category: AchievementCategory.MILESTONE,
        requirement: { totalPoints: 1000000 }
    }
];
