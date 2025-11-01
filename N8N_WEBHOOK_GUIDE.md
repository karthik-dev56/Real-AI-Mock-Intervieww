# N8N Webhook Configuration Guide

## Ideal JSON Response Format

Your n8n webhook at `https://dev-56.app.n8n.cloud/webhook/interview-mockk` should return data in this format:

### Option 1: Clean Format (Recommended)

```json
{
  "questionWiseJustification": "Detailed analysis of each question and answer...",
  "overallEvaluation": {
    "strengths": [
      "Strong communication skills",
      "Good technical knowledge",
      "Clear explanation of concepts"
    ],
    "weaknesses": [
      "Could provide more specific examples",
      "Need more depth in some areas"
    ]
  },
  "finalScore": 7,
  "reasonForDeduction": "Points deducted for lack of specific examples and incomplete explanation of advanced concepts.",
  "conclusion": "Great job! You're interview-ready with some minor improvements needed in providing concrete examples and diving deeper into advanced topics."
}
```

### Option 2: Alternative Clean Format

```json
{
  "final_score": 7,
  "question_wise_justification": "Question 1: Excellent answer showing deep understanding...",
  "overall_evaluation": {
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Area 1 to improve", "Area 2 to improve"]
  },
  "reason_for_deduction": "Explanation of score deductions...",
  "conclusion": "Motivational closing message..."
}
```

## Current Format Being Handled

The code also handles the current format with numbered sections:

```json
{
  "output": {
    "1. Question-wise Justification": {
      "Question 1: ...": "Analysis...",
      "Question 2: ...": "Analysis..."
    },
    "2. Overall Evaluation": {
      "Strengths": ["Strength 1", "Strength 2"],
      "Weaknesses / Improvement Areas": ["Weakness 1", "Weakness 2"]
    },
    "3. Final Score": "7 / 10",
    "4. Reason for Deduction": "Explanation...",
    "5. Conclusion": "Motivational message..."
  }
}
```

## AI Prompt for N8N

Use this system prompt in your n8n AI node to get the correct format:

```json
{
  "role": "system",
  "content": "You are an Interview Performance Analyzer. Analyze the conversation and return a JSON response with these exact fields:\n\n1. questionWiseJustification (string): Detailed analysis of each answer\n2. overallEvaluation (object with 'strengths' and 'weaknesses' arrays)\n3. finalScore (number 1-10)\n4. reasonForDeduction (string): Why points were deducted\n5. conclusion (string): Motivational summary\n\nEvaluation criteria:\n- Relevance and clarity of answers\n- Technical accuracy\n- Communication confidence\n- Completeness of responses\n\nScoring:\n- 9-10: Excellent, interview-ready\n- 7-8: Good with minor improvements\n- 5-6: Average, needs preparation\n- 1-4: Below expectations\n\nReturn only valid JSON, no markdown formatting."
}
```

## Testing Your Webhook

Send a POST request to your webhook with this structure:

```json
{
  "conversation": [
    {
      "role": "assistant",
      "message": "Tell me about your experience with Next.js"
    },
    {
      "role": "user",
      "message": "I have been working with Next.js for 2 years..."
    }
  ]
}
```

Expected response should match one of the formats above.

## Database Schema

The data is saved to the database with these fields:

- `udid`: User ID
- `overallEvaluation`: Question-wise justification text
- `finalScore`: Number (0-10)
- `strengths`: Comma-separated string or text
- `weakness`: Comma-separated string or text
- `reasonForDeduction`: Text explanation
- `conclusion`: Motivational message

## Implementation Notes

- Arrays are automatically joined with commas when saving to database
- Score strings like "7 / 10" are parsed to just the number (7)
- If data is nested under `output`, it will be extracted automatically
- Both camelCase and snake_case field names are supported
