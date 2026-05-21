# SMTP Configuration Guide

This document provides information about configuring SMTP settings for email functionality in the IJARCM application.

## Environment Variables

The following environment variables need to be configured in your `.env` file for email functionality:

### Required SMTP Variables

```env
# SMTP Server Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

### Alternative Email Configuration (Legacy Support)

```env
# Legacy Email Configuration (still supported)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## SMTP Provider Examples

### Gmail/Google Workspace

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
SMTP_FROM="your-email@gmail.com"
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password from Google Account settings
3. Use the App Password as `SMTP_PASS`

### Outlook/Microsoft 365

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
```

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="your-verified-sender@yourdomain.com"
```

### Amazon SES

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-aws-access-key-id"
SMTP_PASS="your-aws-secret-access-key"
SMTP_FROM="your-verified-email@yourdomain.com"
```

## Security Considerations

1. **Never commit credentials to version control**
2. **Use App Passwords instead of regular passwords** when available
3. **Enable TLS/SSL** for secure email transmission
4. **Use environment-specific configurations** for development and production

## Testing SMTP Configuration

You can test your SMTP configuration using the built-in validation:

```javascript
import { validateSMTPConfig } from '@/lib/smtp';

if (validateSMTPConfig()) {
  console.log('SMTP configuration is valid');
} else {
  console.log('SMTP configuration is missing or invalid');
}
```

## Email Templates

The application uses the following email templates:

### Password Reset
- **Trigger:** User requests password reset
- **Template:** Located in forgot password API
- **Contains:** Reset link with token, expiry information

### Password Reset Confirmation
- **Trigger:** User successfully resets password
- **Template:** Located in reset password API
- **Contains:** Confirmation message, login link

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check username and password
   - For Gmail, ensure you're using an App Password
   - Verify 2FA is enabled if required

2. **Connection Timeout**
   - Check SMTP host and port
   - Verify firewall settings
   - Ensure `SMTP_SECURE` is set correctly

3. **Email Not Sent**
   - Check sender email is verified (for services like SendGrid, SES)
   - Verify email content doesn't trigger spam filters
   - Check email quota limits

### Debug Mode

To enable email debugging, set the following in your environment:

```env
NODE_ENV="development"
```

This will provide detailed logging in the console for email operations.

## Rate Limiting

Some SMTP providers implement rate limiting. The application includes basic rate limiting to prevent abuse:

- Password reset requests: Limited per email address
- Email sending: Configurable limits per time period

## Customization

### Custom Email Templates

You can customize email templates by modifying the HTML content in the respective API routes:

- Password reset: `src/app/api/auth/forgot-password/route.ts`
- Password reset confirmation: `src/app/api/auth/reset-password/route.ts`

### Custom SMTP Transport

For advanced configurations, you can modify the `createEmailTransporter` function in `src/lib/smtp.ts` to include additional options like:

```typescript
import nodemailer from 'nodemailer';

export const createEmailTransporter = () => {
  const config = getSMTPConfig();
  
  return nodemailer.createTransport({
    ...config,
    tls: {
      rejectUnauthorized: false // For self-signed certificates
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100
  });
};
```

## Production Deployment

When deploying to production:

1. **Use environment-specific SMTP settings**
2. **Ensure all credentials are properly set**
3. **Test email functionality before going live**
4. **Monitor email delivery rates and bounces**
5. **Set up proper SPF/DKIM records for your domain**

## Support

For issues related to SMTP configuration:

1. Check your SMTP provider's documentation
2. Verify environment variables are correctly set
3. Review application logs for error details
4. Contact support at: support@ijarcm.edu