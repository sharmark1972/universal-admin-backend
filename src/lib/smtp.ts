import nodemailer from 'nodemailer';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export const getSMTPConfig = (): SMTPConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };
};

export const createEmailTransporter = () => {
  const config = getSMTPConfig();
  
  return nodemailer.createTransport(config);
};

export const getEmailFromAddress = (): string => {
  return process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@ijarcm.edu';
};

export const sendEmail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: options.from || `"International Journal of Academic Research in Commerce and Management" <${getEmailFromAddress()}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const validateSMTPConfig = (): boolean => {
  const config = getSMTPConfig();
  return !!(config.host && config.port && config.auth.user && config.auth.pass);
};