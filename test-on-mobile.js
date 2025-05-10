// Script to help test the app on mobile devices
const { execSync } = require('child_process');
const os = require('os');
const chalk = require('chalk');

// Get local IP addresses
const getLocalIpAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.keys(interfaces).forEach(interfaceName => {
    interfaces[interfaceName].forEach(iface => {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        addresses.push(iface.address);
      }
    });
  });

  return addresses;
};

// Main function
const runMobileTest = async () => {
  try {
    console.log(chalk.blue('🍞 Preparing Bread Recipe Calculator for mobile testing...'));
    
    // Install required dependencies if not already installed
    console.log(chalk.yellow('Installing required dependencies...'));
    try {
      execSync('npm list chalk || npm install chalk --save-dev', { stdio: 'inherit' });
      execSync('npm list sharp || npm install sharp --save-dev', { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Error installing dependencies:'), error);
    }
    
    // Generate PWA icons
    console.log(chalk.yellow('Generating PWA icons...'));
    try {
      execSync('node public/manifest-icons.js', { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Error generating icons:'), error);
      console.log(chalk.yellow('Make sure you have a bread-icon.svg or bread-icon.png in the public directory'));
    }
    
    // Get local IP addresses
    const ipAddresses = getLocalIpAddresses();
    
    console.log(chalk.green('\n✅ Setup complete! Starting development server...\n'));
    
    // Display access information
    console.log(chalk.blue('📱 To test on your mobile device:'));
    console.log(chalk.yellow('1. Make sure your phone is connected to the same WiFi network as this computer'));
    console.log(chalk.yellow('2. Open one of these URLs in your mobile browser:'));
    
    ipAddresses.forEach(ip => {
      console.log(chalk.green(`   http://${ip}:3000`));
    });
    
    console.log(chalk.yellow('\n3. For PWA installation:'));
    console.log(chalk.yellow('   - In Chrome/Edge: Tap the menu (⋮) and select "Install app" or "Add to Home Screen"'));
    console.log(chalk.yellow('   - In Safari: Tap the share icon and select "Add to Home Screen"'));
    
    console.log(chalk.blue('\n🚀 Starting development server with PWA enabled...'));
    
    // Start the development server
    execSync('npm run dev', { stdio: 'inherit' });
    
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
};

// Run the script
runMobileTest();
