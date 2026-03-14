import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

export function startLocalSmtpServer(port = 1025) {
  const messages: Array<{ from: string; to: string; subject: string; text: string }> = [];

  const server = new SMTPServer({
    disabledCommands: ['STARTTLS', 'AUTH'],
    onData(stream, session, callback) {
      let raw = '';
      stream.on('data', (chunk) => {
        raw += chunk.toString();
      });
      stream.on('end', async () => {
        try {
          const parsed = await simpleParser(raw);
          const from = (parsed.from?.text ?? '') as string;
          const to = (parsed.to?.text ?? '') as string;
          const subject = parsed.subject ?? '';
          const text = parsed.text ?? '';

          messages.push({ from, to, subject, text });
          console.log('📧 [Local SMTP] Email received');
          console.log('  from:', from);
          console.log('  to:', to);
          console.log('  subject:', subject);
          console.log('  text:', text.trim());
        } catch (err) {
          console.error('Failed to parse email:', err);
        }
        callback();
      });
    },
    onAuth(auth, session, callback) {
      // Accept any auth for local server
      callback(null, { user: 'local' });
    },
  });

  server.listen(port, () => {
    console.log(`📬 Local SMTP server is listening on port ${port} (no real emails are sent)`);
  });

  return {
    server,
    messages,
    stop: () => new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}
