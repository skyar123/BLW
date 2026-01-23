import emailjs from '@emailjs/browser';

// EmailJS configuration - set these up at https://www.emailjs.com/
// Add to Netlify environment variables for production
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export interface InviteEmailParams {
  to_email: string;
  invite_code: string;
  family_name: string;
  sender_name: string;
  app_url: string;
}

export function isEmailConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export async function sendInviteEmail(params: InviteEmailParams): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('EmailJS not configured - invite code displayed but email not sent');
    return false;
  }

  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: params.to_email,
      invite_code: params.invite_code,
      family_name: params.family_name,
      sender_name: params.sender_name,
      app_url: params.app_url,
    }, PUBLIC_KEY);

    console.log('Email sent successfully:', result.status);
    return true;
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return false;
  }
}
