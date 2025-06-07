# Custom SMTP Server with Node.js

A lightweight SMTP server built with Node.js that can receive, log, and store emails. Perfect for development, testing, and learning purposes.

## Features

- Receives emails via SMTP protocol
- Saves all received emails to local files
- Comprehensive logging of all SMTP operations
- Optional authentication support
- Easy deployment on local machines or cloud servers
- Built-in test client for verification

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/custom-smtp-server.git
cd custom-smtp-server
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Server

#### Local Development:
```bash
npm start
```

#### Development with auto-restart:
```bash
npm run dev
```

The server will start on port 25 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=2525 npm start
```

### Testing the Server

Send a single test email:
```bash
npm test
```

Send multiple test emails:
```bash
node test-client.js multiple
```

## Project Structure

```
custom-smtp-server/
├── index.js           # Main SMTP server code
├── test-client.js     # Email testing client
├── package.json       # Project dependencies
├── README.md         # This file
├── emails/           # Directory where received emails are stored
└── logs/             # Directory where server logs are stored
```

## Configuration

### Server Configuration

The server accepts these configuration options:

- **Port**: Default 25, can be changed via `PORT` environment variable
- **Host**: Listens on all interfaces (0.0.0.0)
- **Authentication**: Currently optional/disabled
- **Security**: Allows insecure connections for simplicity

### For Production Use

If you plan to use this in production, consider:

1. **Enable Authentication**:
```javascript
// In index.js, modify the onAuth function
onAuth(auth, session, cb) {
    if (auth.username === 'admin' && auth.password === 'password') {
        cb(null, { user: auth.username });
    } else {
        cb(new Error('Invalid credentials'));
    }
}
```

2. **Enable TLS/SSL**:
```javascript
const server = new SMTPServer({
    secure: true,
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.crt')
});
```

## Deployment

### Local Deployment

1. Run the server:
```bash
npm start
```

2. Test with the built-in client:
```bash
npm test
```

### AWS EC2 Deployment

1. **Launch EC2 Instance**:
   - Choose Ubuntu/Amazon Linux AMI
   - Select appropriate instance type (t2.micro for testing)
   - Configure security group to allow port 25 (SMTP)

2. **Connect to Instance**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Node.js**:
```bash
# For Ubuntu
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# For Amazon Linux
sudo yum install -y nodejs npm
```

4. **Deploy Your Code**:
```bash
git clone https://github.com/yourusername/custom-smtp-server.git
cd custom-smtp-server
npm install
```

5. **Run as Service** (optional):
```bash
# Install PM2 for process management
sudo npm install -g pm2

# Start the server
pm2 start index.js --name smtp-server

# Save PM2 configuration
pm2 save
pm2 startup
```

6. **Configure Security Group**:
   - Allow inbound traffic on port 25 (SMTP)
   - Allow inbound traffic on port 22 (SSH)

### Testing Remote Server

Update the test client configuration:

```javascript
// In test-client.js, change:
const SMTP_CONFIG = {
    host: 'your-ec2-public-ip', // Replace with your EC2 IP
    port: 25,
    // ... rest of config
};
```

## Important Notes

### Port 25 Restrictions

- Many cloud providers (including AWS) block port 25 by default
- Consider using alternative ports like 587 or 2525
- For AWS, you may need to request port 25 unblocking

### Domain Considerations

Since you don't own a domain:
- Emails will work for testing and development
- Real email delivery might be limited
- Consider using services like Mailtrap for testing

### Firewall Configuration

Make sure to allow the SMTP port through your firewall:

```bash
# Ubuntu/Debian
sudo ufw allow 25

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=25/tcp
sudo firewall-cmd --reload
```

## File Structure After Running

```
custom-smtp-server/
├── emails/                    # Received emails stored here
│   ├── email_session1_timestamp.txt
│   └── email_session2_timestamp.txt
├── logs/                      # Server logs
│   └── smtp.log
└── ... (other project files)
```

## Troubleshooting

### Common Issues

1. **Port 25 Permission Denied**:
   - Run with sudo: `sudo npm start`
   - Or use a different port: `PORT=2525 npm start`

2. **Connection Refused**:
   - Check if server is running
   - Verify firewall settings
   - Ensure correct IP/port in client

3. **AWS EC2 Issues**:
   - Check security group rules
   - Verify elastic IP (if using)
   - Consider port 25 restrictions

### Logs

Check the logs for debugging:
```bash
tail -f logs/smtp.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [smtp-server](https://www.npmjs.com/package/smtp-server) package
- Inspired by the need for simple email testing solutions