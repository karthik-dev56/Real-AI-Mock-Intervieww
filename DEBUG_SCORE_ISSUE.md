# DEBUGGING GUIDE - Score Still Showing 0

## Added Enhanced Logging

I've added detailed console logging to help us debug why the score is still showing 0.

## How to Debug

1. **Open your browser's Developer Console** (F12 or Right-click → Inspect)
2. **Go to the Console tab**
3. **Complete an interview and submit**
4. **Look for these logs in order:**

### Step 1: Check Raw Response
```
Full API response: {...}
Response data: {...}
Output data: <the actual data>
Output data type: string or object
```

**❓ Question 1**: Is "Output data type" showing `string` or `object`?
- If `object`, the webhook is returning JSON (not text)
- If `string`, it's text-based format

### Step 2: Check if Parser is Triggered
```
Parsing text-based format...
=== PARSING TEXT DATA ===
Raw text: <full text>
Total lines: <number>
```

**❓ Question 2**: Do you see "Parsing text-based format..." ?
- If NO → The condition isn't matching your data format
- If YES → Continue to next step

### Step 3: Check Line-by-Line Parsing
```
Processing line: interview_analysis
Processing line: candidate_name:Ram
Processing line: final_score:12
Set finalScore = 12
Processing line: 3. Final Score
Processing line: Score:12/20
Set finalScore = 12/20
```

**❓ Question 3**: Do you see "Set finalScore = ..." ?
- If NO → The Score line isn't being parsed correctly
- If YES → Note what value it shows

### Step 4: Check Score Conversion
```
Before conversion - finalScore: 12/20 string
Converted from X/Y format: 12
After conversion - finalScore: 12
```

**❓ Question 4**: What does "After conversion - finalScore:" show?
- Should be a NUMBER like `12`
- If it's still a string or undefined, there's a conversion issue

### Step 5: Check Data Extraction
```
=== EXTRACTING DATA ===
reportData.finalScore: 12
reportData.overallPerformance: Ram demonstrated...
✅ Using text-based parsed format
Extracted data: { finalScore: 12, ... }
```

**❓ Question 5**: What does "reportData.finalScore" show?
- Should be `12`
- If `undefined` or `null`, the parser didn't set it correctly

### Step 6: Check Saved Data
```
Saved data result: <id>
```

## Common Issues & Solutions

### Issue 1: Parser Not Triggered
**Symptom**: No "Parsing text-based format..." log

**Solution**: The webhook response might be nested differently. Copy the EXACT output from:
```
Output data: <paste this>
```
And send it to me.

### Issue 2: Score Not Found in Text
**Symptom**: See parsing logs but no "Set finalScore = ..."

**Solution**: The format doesn't have a line with `:` separator. Copy the exact lines from:
```
Processing line: <all these lines>
```
And send them to me.

### Issue 3: Score Not Converting
**Symptom**: "After conversion - finalScore: NaN" or "undefined"

**Solution**: The parsing set the value but conversion failed. Check what "Before conversion - finalScore:" shows.

### Issue 4: Wrong Data Being Used
**Symptom**: ❌ NOT seeing "✅ Using text-based parsed format"

**Solution**: The condition `reportData.finalScore !== undefined` is failing. This means:
- The parser didn't set `finalScore` correctly
- OR the data is nested differently

## What to Send Me

After you complete an interview, send me:

1. ✅ The "Output data:" value (full text)
2. ✅ The "Output data type:" value
3. ✅ All "Processing line:" entries
4. ✅ The "Before conversion - finalScore:" value
5. ✅ The "After conversion - finalScore:" value
6. ✅ The "reportData.finalScore:" value

With this information, I can pinpoint exactly where the issue is and fix it!

## Quick Test

Run the interview, then in the console, search for:
- `finalScore` (you should see it multiple times)
- If you see `finalScore: 12` but it still shows 0, the issue is in the database save or display
- If you DON'T see `finalScore: 12`, the issue is in the parsing

## Next Steps

Complete an interview and send me the console logs! 🔍
