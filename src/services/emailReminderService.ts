import { EmailReminderConfig, Flashcard, Subject } from '../types';
import { isCardDue } from './sm2Service';

export interface EmailDigestPayload {
  toEmail: string;
  subject: string;
  dueCardsCount: number;
  totalCardsCount: number;
  subjectsSummary: Array<{
    subjectName: string;
    dueCount: number;
  }>;
  streakDays: number;
  htmlContent: string;
  timestamp: string;
}

export class EmailReminderService {
  /**
   * Generates email digest payload and HTML email preview
   */
  static generateDigest(
    config: EmailReminderConfig,
    flashcards: Flashcard[],
    subjects: Subject[],
    streakDays: number
  ): EmailDigestPayload {
    const dueCards = flashcards.filter(isCardDue);

    // Group due cards by subject
    const subjectMap = new Map<string, number>();
    dueCards.forEach((card) => {
      const count = subjectMap.get(card.subjectName) || 0;
      subjectMap.set(card.subjectName, count + 1);
    });

    const subjectsSummary = Array.from(subjectMap.entries()).map(([name, count]) => ({
      subjectName: name,
      dueCount: count,
    }));

    const subjectLine = `🧠 Lumina Daily Digest: ${dueCards.length} Flashcard${dueCards.length === 1 ? '' : 's'} Due for Review (🔥 ${streakDays}-Day Streak)`;

    const subjectRows = subjectsSummary
      .map(
        (s) => `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 12px; color: #f8fafc; font-weight: 500;">${s.subjectName}</td>
          <td style="padding: 12px; text-align: right; color: #818cf8; font-weight: 700;">${s.dueCount} cards</td>
        </tr>`
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
    .stat-badge { display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid #6366f1; color: #a5b4fc; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-top: 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; margin-top: 24px; text-align: center; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ LUMINA STUDY SUITE</div>
      <div class="stat-badge">🔥 ${streakDays} Day Study Streak</div>
      <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px;">Spaced Repetition Memory Digest</h2>
      <p style="color: #94a3b8; font-size: 15px; margin: 0;">You have <strong>${dueCards.length}</strong> concept${dueCards.length === 1 ? '' : 's'} scheduled for spaced repetition review today to prevent memory decay.</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #334155; color: #94a3b8; font-size: 13px; text-transform: uppercase;">
          <th style="padding: 10px; text-align: left;">Subject</th>
          <th style="padding: 10px; text-align: right;">Cards Due</th>
        </tr>
      </thead>
      <tbody>
        ${subjectRows || '<tr><td colspan="2" style="padding: 16px; text-align: center; color: #22c55e;">🎉 All caught up! No cards due for review today.</td></tr>'}
      </tbody>
    </table>

    <div style="text-align: center;">
      <a href="#" class="btn">🚀 Start Today's Review Session</a>
    </div>

    <div class="footer">
      <p>Sent automatically based on your Lumina Spaced Repetition schedule (${config.scheduledTime || '09:00'}).</p>
      <p>Configure reminder frequency or email preferences directly in your Lumina settings.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return {
      toEmail: config.email,
      subject: subjectLine,
      dueCardsCount: dueCards.length,
      totalCardsCount: flashcards.length,
      subjectsSummary,
      streakDays,
      htmlContent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simulates sending the email or triggers webhook
   */
  static async sendDigestNotification(payload: EmailDigestPayload): Promise<{ success: boolean; message: string }> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!payload.toEmail || !payload.toEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    return {
      success: true,
      message: `Digest reminder successfully queued for ${payload.toEmail}!`,
    };
  }
}
