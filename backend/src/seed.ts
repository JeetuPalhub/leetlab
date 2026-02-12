import { db } from './libs/db.js';
import bcrypt from 'bcryptjs';
import { Difficulty } from '@prisma/client';

// Sample problems to seed the database
const sampleProblems: Array<{
    title: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    examples: Record<string, { input: string; output: string; explanation: string }>;
    constraints: string;
    testCases: Array<{ input: string; output: string }>;
    codeSnippets: Record<string, string>;
    referenceSolutions: Record<string, string>;
}> = [
        {
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            difficulty: "EASY",
            tags: ["Array", "Hash Table"],
            examples: {
                javascript: {
                    input: "nums = [2,7,11,15], target = 9",
                    output: "[0,1]",
                    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
                }
            },
            constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
            testCases: [
                { input: "[2,7,11,15]\n9", output: "[0,1]" },
                { input: "[3,2,4]\n6", output: "[1,2]" },
                { input: "[3,3]\n6", output: "[0,1]" }
            ],
            codeSnippets: {
                javascript: `function twoSum(nums, target) {
  // Your code here
  
}`,
                python: `def twoSum(nums, target):
    # Your code here
    pass`,
                java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`
            },
            referenceSolutions: {
                javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
            }
        },
        {
            title: "Reverse String",
            description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
            difficulty: "EASY",
            tags: ["Two Pointers", "String"],
            examples: {
                javascript: {
                    input: 's = ["h","e","l","l","o"]',
                    output: '["o","l","l","e","h"]',
                    explanation: "The string is reversed in place."
                }
            },
            constraints: "1 <= s.length <= 10^5, s[i] is a printable ascii character",
            testCases: [
                { input: "hello", output: "olleh" },
                { input: "world", output: "dlrow" },
                { input: "a", output: "a" }
            ],
            codeSnippets: {
                javascript: `function reverseString(s) {
  // Your code here
  
}`,
                python: `def reverseString(s):
    # Your code here
    pass`,
                java: `class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
}`
            },
            referenceSolutions: {
                javascript: `function reverseString(s) {
  return s.split('').reverse().join('');
}`
            }
        },
        {
            title: "Palindrome Number",
            description: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
            difficulty: "EASY",
            tags: ["Math"],
            examples: {
                javascript: {
                    input: "x = 121",
                    output: "true",
                    explanation: "121 reads as 121 from left to right and from right to left."
                }
            },
            constraints: "-2^31 <= x <= 2^31 - 1",
            testCases: [
                { input: "121", output: "true" },
                { input: "-121", output: "false" },
                { input: "10", output: "false" }
            ],
            codeSnippets: {
                javascript: `function isPalindrome(x) {
  // Your code here
  
}`,
                python: `def isPalindrome(x):
    # Your code here
    pass`,
                java: `class Solution {
    public boolean isPalindrome(int x) {
        // Your code here
        return false;
    }
}`
            },
            referenceSolutions: {
                javascript: `function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}`
            }
        },
        {
            title: "FizzBuzz",
            description: "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, answer[i] == 'Fizz' if i is divisible by 3, answer[i] == 'Buzz' if i is divisible by 5, answer[i] == i (as a string) if none of the above conditions are true.",
            difficulty: "EASY",
            tags: ["Math", "String", "Simulation"],
            examples: {
                javascript: {
                    input: "n = 15",
                    output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
                    explanation: "Classic FizzBuzz problem"
                }
            },
            constraints: "1 <= n <= 10^4",
            testCases: [
                { input: "3", output: '["1","2","Fizz"]' },
                { input: "5", output: '["1","2","Fizz","4","Buzz"]' },
                { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
            ],
            codeSnippets: {
                javascript: `function fizzBuzz(n) {
  // Your code here
  
}`,
                python: `def fizzBuzz(n):
    # Your code here
    pass`,
                java: `class Solution {
    public List<String> fizzBuzz(int n) {
        // Your code here
        return new ArrayList<>();
    }
}`
            },
            referenceSolutions: {
                javascript: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i.toString());
  }
  return result;
}`
            }
        },
        {
            title: "Valid Parentheses",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, Open brackets must be closed in the correct order, Every close bracket has a corresponding open bracket of the same type.",
            difficulty: "MEDIUM",
            tags: ["String", "Stack"],
            examples: {
                javascript: {
                    input: 's = "()"',
                    output: "true",
                    explanation: "The parentheses are properly closed."
                }
            },
            constraints: "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'",
            testCases: [
                { input: "()", output: "true" },
                { input: "()[]{}", output: "true" },
                { input: "(]", output: "false" }
            ],
            codeSnippets: {
                javascript: `function isValid(s) {
  // Your code here
  
}`,
                python: `def isValid(s):
    # Your code here
    pass`,
                java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`
            },
            referenceSolutions: {
                javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`
            }
        }
    ];

async function seed() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Check if admin user exists, if not create one
        let adminUser = await db.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!adminUser) {
            console.log('Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = await db.user.create({
                data: {
                    name: 'Admin',
                    email: 'admin@leetlab.com',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
            console.log('✅ Admin user created: admin@leetlab.com / admin123\n');
        } else {
            console.log('✅ Admin user already exists\n');
        }

        // Check if test user exists, if not create one
        let testUser = await db.user.findFirst({
            where: { email: 'test@example.com' }
        });

        if (!testUser) {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('test123', 10);
            testUser = await db.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: hashedPassword,
                    role: 'USER'
                }
            });
            console.log('✅ Test user created: test@example.com / test123\n');
        } else {
            console.log('✅ Test user already exists\n');
        }

        // Check existing problems
        const existingProblems = await db.problem.count();
        console.log(`📊 Current problems in database: ${existingProblems}\n`);

        if (existingProblems === 0) {
            console.log('Adding sample problems...\n');

            for (const problem of sampleProblems) {
                const created = await db.problem.create({
                    data: {
                        ...problem,
                        userId: adminUser.id
                    }
                });
                console.log(`✅ Created: ${created.title} (${created.difficulty})`);
            }

            console.log(`\n🎉 Added ${sampleProblems.length} sample problems!`);
        } else {
            console.log('⏭️ Problems already exist, skipping seed...');
        }

        console.log('\n✨ Seed completed successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin: admin@leetlab.com / admin123');
        console.log('   User:  test@example.com / test123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await db.$disconnect();
    }
}

seed();
