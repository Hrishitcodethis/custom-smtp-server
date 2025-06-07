const nodemailer = require('nodemailer');

// Configuration for your SMTP server
const SMTP_CONFIG = {
    host: '127.0.0.1', // Change to your EC2 public IP when testing remotely
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: null, // No authentication required
    tls: {
        rejectUnauthorized: false
    }
};

// Create transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Test email function
async function sendTestEmail() {
    try {
        console.log('🧪 Testing SMTP server...');
        
        const info = await transporter.sendMail({
            from: 'test@example.com',
            to: 'recipient@example.com',
            subject: 'Test Email from Custom SMTP Server',
            text: 'This is a test email sent to verify the SMTP server is working correctly!',
            html: `
                <h2>🎉 SMTP Server Test</h2>
                <p>This is a test email sent to verify the SMTP server is working correctly!</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Server:</strong> Custom Node.js SMTP Server</p>
            `
        });

        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📋 Response:', info.response);
        
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('🚨 Full error:', error);
    }
}

// Test multiple emails
async function sendMultipleTestEmails() {
    console.log('🚀 Starting multiple email test...\n');
    
    const emails = [
        {
            from: 'user1@example.com',
            to: 'admin@localhost',
            subject: 'Welcome Email',
            text: 'Welcome to our service!'
        },
        {
            from: 'system@example.com', 
            to: 'user@localhost',
            subject: 'System Notification',
            text: 'Your account has been activated.'
        },
        {
            from: 'noreply@example.com',
            to: 'test@localhost',
            subject: 'Test with HTML',
            html: '<h1>HTML Email Test</h1><p>This email contains <strong>HTML</strong> content!</p>'
        }
    ];
    
    for (let i = 0; i < emails.length; i++) {
        try {
            console.log(`📤 Sending email ${i + 1}/${emails.length}...`);
            await transporter.sendMail(emails[i]);
            console.log(`✅ Email ${i + 1} sent successfully!`);
        } catch (error) {
            console.error(`❌ Email ${i + 1} failed:`, error.message);
        }
        
        // Small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🏁 Multiple email test completed!');
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0] || 'single';

if (command === 'single') {
    sendTestEmail();
} else if (command === 'multiple') {
    sendMultipleTestEmails();
} else {
    console.log('Usage:');
    console.log('  node test-client.js single    - Send single test email');
    console.log('  node test-client.js multiple  - Send multiple test emails');
}