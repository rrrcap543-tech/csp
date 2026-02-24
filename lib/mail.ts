import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Caprinos Portal" <noreply@caprinos.com>',
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export async function sendInviteEmail(email: string, name: string, token: string) {
    const inviteLink = `${baseUrl}/accept-invite/${token}`;

    return sendMail({
        to: email,
        subject: 'Invitation to join Caprinos Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #d32f2f;">Welcome to Caprinos!</h2>
                <p>Hello ${name},</p>
                <p>You have been invited to join the Caprinos Employee Portal. To complete your registration and set your password, please click the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
                </div>
                <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${inviteLink}</p>
                <p>This link will expire soon, so please register as soon as possible.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">If you were not expecting this invitation, please ignore this email.</p>
            </div>
        `,
    });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    return sendMail({
        to: email,
        subject: 'Password Reset Request - Caprinos Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #d32f2f;">Password Reset</h2>
                <p>Hello ${name},</p>
                <p>We received a request to reset your password for your Caprinos Portal account. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                <p>If the button doesn't work, copy and paste this link:</p>
                <p style="word-break: break-all; color: #666;">${resetLink}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This link will expire in 1 hour.</p>
            </div>
        `,
    });
}

export async function sendRosterPublishedEmail(email: string, name: string, weekStart: string) {
    const loginLink = `${baseUrl}/login`;

    return sendMail({
        to: email,
        subject: `New Roster Published - Week of ${weekStart}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #d32f2f;">New Roster Published</h2>
                <p>Hello ${name},</p>
                <p>The roster for the week starting <strong>${weekStart}</strong> has been published. You can view your shifts by logging into the portal:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Shifts</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">Caprinos Portal Team</p>
            </div>
        `,
    });
}

export async function sendRosterChangeEmail(email: string, name: string, changeDetails: string) {
    const loginLink = `${baseUrl}/login`;

    return sendMail({
        to: email,
        subject: 'Shift Update - Caprinos Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #d32f2f;">Your Shift has been Updated</h2>
                <p>Hello ${name},</p>
                <p>One of your scheduled shifts has been changed:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d32f2f;">
                    ${changeDetails}
                </div>
                <p>Please log in to the portal to see the full details of your updated schedule:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginLink}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">Caprinos Portal Team</p>
            </div>
        `,
    });
}
