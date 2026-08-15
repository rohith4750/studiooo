import tls from 'tls';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'R2R Studio',
    fromEmail: process.env.SMTP_FROM_EMAIL || (process.env.SMTP_USER || 'support@r2rstudio.com'),
  };
}

/**
 * Native lightweight SMTP TLS email dispatcher without heavy external packages.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getSmtpConfig();

  // If SMTP credentials are not configured in environment, log securely to console for development testing
  if (!config.user || !config.pass) {
    console.log(`\n================== [SMTP EMAIL DISPATCH SIMULATOR] ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: "${config.fromName}" <${config.fromEmail}>`);
    console.log(`---------------------------------------------------------------------`);
    console.log(`HTML Body Content:`);
    console.log(html);
    console.log(`=====================================================================\n`);
    return { success: true, messageId: 'simulated-dev-id' };
  }

  return new Promise((resolve) => {
    try {
      const socket = tls.connect(config.port, config.host, { rejectUnauthorized: false }, () => {
        let step = 0;

        const write = (cmd: string) => {
          socket.write(cmd + '\r\n');
        };

        socket.on('data', (data) => {
          const res = data.toString();
          const code = parseInt(res.substring(0, 3), 10);

          if (step === 0 && (code === 220 || res.includes('220'))) {
            step = 1;
            write(`EHLO ${config.host}`);
          } else if (step === 1 && code === 250) {
            step = 2;
            write('AUTH LOGIN');
          } else if (step === 2 && code === 334) {
            step = 3;
            write(Buffer.from(config.user).toString('base64'));
          } else if (step === 3 && code === 334) {
            step = 4;
            write(Buffer.from(config.pass).toString('base64'));
          } else if (step === 4 && code === 235) {
            step = 5;
            write(`MAIL FROM:<${config.fromEmail}>`);
          } else if (step === 5 && code === 250) {
            step = 6;
            write(`RCPT TO:<${to}>`);
          } else if (step === 6 && code === 250) {
            step = 7;
            write('DATA');
          } else if (step === 7 && code === 354) {
            step = 8;
            const boundary = `----=_Part_${Date.now()}`;
            const message = [
              `From: "${config.fromName}" <${config.fromEmail}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: text/html; charset=UTF-8`,
              `Date: ${new Date().toUTCString()}`,
              ``,
              html,
              `.`,
            ].join('\r\n');
            write(message);
          } else if (step === 8 && code === 250) {
            step = 9;
            write('QUIT');
            socket.end();
            resolve({ success: true, messageId: `msg_${Date.now()}` });
          } else if (code >= 400) {
            socket.end();
            resolve({ success: false, error: `SMTP server responded with error: ${res.trim()}` });
          }
        });

        socket.on('error', (err) => {
          resolve({ success: false, error: err.message });
        });
      });

      socket.setTimeout(15000, () => {
        socket.destroy();
        resolve({ success: false, error: 'SMTP connection timed out' });
      });
    } catch (e: any) {
      resolve({ success: false, error: e.message || 'Failed to dispatch email' });
    }
  });
}
