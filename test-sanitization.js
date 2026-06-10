/**
 * Test script for the strict output sanitization layer
 * Run: node test-sanitization.js
 */

function sanitizeLLMResponse(text) {
  if (!text) return text;

  let cleanText = text;

  // 1. Remove HTML/XML tags with content
  cleanText = cleanText.replace(/<sub[\s\S]*?<\/sub>/gi, "");
  cleanText = cleanText.replace(/<think[\s\S]*?<\/think>/gi, "");
  cleanText = cleanText.replace(/<debug[\s\S]*?<\/debug>/gi, "");
  cleanText = cleanText.replace(/<meta[\s\S]*?<\/meta>/gi, "");
  cleanText = cleanText.replace(/<log[\s\S]*?<\/log>/gi, "");
  
  // 2. Decode HTML entities
  cleanText = cleanText
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 3. Remove code blocks
  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");
  cleanText = cleanText.replace(/`[^`]+`/g, "");

  // 4. Remove JSON objects
  cleanText = cleanText.replace(/\{[\s\S]*?\}/g, (match) => {
    try {
      JSON.parse(match);
      return "";
    } catch {
      return match;
    }
  });

  // 5. Remove ANY remaining HTML/XML tags
  cleanText = cleanText.replace(/<[^>]+>/g, "");

  // 6. Remove model/provider identifiers
  const bannedTerms = [
    "Groq",
    "OpenAI",
    "Gemini",
    "OpenRouter",
    "assistant",
    "Hub Events Agent",
    "model:",
    "provider:",
    "source:",
  ];
  for (const term of bannedTerms) {
    cleanText = cleanText.replace(new RegExp(term, "gi"), "");
  }

  // 7. Remove "AI" only as standalone word
  cleanText = cleanText.replace(/\bAI\b/gi, "");

  // 8. Remove emoji tags
  const emojiTags = ["🧠", "🔧", "⚙️", "🤖", "💭", "📝", "🎯"];
  for (const emoji of emojiTags) {
    cleanText = cleanText.replace(new RegExp(emoji, "g"), "");
  }

  // 9. Remove debug/log prefixes
  cleanText = cleanText.replace(/^(DEBUG|LOG|INFO|ERROR|WARN):\s*/gim, "");
  
  // 10. Clean up spaces and trim
  cleanText = cleanText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

  return cleanText;
}

// Test cases
const testCases = [
  {
    name: "Example from task description",
    input: "Я могу помочь найти события Astana Hub... <sub>🧠 Groq</sub>",
    expected: "Я могу помочь найти события Astana Hub..."
  },
  {
    name: "Multiple metadata tags",
    input: "Вот список событий <sub>🧠 OpenAI</sub> <think>debug info</think>",
    expected: "Вот список событий"
  },
  {
    name: "HTML entities",
    input: "События &lt;Astana Hub&gt; в вашем городе",
    expected: "События в вашем городе"
  },
  {
    name: "Code blocks",
    input: "Ответ: Да ```json\n{\"key\":\"value\"}\n``` готово",
    expected: "Ответ: Да готово"
  },
  {
    name: "JSON metadata",
    input: 'Событие начинается завтра {"source": "groq", "model": "llama"}',
    expected: "Событие начинается завтра"
  },
  {
    name: "Model identifiers",
    input: "Hub Events Agent: Привет! Я ассистент OpenAI",
    expected: ": Привет! Я"
  },
  {
    name: "Emoji tags",
    input: "Готово! 🧠 🔧 Все работает ⚙️",
    expected: "Готово! Все работает"
  },
  {
    name: "Preserve normal emoji",
    input: "Всегда пожалуйста! 😊",
    expected: "Всегда пожалуйста! 😊"
  },
  {
    name: "Log prefixes",
    input: "DEBUG: checking data\nERROR: not found\nОтвет готов",
    expected: "checking data not found Ответ готов"
  },
  {
    name: "Preserve name 'Aizada'",
    input: "Свяжитесь с Aizada для подробностей",
    expected: "Свяжитесь с Aizada для подробностей"
  },
  {
    name: "Complex mixed case",
    input: "Город: Астана\n\n<sub>🧠 Groq model: llama-3.1</sub>\nБлижайшие события:\n1. Хакатон 15.06\n```debug\nlogging...\n```",
    expected: "Город: Астана Ближайшие события: 1. Хакатон 15.06"
  }
];

console.log("🧪 Running Sanitization Tests\n");
console.log("=".repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = sanitizeLLMResponse(test.input);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Input:    "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got:      "${result}"`);
  }
});

console.log("=".repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed (${testCases.length} total)`);

if (failed === 0) {
  console.log("✨ All tests passed! Sanitization layer is working correctly.");
} else {
  console.log("⚠️  Some tests failed. Review the output above.");
  process.exit(1);
}
