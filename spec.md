# WriteAI Studio

## Current State
New project with no existing app.

## Requested Changes (Diff)

### Add
- Multi writing modes: Blog Writer, Story Generator, Email Writer, Resume Builder, Social Media Caption Generator, Tamil Content Writer, Script Writer (Reels/Short Films)
- Tone & Style control: Formal/Casual/Funny/Emotional, Short/Medium/Long, Language (English/Tamil/Hinglish)
- Quick Templates: 1-click prompts like apology email, Instagram caption, YouTube script, startup pitch
- AI Rewrite Tool: paste text, choose simplify/make professional/make emotional/translate
- Tamil + Local Content support throughout all modes
- Script Writer for Reels (30 sec), Short Films (5 min), Dialogue Generator
- AI-powered generation via HTTP outcalls to OpenAI/Gemini

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Motoko actor with HTTP outcalls to AI API for text generation, rewrite, and translation
2. Frontend: Mode selector UI, tone/style controls, quick templates panel, AI rewrite tool, output display with copy/download
