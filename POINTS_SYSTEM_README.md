# Points System Implementation

A comprehensive gamification system that rewards users for various actions throughout the Solana starter kit application.

## Overview

The points system is designed to encourage user engagement by rewarding points for desirable actions such as:
- Creating profiles
- Daily logins with streak bonuses
- Social interactions (comments, likes, follows)
- Trading activities
- Referral participation

## Features

### Core Functionality
- **Point Awarding**: Automatic point distribution for user actions
- **Streak System**: Daily login streaks with multipliers up to 4x
- **Daily Limits**: Prevents abuse with action-specific daily caps
- **Achievement System**: 10 default achievements across 6 categories
- **Referral System**: Unique referral codes with bonus points
- **Leaderboards**: Global rankings with time period filters

### Point Values
| Action | Base Points | Daily Limit | Notes |
|--------|-------------|-------------|-------|
| Profile Creation | 100 | 1 | One-time bonus |
| Daily Login | 10 | 1 | Streak multipliers apply |
| Comment | 5 | 20 | Max 100 points/day |
| Like | 2 | 50 | Max 100 points/day |
| Follow | 3 | 10 | Max 30 points/day |
| Trade | 25 | 20 | Max 500 points/day |
| Referral (Referrer) | 500 | 5 | Max 2500 points/day |
| Referral (Referee) | 250 | 1 | One-time bonus |

### Streak Multipliers
- 7+ days: 1.5x multiplier
- 14+ days: 2x multiplier
- 30+ days: 2.5x multiplier
- 60+ days: 3x multiplier
- 100+ days: 4x multiplier

## Architecture

### Database Schema

#### Core Tables
- **User**: Extended with points fields (totalPoints, currentStreak, longestStreak, etc.)
- **PointTransaction**: Records all point awards and deductions
- **Achievement**: Defines available achievements
- **UserAchievement**: Tracks user achievement progress
- **DailyPointsLog**: Tracks daily point limits per action type

#### Key Enums
- **PointActionType**: PROFILE_CREATION, DAILY_LOGIN, COMMENT, LIKE, FOLLOW, TRADE, REFERRAL
- **AchievementCategory**: SOCIAL, TRADING, STREAKS, MILESTONES, REFERRALS, SPECIAL

### File Structure

```
src/
├── models/
│   └── points.models.ts           # TypeScript interfaces and constants
├── services/
│   └── points.ts                  # Core points logic and database operations
├── app/api/points/
│   ├── award/route.ts            # Award points endpoint
│   ├── user/route.ts             # Get user points info
│   ├── history/route.ts          # Point transaction history
│   ├── leaderboard/route.ts      # Leaderboard data
│   ├── referrals/route.ts        # Referral management
│   ├── achievements/route.ts     # Achievement data
│   └── init/route.ts             # Initialize default achievements
├── components/points/
│   ├── hooks/
│   │   ├── use-points.ts         # Points management hooks
│   │   ├── use-leaderboard.ts    # Leaderboard data hook
│   │   ├── use-referrals.ts      # Referral management hook
│   │   └── use-achievements.ts   # Achievement hooks
│   └── ui/
│       ├── points-display.tsx    # Points display component (4 variants)
│       ├── leaderboard.tsx       # Leaderboard component
│       └── referral-card.tsx     # Referral management card
├── app/points/
│   └── page.tsx                  # Comprehensive points dashboard
└── scripts/
    ├── init-achievements.ts      # Initialize default achievements
    └── test-points.ts           # Test points system functionality
```

## API Endpoints

### POST /api/points/award
Awards points for a specific action.

**Request Body:**
```json
{
  "walletAddress": "string",
  "actionType": "PROFILE_CREATION | DAILY_LOGIN | COMMENT | LIKE | FOLLOW | TRADE | REFERRAL",
  "referralCode": "string (optional, for profile creation)"
}
```

**Response:**
```json
{
  "success": true,
  "pointsAwarded": 25,
  "totalPoints": 450,
  "streak": 5,
  "multiplier": 1.5,
  "achievementsUnlocked": ["first_trade"],
  "message": "Trade completed! +25 points"
}
```

### GET /api/points/user?walletAddress=string
Retrieves comprehensive user points information.

**Response:**
```json
{
  "totalPoints": 1250,
  "currentStreak": 7,
  "longestStreak": 15,
  "rank": 23,
  "referralCode": "USER123",
  "referralCount": 3,
  "achievementCount": 5
}
```

### GET /api/points/history?walletAddress=string&page=1&limit=20
Retrieves paginated point transaction history.

### GET /api/points/leaderboard?period=all&limit=50
Retrieves leaderboard data with optional time period filtering.

### GET /api/points/referrals?walletAddress=string
Retrieves referral statistics and referral list.

### GET /api/points/achievements?walletAddress=string
Retrieves user achievements and available achievements.

### POST /api/points/init
Initializes default achievements (development only).

## React Hooks

### useUserPoints(walletAddress)
Fetches and manages user points data with SWR caching.

```typescript
const { points, loading, error, mutate } = useUserPoints(walletAddress)
```

