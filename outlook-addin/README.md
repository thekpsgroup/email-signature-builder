# Email Signature Builder - Outlook Add-in

This Outlook add-in allows users to create and insert professional email signatures directly into their Outlook emails.

## Features

- **Easy Signature Creation**: Simple form to input contact information
- **Live Preview**: See your signature as you type
- **One-Click Insertion**: Insert signature into email with a single click
- **Auto-Save**: Your signature data is automatically saved locally
- **Professional Templates**: Clean, modern signature design

## Installation

### For Development

1. **Start a local web server** to serve the add-in files:
   ```bash
   cd outlook-addin
   python -m http.server 3000
   # or use any web server serving on port 3000
   ```

2. **Sideload the add-in in Outlook**:
   - Open Outlook (desktop or web version)
   - Go to **File > Manage Add-ins** (or **Insert > Add-ins** in some versions)
   - Click **Add a custom add-in > Add from file**
   - Select the `manifest.xml` file from this directory
   - The add-in will appear in your Outlook ribbon

### For Production Deployment

1. **Host the add-in files** on a secure web server (HTTPS required)
2. **Update URLs in manifest.xml** to point to your hosted location
3. **Generate proper icons** and update icon URLs in manifest
4. **Submit to Microsoft AppSource** or distribute the manifest file to users

## File Structure

```
outlook-addin/
├── manifest.xml          # Add-in manifest (defines the add-in)
├── taskpane.html         # Main interface (loads in task pane)
├── outlook-app.js        # JavaScript logic and Office.js integration
├── app-outlook.css       # Styles for the add-in interface
├── commands.html         # Required commands page
└── README.md            # This file
```

## How to Use

1. **Open the Add-in**: Click the "Insert Signature" button in your Outlook ribbon
2. **Fill in Your Information**: Enter your name, title, company, contact details
3. **Preview**: See your signature update in real-time
4. **Insert**: Click "Insert into Email" to add the signature to your current email

## Office.js Integration

The add-in uses Office.js to:
- Detect when it's running in Outlook
- Access the current email's body
- Insert HTML content into the email
- Provide user notifications

## Browser Compatibility

- Outlook Desktop (Windows/Mac)
- Outlook Web App
- Outlook Mobile (limited functionality)

## Security Notes

- The add-in requires permission to read/write email content
- All data is stored locally in the browser (no server storage)
- No external API calls are made
- HTTPS is required for production deployment

## Troubleshooting

**Add-in won't load:**
- Ensure you're using HTTPS in production
- Check that Office.js is loading correctly
- Verify manifest.xml syntax

**Signature won't insert:**
- Make sure you're composing an email
- Check browser console for errors
- Ensure Office.js permissions are granted

## Development

To modify the add-in:
1. Edit the HTML/CSS/JS files
2. Reload the add-in in Outlook (may require restarting Outlook)
3. Test in different Outlook clients

## License

This project is provided as-is for educational and commercial use.
