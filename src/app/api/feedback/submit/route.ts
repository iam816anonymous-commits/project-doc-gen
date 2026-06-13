import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { rating, useful, missing, confused, recommend } = data;
    const combinedFeedback = `${useful} ${missing} ${confused}`;

    // 1. Minimum Length Check
    if (combinedFeedback.length < 100) {
      return NextResponse.json({ error: 'Feedback is too short. Please provide at least 100 characters across all fields.' }, { status: 400 });
    }

    // 2. Low Effort Check
    const lowEffortPhrases = ['good', 'nice', 'ok', 'very good', 'excellent', 'great', 'fine', 'thanks', 'thank you'];
    const lowerFeedback = combinedFeedback.toLowerCase().trim();
    if (lowEffortPhrases.includes(lowerFeedback) || lowerFeedback.split(' ').length < 5) {
        return NextResponse.json({ error: 'Please provide more specific and genuine feedback.' }, { status: 400 });
    }

    // 3. Abuse Prevention: Check for existing reward
    const existingReward = db.prepare('SELECT id FROM feedback WHERE user_id = ? AND reward_granted = 1').get(userId);
    if (existingReward) {
        return NextResponse.json({ error: 'You have already received a reward for feedback.' }, { status: 403 });
    }

    const feedbackId = uuidv4();
    db.prepare(`
      INSERT INTO feedback (id, user_id, rating, what_was_useful, what_was_missing, what_confused_you, recommend, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `).run(feedbackId, userId, rating, useful, missing, confused, recommend ? 1 : 0);

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully! Our team will review it and grant your reward.' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
