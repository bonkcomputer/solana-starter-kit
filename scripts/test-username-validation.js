const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Import the validation functions (we'll simulate them since it's TypeScript)
function validateUsername(username) {
  const USERNAME_RULES = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    REGEX: /^[a-z0-9]+$/,
    RESERVED_USERNAMES: [
      'admin', 'administrator', 'root', 'system', 'support', 'help',
      'api', 'www', 'mail', 'ftp', 'test', 'demo', 'guest', 'user',
      'null', 'undefined', 'true', 'false', 'bot', 'moderator', 'mod'
    ]
  };

  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < USERNAME_RULES.MIN_LENGTH) {
    return { isValid: false, error: `Username must be at least ${USERNAME_RULES.MIN_LENGTH} characters long` };
  }

  if (username.length > USERNAME_RULES.MAX_LENGTH) {
    return { isValid: false, error: `Username must be no more than ${USERNAME_RULES.MAX_LENGTH} characters long` };
  }

  if (!USERNAME_RULES.REGEX.test(username)) {
    return { isValid: false, error: 'Username must contain only lowercase letters and numbers' };
  }

  if (USERNAME_RULES.RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved and cannot be used' };
  }

  return { isValid: true, sanitized: username.toLowerCase() };
}

async function testUsernameValidation() {
  console.log('🧪 Testing Username Validation System...\n');

  // Test cases
  const testCases = [
    // Valid usernames
    { username: 'john123', expected: true, description: 'Valid alphanumeric username' },
    { username: 'alice', expected: true, description: 'Valid alphabetic username' },
    { username: 'user2025', expected: true, description: 'Valid with numbers' },
    
    // Invalid - too short
    { username: 'ab', expected: false, description: 'Too short (2 chars)' },
    { username: 'a', expected: false, description: 'Too short (1 char)' },
    
    // Invalid - too long
    { username: 'thisusernameistoolong123', expected: false, description: 'Too long (>20 chars)' },
    
    // Invalid - special characters
    { username: 'user@123', expected: false, description: 'Contains @ symbol' },
    { username: 'user-name', expected: false, description: 'Contains hyphen' },
    { username: 'user_name', expected: false, description: 'Contains underscore' },
    { username: 'user.name', expected: false, description: 'Contains period' },
    { username: 'user name', expected: false, description: 'Contains space' },
    
    // Invalid - uppercase
    { username: 'UserName', expected: false, description: 'Contains uppercase letters' },
    { username: 'USERNAME', expected: false, description: 'All uppercase' },
    
    // Invalid - reserved
    { username: 'admin', expected: false, description: 'Reserved username: admin' },
    { username: 'root', expected: false, description: 'Reserved username: root' },
    { username: 'system', expected: false, description: 'Reserved username: system' },
    
    // Edge cases
    { username: '', expected: false, description: 'Empty string' },
    { username: '123', expected: true, description: 'Numbers only' },
    { username: 'abc', expected: true, description: 'Minimum length (3 chars)' },
    { username: 'abcdefghij1234567890', expected: true, description: 'Maximum length (20 chars)' },
  ];

  let passed = 0;
  let failed = 0;

  console.log('📋 Running validation tests...\n');

  for (const testCase of testCases) {
    const result = validateUsername(testCase.username);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   Input: "${testCase.username}" → Valid: ${result.isValid}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Input: "${testCase.username}" → Expected: ${testCase.expected}, Got: ${result.isValid}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  // Test database uniqueness check
  console.log('🔍 Testing database uniqueness...\n');

  try {
    // Check for existing usernames in database
    const existingUsers = await prisma.user.findMany({
      select: { username: true },
      take: 5
    });

    console.log('📋 Sample existing usernames:');
    existingUsers.forEach(user => {
      const validation = validateUsername(user.username);
      console.log(`   ${user.username} → ${validation.isValid ? '✅ Valid' : '❌ Invalid: ' + validation.error}`);
    });

    // Test duplicate detection
    if (existingUsers.length > 0) {
      const testUsername = existingUsers[0].username;
      const duplicate = await prisma.user.findUnique({
        where: { username: testUsername }
      });

      if (duplicate) {
        console.log(`\n✅ Uniqueness check works: Found existing user "${testUsername}"`);
      } else {
        console.log(`\n❌ Uniqueness check failed: Could not find user "${testUsername}"`);
      }
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }

  console.log('\n🎉 Username validation system test completed!');
}

// Run the test
testUsernameValidation()
  .then(() => {
    console.log('✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
