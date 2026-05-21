// Script to help save the Managing Director signature
// Run this script to output the expected file location

const path = require('path');
const fs = require('fs');

const signaturePath = path.join(__dirname, '..', 'public', 'uploads', 'signatures', 'managing-director-signature.png');

console.log('='.repeat(60));
console.log('MANAGING DIRECTOR SIGNATURE SETUP');
console.log('='.repeat(60));
console.log('\nPlease save the signature image to:');
console.log(signaturePath);
console.log('\nThe signature should be:');
console.log('- PNG format with transparent background (preferred)');
console.log('- Approximately 200-300px wide');
console.log('- High quality for PDF generation');
console.log('\nAfter saving, the certificates will automatically display');
console.log('the Managing Director signature (R.K. Shesma).');
console.log('='.repeat(60));

// Check if directory exists
const dir = path.dirname(signaturePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('\nCreated directory:', dir);
}

// Check if file exists
if (fs.existsSync(signaturePath)) {
  console.log('\n✓ Signature file already exists!');
} else {
  console.log('\n⚠ Signature file not found. Please save the image to the path above.');
}
