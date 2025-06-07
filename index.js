const { SMTPServer } = require("smtp-server");
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Create emails directory to store received emails
const emailsDir = path.join(__dirname, 'emails');
if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir);
}

// Function to log events
function logEvent(event, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${event}: ${JSON.stringify(data)}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(path.join(logsDir, 'smtp.log'), logMessage);
}

// Function to save email
function saveEmail(session, emailData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `email_${session.id}_${timestamp}.txt`;
    const filepath = path.join(emailsDir, filename);
    
    const emailContent = `
=== EMAIL RECEIVED ===
Session ID: ${session.id}
From: ${session.envelope.mailFrom ? session.envelope.mailFrom.address : 'Unknown'}
To: ${session.envelope.rcptTo.map(addr => addr.address).join(', ')}
Received At: ${new Date().toISOString()}
Client IP: ${session.remoteAddress}
Client Hostname: ${session.clientHostname || 'Unknown'}

=== EMAIL CONTENT ===
${emailData}

=== END OF EMAIL ===
`;
    
    fs.writeFileSync(filepath, emailContent);
    logEvent('EMAIL_SAVED', { filename, sessionId: session.id });
}

const server = new SMTPServer({
    // Allow connections without authentication
    allowInsecureAuth: true,
    authOptional: true,
    
    // Disable requiring STARTTLS
    secure: false,
    disabledCommands: ['STARTTLS'],
    
    // Server identification
    banner: 'Custom SMTP Server Ready',
    
    // Connection handler
    onConnect(session, cb) {
        logEvent('CONNECTION', {
            sessionId: session.id,
            remoteAddress: session.remoteAddress,
            clientHostname: session.clientHostname
        });
        cb(); // Accept connection
    },
    
    // Handle MAIL FROM command
    onMailFrom(address, session, cb) {
        logEvent('MAIL_FROM', {
            address: address.address,
            sessionId: session.id
        });
        cb(); // Accept sender
    },
    
    // Handle RCPT TO command
    onRcptTo(address, session, cb) {
        logEvent('RCPT_TO', {
            address: address.address,
            sessionId: session.id
        });
        cb(); // Accept recipient
    },
    
    // Handle email data
    onData(stream, session, cb) {
        let emailData = '';
        
        logEvent('DATA_START', { sessionId: session.id });
        
        stream.on('data', (chunk) => {
            emailData += chunk.toString();
        });
        
        stream.on('end', () => {
            logEvent('DATA_END', {
                sessionId: session.id,
                size: emailData.length
            });
            
            // Save the email
            saveEmail(session, emailData);
            
            cb(); // Accept email
        });
        
        stream.on('error', (err) => {
            logEvent('DATA_ERROR', {
                sessionId: session.id,
                error: err.message
            });
            cb(err);
        });
    },
    
    // Handle authentication (optional)
    onAuth(auth, session, cb) {
        logEvent('AUTH_ATTEMPT', {
            username: auth.username,
            sessionId: session.id
        });
        
        // Since authOptional is true, this won't be called unless client tries to authenticate
        // You can add actual authentication logic here if needed
        cb(null, { user: auth.username });
    },
    
    // Handle connection close
    onClose(session) {
        logEvent('CONNECTION_CLOSED', { sessionId: session.id });
    }
});

// Error handling
server.on('error', (err) => {
    logEvent('SERVER_ERROR', { error: err.message, stack: err.stack });
});

// Start the server
const PORT = process.env.PORT || 25;
const HOST = '0.0.0.0'; // Listen on all interfaces

server.listen(PORT, HOST, () => {
    console.log(`SMTP Server running on ${HOST}:${PORT}`);
    console.log(`Emails will be saved to: ${emailsDir}`);
    console.log(`Logs will be saved to: ${logsDir}`);
    console.log('Server ready to receive emails!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down SMTP server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});