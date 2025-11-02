# Webhook Response Parsing Fix

## Problem Identified

Your N8N webhook was returning data in a **text-based format** instead of JSON:

```
interview_analysis
candidate_name:Ram
conclusion:Ram has a good foundation in Next.js and with some additional practice, he should be well-prepared for future interviews.
final_score:16
overall_performance:Ram demonstrated a solid understanding of core Next.js concepts, but had some gaps in knowledge...
ready_for_interview:With some additional practice and review of key concepts, Ram should be well-prepared for future interviews.
reason_for_deduction:Points were deducted for lack of knowledge in certain areas, but Ram's overall performance was still strong.
strengths
0:good foundation in Next.js
1:honesty and willingness to learn
weaknesses
0:gaps in knowledge of certain concepts, such as getStaticProps and getServerSideProps
```

However, your parsing code was expecting a JSON format, which caused:
- ❌ Wrong score displayed
- ❌ "Not applicable" shown for other fields

## Solution Implemented

### 1. Added Text Parser Function

A new `parseTextBasedResponse()` function was added to handle the text-based format:

```typescript
function parseTextBasedResponse(textData: string): any {
    const lines = textData.trim().split('\n');
    const result: any = {};
    let currentKey = '';
    
    for (const line of lines) {
        // Parse key:value pairs
        // Handle array items (0:value, 1:value)
        // Map snake_case to camelCase
    }
    
    return result;
}
```

**Key Features:**
- Parses line-by-line text format
- Handles array items (strengths/weaknesses with indexes)
- Converts `final_score` to `finalScore`
- Converts `overall_performance` to `overallPerformance`
- Converts string scores to numbers
- Joins array values into comma-separated strings

### 2. Updated Parsing Logic

Modified the webhook response handling in `start/page.tsx`:

```typescript
// Detect text-based format and parse it
if (typeof outputData === 'string' && outputData.includes('interview_analysis')) {
    console.log("Parsing text-based format...");
    const parsedData = parseTextBasedResponse(outputData);
    outputData = parsedData;
}
```

### 3. Enhanced Data Extraction

Added prioritized extraction logic to handle the parsed text format first:

```typescript
// Handle text-based parsed format first
if (reportData.finalScore !== undefined && (reportData.overallPerformance || reportData.overall_performance)) {
    return {
        finalScore: reportData.finalScore,
        overallEval: reportData.overallPerformance || reportData.overall_performance,
        strengths: strengthsString,
        weaknesses: weaknessesString,
        reasonForDeduction: reportData.reasonForDeduction,
        conclusion: reportData.conclusion
    };
}
```

## Data Mapping

The parser maps your webhook response fields to the expected database fields:

| Webhook Field | Database Field | Type |
|---------------|----------------|------|
| `final_score` | `finalScore` | number |
| `overall_performance` | `overallEvaluation` | string |
| `strengths` (array) | `strengths` | string (comma-separated) |
| `weaknesses` (array) | `weakness` | string (comma-separated) |
| `reason_for_deduction` | `reasonForDeduction` | string |
| `conclusion` | `conclusion` | string |

## Testing

To test the fix:

1. **Submit an interview** and complete it
2. **Check the console logs** - you should see:
   ```
   Parsing text-based format...
   Parsed text-based response: { finalScore: 16, overallPerformance: "...", ... }
   ```
3. **View the results page** - all fields should now display correctly:
   - ✅ Score: 16/20
   - ✅ Overall Evaluation: Full text displayed
   - ✅ Strengths: "good foundation in Next.js, honesty and willingness to learn"
   - ✅ Weaknesses: "gaps in knowledge of certain concepts..."
   - ✅ Reason for Deduction: Full text
   - ✅ Conclusion: Full text

## Recommended: Update N8N Webhook

For better reliability, consider updating your N8N workflow to return **proper JSON**:

```json
{
  "finalScore": 16,
  "overallPerformance": "Ram demonstrated a solid understanding...",
  "strengths": "good foundation in Next.js, honesty and willingness to learn",
  "weaknesses": "gaps in knowledge of certain concepts, such as getStaticProps and getServerSideProps",
  "reasonForDeduction": "Points were deducted for lack of knowledge in certain areas...",
  "conclusion": "Ram has a good foundation in Next.js and with some additional practice..."
}
```

This would be more robust and easier to maintain.

## Files Modified

- ✅ `/app/interview/[interviewId]/start/page.tsx` - Added parser and updated extraction logic

## Backward Compatibility

The solution maintains backward compatibility with:
- ✅ JSON format responses
- ✅ Nested JSON structures
- ✅ Numbered section formats (1. Question-wise, 2. Overall Evaluation, etc.)
- ✅ **NEW:** Text-based format (current webhook output)

All existing formats continue to work!
