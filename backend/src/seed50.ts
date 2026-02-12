import { db } from './libs/db.js';
import { Difficulty } from '@prisma/client';

// 50 LeetCode-style problems
const problems = [
    { title: "Two Sum", difficulty: "EASY", tags: ["Array", "Hash Table"], desc: "Find two numbers that add up to target.", testCases: [{ input: "[2,7,11,15]\n9", output: "[0,1]" }] },
    { title: "Reverse String", difficulty: "EASY", tags: ["String"], desc: "Reverse a string in-place.", testCases: [{ input: "hello", output: "olleh" }] },
    { title: "Palindrome Number", difficulty: "EASY", tags: ["Math"], desc: "Check if number is palindrome.", testCases: [{ input: "121", output: "true" }] },
    { title: "FizzBuzz", difficulty: "EASY", tags: ["Math"], desc: "Print Fizz, Buzz, or FizzBuzz.", testCases: [{ input: "15", output: "FizzBuzz" }] },
    { title: "Valid Parentheses", difficulty: "MEDIUM", tags: ["Stack"], desc: "Check if brackets are balanced.", testCases: [{ input: "()", output: "true" }] },
    { title: "Merge Two Sorted Lists", difficulty: "EASY", tags: ["LinkedList"], desc: "Merge two sorted linked lists.", testCases: [{ input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]" }] },
    { title: "Maximum Subarray", difficulty: "MEDIUM", tags: ["Array", "DP"], desc: "Find contiguous subarray with max sum.", testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }] },
    { title: "Climbing Stairs", difficulty: "EASY", tags: ["DP"], desc: "Count ways to climb n stairs.", testCases: [{ input: "3", output: "3" }] },
    { title: "Best Time to Buy Stock", difficulty: "EASY", tags: ["Array"], desc: "Maximize profit from stock.", testCases: [{ input: "[7,1,5,3,6,4]", output: "5" }] },
    { title: "Contains Duplicate", difficulty: "EASY", tags: ["Array", "Hash Table"], desc: "Check if array has duplicates.", testCases: [{ input: "[1,2,3,1]", output: "true" }] },
    { title: "Single Number", difficulty: "EASY", tags: ["Bit Manipulation"], desc: "Find element appearing once.", testCases: [{ input: "[2,2,1]", output: "1" }] },
    { title: "Linked List Cycle", difficulty: "EASY", tags: ["LinkedList"], desc: "Detect cycle in linked list.", testCases: [{ input: "[3,2,0,-4]", output: "true" }] },
    { title: "Min Stack", difficulty: "MEDIUM", tags: ["Stack"], desc: "Stack with getMin in O(1).", testCases: [{ input: "push(-2),push(0),getMin", output: "-2" }] },
    { title: "Intersection of Arrays", difficulty: "EASY", tags: ["Hash Table"], desc: "Find common elements.", testCases: [{ input: "[1,2,2,1]\n[2,2]", output: "[2]" }] },
    { title: "Move Zeroes", difficulty: "EASY", tags: ["Array"], desc: "Move all zeroes to end.", testCases: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }] },
    { title: "Power of Two", difficulty: "EASY", tags: ["Math", "Bit"], desc: "Check if n is power of 2.", testCases: [{ input: "16", output: "true" }] },
    { title: "Valid Anagram", difficulty: "EASY", tags: ["String", "Hash Table"], desc: "Check if two strings are anagrams.", testCases: [{ input: "anagram\nnagaram", output: "true" }] },
    { title: "Binary Search", difficulty: "EASY", tags: ["Binary Search"], desc: "Find target in sorted array.", testCases: [{ input: "[-1,0,3,5,9,12]\n9", output: "4" }] },
    { title: "First Bad Version", difficulty: "EASY", tags: ["Binary Search"], desc: "Find first bad version.", testCases: [{ input: "5\n4", output: "4" }] },
    { title: "Ransom Note", difficulty: "EASY", tags: ["Hash Table"], desc: "Check if note can be built.", testCases: [{ input: "aa\naab", output: "true" }] },
    { title: "Plus One", difficulty: "EASY", tags: ["Array", "Math"], desc: "Add one to number as array.", testCases: [{ input: "[1,2,3]", output: "[1,2,4]" }] },
    { title: "Sqrt(x)", difficulty: "EASY", tags: ["Math", "Binary Search"], desc: "Compute square root.", testCases: [{ input: "8", output: "2" }] },
    { title: "Merge Sorted Array", difficulty: "EASY", tags: ["Array"], desc: "Merge nums2 into nums1.", testCases: [{ input: "[1,2,3,0,0,0]\n[2,5,6]", output: "[1,2,2,3,5,6]" }] },
    { title: "Roman to Integer", difficulty: "EASY", tags: ["String", "Hash Table"], desc: "Convert Roman numeral to int.", testCases: [{ input: "III", output: "3" }] },
    { title: "Length of Last Word", difficulty: "EASY", tags: ["String"], desc: "Return length of last word.", testCases: [{ input: "Hello World", output: "5" }] },
    { title: "Add Binary", difficulty: "EASY", tags: ["String", "Math"], desc: "Add two binary strings.", testCases: [{ input: "11\n1", output: "100" }] },
    { title: "Remove Duplicates", difficulty: "EASY", tags: ["Array"], desc: "Remove duplicates in-place.", testCases: [{ input: "[1,1,2]", output: "2" }] },
    { title: "Search Insert Position", difficulty: "EASY", tags: ["Binary Search"], desc: "Find insert position.", testCases: [{ input: "[1,3,5,6]\n5", output: "2" }] },
    { title: "Longest Common Prefix", difficulty: "EASY", tags: ["String"], desc: "Find longest common prefix.", testCases: [{ input: '["flower","flow","flight"]', output: "fl" }] },
    { title: "Valid Palindrome", difficulty: "EASY", tags: ["String"], desc: "Check if string is palindrome.", testCases: [{ input: "A man a plan a canal Panama", output: "true" }] },
    { title: "Reverse Linked List", difficulty: "EASY", tags: ["LinkedList"], desc: "Reverse a linked list.", testCases: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" }] },
    { title: "Middle of Linked List", difficulty: "EASY", tags: ["LinkedList"], desc: "Find middle node.", testCases: [{ input: "[1,2,3,4,5]", output: "[3,4,5]" }] },
    { title: "Maximum Depth of Binary Tree", difficulty: "EASY", tags: ["Tree", "DFS"], desc: "Find max depth of tree.", testCases: [{ input: "[3,9,20,null,null,15,7]", output: "3" }] },
    { title: "Invert Binary Tree", difficulty: "EASY", tags: ["Tree"], desc: "Invert a binary tree.", testCases: [{ input: "[4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }] },
    { title: "Symmetric Tree", difficulty: "EASY", tags: ["Tree"], desc: "Check if tree is symmetric.", testCases: [{ input: "[1,2,2,3,4,4,3]", output: "true" }] },
    { title: "Path Sum", difficulty: "EASY", tags: ["Tree", "DFS"], desc: "Check if root-to-leaf path equals sum.", testCases: [{ input: "[5,4,8,11,null,13,4]\n22", output: "true" }] },
    { title: "Count Primes", difficulty: "MEDIUM", tags: ["Math"], desc: "Count primes less than n.", testCases: [{ input: "10", output: "4" }] },
    { title: "3Sum", difficulty: "MEDIUM", tags: ["Array", "Two Pointers"], desc: "Find triplets summing to zero.", testCases: [{ input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }] },
    { title: "Container With Most Water", difficulty: "MEDIUM", tags: ["Array", "Two Pointers"], desc: "Find max water container.", testCases: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49" }] },
    { title: "Longest Substring Without Repeating", difficulty: "MEDIUM", tags: ["String", "Sliding Window"], desc: "Find longest unique substring.", testCases: [{ input: "abcabcbb", output: "3" }] },
    { title: "Group Anagrams", difficulty: "MEDIUM", tags: ["String", "Hash Table"], desc: "Group anagrams together.", testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }] },
    { title: "Product of Array Except Self", difficulty: "MEDIUM", tags: ["Array"], desc: "Product without self.", testCases: [{ input: "[1,2,3,4]", output: "[24,12,8,6]" }] },
    { title: "Rotate Image", difficulty: "MEDIUM", tags: ["Array", "Matrix"], desc: "Rotate matrix 90 degrees.", testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" }] },
    { title: "Spiral Matrix", difficulty: "MEDIUM", tags: ["Array", "Matrix"], desc: "Traverse matrix in spiral.", testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" }] },
    { title: "Set Matrix Zeroes", difficulty: "MEDIUM", tags: ["Array", "Matrix"], desc: "Set row/col to zero.", testCases: [{ input: "[[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" }] },
    { title: "Word Search", difficulty: "MEDIUM", tags: ["Backtracking"], desc: "Find word in grid.", testCases: [{ input: '[["A","B"],["C","D"]]\n"ABCD"', output: "false" }] },
    { title: "Jump Game", difficulty: "MEDIUM", tags: ["Array", "Greedy"], desc: "Can you reach last index?", testCases: [{ input: "[2,3,1,1,4]", output: "true" }] },
    { title: "Unique Paths", difficulty: "MEDIUM", tags: ["DP"], desc: "Count paths in grid.", testCases: [{ input: "3\n7", output: "28" }] },
    { title: "Coin Change", difficulty: "MEDIUM", tags: ["DP"], desc: "Min coins for amount.", testCases: [{ input: "[1,2,5]\n11", output: "3" }] },
    { title: "House Robber", difficulty: "MEDIUM", tags: ["DP"], desc: "Max money without adjacent.", testCases: [{ input: "[1,2,3,1]", output: "4" }] },
];

async function seed50() {
    console.log('🌱 Seeding 50 problems...\n');

    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.log('❌ No admin user found. Run initial seed first.');
        return;
    }

    let added = 0;
    for (const p of problems) {
        const exists = await db.problem.findFirst({ where: { title: p.title } });
        if (exists) continue;

        await db.problem.create({
            data: {
                title: p.title,
                description: p.desc,
                difficulty: p.difficulty as Difficulty,
                tags: p.tags,
                constraints: "Standard constraints apply",
                testCases: p.testCases,
                examples: { javascript: { input: p.testCases[0].input, output: p.testCases[0].output, explanation: p.desc } },
                codeSnippets: { javascript: `// ${p.title}\nfunction solve() {\n  // Your code here\n}`, python: `# ${p.title}\ndef solve():\n    pass` },
                referenceSolutions: { javascript: `// Solution for ${p.title}` },
                userId: admin.id
            }
        });
        added++;
        console.log(`✅ ${p.title}`);
    }

    console.log(`\n🎉 Added ${added} new problems!`);
    await db.$disconnect();
}

seed50();