### useAwardPoints()
Provides a function to award points with error handling.

```typescript
const { awardPoints, isAwarding } = useAwardPoints()
await awardPoints(walletAddress, 'TRADE')
```

### useAutoAwardPoints(walletAddress)
Automatically awards daily login points and shows toast notifications.

```typescript
useAutoAwardPoints(walletAddress) // Call in main app component
```

### usePointsHistory(walletAddress, page, limit)
Retrieves paginated point transaction history.

### useLeaderboard(period, limit)
Fetches leaderboard data with time period filtering.

### useReferrals(walletAddress)
Manages referral data and statistics.

### useUserAchievements(walletAddress) & useAllAchievements()
Handle achievement data and progress tracking.

## UI Components

### PointsDisplay
Versatile component with 4 display variants:
- **header**: Compact display for navigation bar
- **profile**: Detailed display for profile pages
- **compact**: Small format for cards
- **detailed**: Full information display

```typescript
<PointsDisplay 
  walletAddress={address} 
  variant="header" 
  showRank={true}
  showStreak={true}
/>
```

### Leaderboard
Complete leaderboard with period tabs and user highlighting.

```typescript
<Leaderboard 
  currentUserAddress={address}
  defaultPeriod="week"
  limit={50}
/>
```

### ReferralCard
Referral management with link sharing and statistics.

```typescript
<ReferralCard walletAddress={address} />
```

## Integration Points

### Profile Creation
Points are awarded when users create profiles through `/api/profiles/create`.

### Social Actions
- Comments: Points awarded in `/api/comments` route
- Likes: Points awarded in `/api/likes` route  
- Follows: Points awarded in `/api/followers/add` route

### Trading
Points are awarded in the Jupiter swap hook (`useJupiterSwap`) when transactions are successfully confirmed.

### Daily Login
Automatic point awarding happens via `useAutoAwardPoints` hook called in the main application layout.

## Default Achievements

### Social Category
- **First Comment**: Post your first comment (1 comment)
- **Social Butterfly**: Post 50 comments (50 comments)
- **Like Machine**: Give 100 likes (100 likes)

### Trading Category
- **First Trade**: Complete your first trade (1 trade)
- **Active Trader**: Complete 10 trades (10 trades)
- **Trading Pro**: Complete 100 trades (100 trades)

### Streaks Category
- **Week Warrior**: Maintain a 7-day login streak (7 days)
- **Month Master**: Maintain a 30-day login streak (30 days)

### Milestones Category
- **Point Collector**: Earn 1,000 total points (1,000 points)

### Referrals Category
- **Referral Champion**: Refer 5 users (5 referrals)

## Configuration

### Point Values
Configured in `src/models/points.models.ts` in the `POINT_VALUES` constant.

### Daily Limits
Configured in `src/models/points.models.ts` in the `DAILY_LIMITS` constant.

### Streak Multipliers
Configured in `src/models/points.models.ts` in the `STREAK_MULTIPLIERS` constant.

### Default Achievements
Defined in `src/models/points.models.ts` in the `DEFAULT_ACHIEVEMENTS` constant.

## Development & Testing

### Initialize Achievements
```bash
npx tsx src/scripts/init-achievements.ts
```

### Test Points System
```bash
npx tsx src/scripts/test-points.ts
```

### API Testing
Use the `/api/points/init` endpoint to initialize achievements in development.

## Error Handling

The points system is designed to fail gracefully:
- Point awarding failures don't break main application functionality
- API endpoints return appropriate error codes and messages
- React hooks handle loading and error states
- Database operations are wrapped in try-catch blocks

## Performance Considerations

- **SWR Caching**: All data fetching uses SWR for efficient caching
- **Database Indexing**: Proper indexes on frequently queried fields
- **Daily Limits**: Prevents excessive database writes
- **Batch Operations**: Efficient queries for leaderboards and history
- **Error Boundaries**: Prevent points system issues from crashing the app

## Security Features

- **Daily Limits**: Prevents point farming and abuse
- **Server-side Validation**: All point awarding happens server-side
- **Input Sanitization**: Wallet addresses and action types are validated
- **Rate Limiting**: API endpoints can be extended with rate limiting

## Future Enhancements

- **Point Redemption**: Allow users to spend points on features
- **Seasonal Events**: Temporary achievement and bonus point periods
- **Team Competitions**: Group-based competitions and leaderboards
- **NFT Rewards**: Mint special NFTs for achievement milestones
- **Advanced Analytics**: Detailed user engagement analytics
- **Push Notifications**: Notify users of point awards and achievements

## Migration Guide

If upgrading from a version without the points system:

1. Run the Prisma migration: `npx prisma migrate dev`
2. Initialize achievements: Call `/api/points/init` or run the script
3. Update existing user profiles to include referral codes if needed
4. Test the system with the provided test script

## Support

For issues or questions about the points system:
- Check the API endpoint responses for error details
- Review the browser console for client-side errors
- Use the test scripts to verify system functionality
- Check database constraints and foreign key relationships 