import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendVerificationEmail(toEmail: string, verificationToken: string, firstName?: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    // Use production domain (REPLIT_DOMAINS) first, fall back to dev domain
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const productionDomain = domains.find(d => d.includes('.replit.app')) || domains[0] || process.env.REPLIT_DEV_DOMAIN || '';
    const baseUrl = productionDomain ? (productionDomain.startsWith('http') ? productionDomain : `https://${productionDomain}`) : 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Verify Your GrowthPath Account',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #4338ca; font-size: 28px; margin: 0;">GrowthPath</h1>
            <p style="color: #6b7280; margin-top: 8px;">Professional Development Platform</p>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">
              Welcome${firstName ? `, ${firstName}` : ''}! 🎉
            </h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
              Thank you for signing up for GrowthPath. To complete your registration and start your professional development journey, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" 
                 style="background: #4338ca; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationUrl}" style="color: #4338ca; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
            <p>This verification link expires in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    await client.send(msg);
    console.log(`Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, firstName?: string): Promise<boolean> {
  try {
    console.log(`Attempting to send password reset email to ${toEmail}`);
    const { client, fromEmail } = await getUncachableSendGridClient();
    console.log(`SendGrid client obtained, from email: ${fromEmail}`);
    
    // Use production domain (REPLIT_DOMAINS) first, fall back to dev domain
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    const productionDomain = domains.find(d => d.includes('.replit.app')) || domains[0] || process.env.REPLIT_DEV_DOMAIN || '';
    const baseUrl = productionDomain ? (productionDomain.startsWith('http') ? productionDomain : `https://${productionDomain}`) : 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log(`Reset URL: ${resetUrl}`);
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Reset Your GrowthPath Password',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #4338ca; font-size: 28px; margin: 0;">GrowthPath</h1>
            <p style="color: #6b7280; margin-top: 8px;">Professional Development Platform</p>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px;">
              Password Reset Request
            </h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
              ${firstName ? `Hi ${firstName}, ` : ''}We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" 
                 style="background: #4338ca; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #4338ca; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
            <p>This reset link expires in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    const response = await client.send(msg);
    console.log(`Password reset email sent to ${toEmail}, response:`, JSON.stringify(response));
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid error response:', JSON.stringify(error.response.body));
    }
    return false;
  }
}
