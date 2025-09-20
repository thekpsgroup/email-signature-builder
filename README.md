# ✨ Modern Email Signature Builder

A super sleek, bug-free, and easy-to-use email signature builder with Outlook integration. Much more modern and powerful than WiseStamp!

![Modern UI](https://img.shields.io/badge/UI-Modern-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Outlook Integration](https://img.shields.io/badge/Outlook-Integrated-green)
![Auto Save](https://img.shields.io/badge/Auto_Save-Enabled-green)
![Drag & Drop](https://img.shields.io/badge/Drag_&_Drop-Supported-orange)

## 🚀 Quick Start (Super Easy!)

### Option 1: One-Click Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/email-signature-app)

### Option 2: Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/email-signature-app)

### Option 3: Run Locally

```bash
# Clone the repo
git clone https://github.com/your-username/email-signature-app.git
cd email-signature-app

# Install and run
npm install
npm run dev

# Open http://localhost:5173
```

### Option 4: Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build

# Or manually:
docker build -t email-signature-app .
docker run -p 3000:80 email-signature-app
```

## 🎯 Features (Why It's Better Than WiseStamp)

### ✨ **Super Sleek UI**
- Modern gradient design with smooth animations
- Responsive layout that works perfectly on all devices
- Beautiful toast notifications and loading states
- Professional color schemes and typography

### 🔧 **Advanced Signature Builder**
- **Drag & Drop Elements**: Reorder signature components by dragging
- **Smart Element Control**: Toggle visibility with checkboxes
- **Live Preview**: See changes instantly as you type
- **4 Professional Templates**: Modern, Corporate, Creative, Minimalist
- **Custom Color Picker**: Fully customize colors for branding

### 💾 **Auto-Save & Recovery**
- **Automatic Saving**: Your work saves every second
- **Data Persistence**: Never lose your work - recovers on reload
- **Status Indicators**: See when data was last saved
- **Unsaved Changes Warning**: Know when you have unsaved work

### 📧 **Outlook Integration**
- **Professional Add-in**: Deployable across all Outlook clients
- **One-Click Insertion**: Insert signatures directly into emails
- **Task Pane Interface**: Clean integration with Outlook UI
- **Office.js Integration**: Robust Microsoft Office integration

### 🚀 **Easy Deployment Options**

#### **Vercel (Recommended for Speed)**
```bash
npm i -g vercel
vercel --prod
```

#### **Netlify (Great for Teams)**
```bash
npm run build
# Drag dist/ folder to Netlify dashboard
```

#### **Docker (For Enterprise)**
```bash
docker-compose up --build
# Access at http://localhost:3000
```

#### **GitHub Pages (Free)**
```bash
npm run build
# Enable GitHub Pages in repository settings
```

## 📱 How to Use (Super Simple!)

1. **Fill in your details** in the form
2. **Drag elements** to reorder your signature
3. **Choose a template** from the Templates tab
4. **Customize colors** with the color picker
5. **Copy HTML** or use Outlook integration

### 🎨 Template Gallery
- **Modern Professional**: Clean blue design
- **Corporate Blue**: Traditional business look
- **Creative Purple**: Vibrant and modern
- **Minimalist Gray**: Simple and elegant

## 🔧 Outlook Add-in Setup

### For Development Testing:
```bash
cd outlook-addin
npm install
npm run dev  # Serves on port 3000
```

1. Open Outlook Desktop/Web
2. Go to **Insert > Add-ins > Add a custom add-in**
3. Select **Add from file** and choose `outlook-addin/manifest.xml`
4. The "Insert Signature" button appears in your ribbon!

### For Production Deployment:
- Host the add-in files on HTTPS
- Update manifest.xml URLs
- Submit to Microsoft AppSource (optional)

## 🛠️ Tech Stack (Modern & Robust)

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Modern CSS with CSS Variables
- **State Management**: React Hooks with localStorage
- **Deployment**: Multi-platform (Vercel, Netlify, Docker, GitHub Pages)
- **Outlook Integration**: Office.js API
- **Build Tools**: Vite for lightning-fast builds

## 📊 Performance & Security

- **Lightning Fast**: Vite-powered builds
- **Security Headers**: XSS protection, CSP policies
- **Offline Capable**: Works without internet (after load)
- **Data Privacy**: All data stored locally in browser
- **No External APIs**: Zero third-party dependencies for core functionality

## 🎯 Comparison: WiseStamp vs Modern Email Signature Builder

| Feature | WiseStamp | Our App ✨ |
|---------|-----------|------------|
| UI Design | Basic | Super Modern |
| Drag & Drop | ❌ | ✅ |
| Templates | Limited | 4 Professional |
| Auto-Save | ❌ | ✅ |
| Outlook Integration | Browser Extension | Professional Add-in |
| Custom Colors | Basic | Full Color Picker |
| Error Handling | Basic | Comprehensive |
| Deployment | Manual | One-Click |
| Mobile Support | Limited | Fully Responsive |
| Data Persistence | ❌ | ✅ |

## 🚀 Contributing

```bash
# Fork, clone, and install
git clone https://github.com/your-username/email-signature-app.git
cd email-signature-app
npm install

# Start development
npm run dev

# Run tests and linting
npm run lint
```

## 📝 License

MIT License - Free for personal and commercial use.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/email-signature-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/email-signature-app/discussions)
- **Documentation**: See `/outlook-addin/README.md` for Outlook setup

---

**Made with ❤️ for modern professionals who deserve better than outdated email signature tools!**
