import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface SignatureData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
  address: string;
  logo?: string;
}

interface ImageEffects {
  // Filters
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  opacity: number;

  // Transforms
  scale: number;
  rotate: number;
  skewX: number;
  skewY: number;

  // Styles
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  boxShadow: string;
  backgroundColor: string;

  // Animations
  hoverEffect: 'none' | 'glow' | 'bounce' | 'rotate' | 'scale' | 'pulse';
  animationDuration: number;
}

interface SignatureElement {
  id: string;
  type: 'name' | 'title' | 'company' | 'email' | 'phone' | 'website' | 'social' | 'address' | 'logo' | 'spacer';
  enabled: boolean;
  order: number;
}

const defaultElements: SignatureElement[] = [
  { id: 'name', type: 'name', enabled: true, order: 1 },
  { id: 'title', type: 'title', enabled: true, order: 2 },
  { id: 'company', type: 'company', enabled: true, order: 3 },
  { id: 'spacer1', type: 'spacer', enabled: true, order: 4 },
  { id: 'email', type: 'email', enabled: true, order: 5 },
  { id: 'phone', type: 'phone', enabled: true, order: 6 },
  { id: 'website', type: 'website', enabled: true, order: 7 },
  { id: 'spacer2', type: 'spacer', enabled: true, order: 8 },
  { id: 'address', type: 'address', enabled: true, order: 9 },
  { id: 'spacer3', type: 'spacer', enabled: true, order: 10 },
  { id: 'social', type: 'social', enabled: true, order: 11 },
];

function App() {
  const [signature, setSignature] = useState<SignatureData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<SignatureData>>({});

  const [elements, setElements] = useState<SignatureElement[]>(defaultElements);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'templates' | 'effects'>('editor');
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    text: '#1e293b',
    accent: '#3498db'
  });

  // Image effects state
  const [imageEffects, setImageEffects] = useState<ImageEffects>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
    scale: 100,
    rotate: 0,
    skewX: 0,
    skewY: 0,
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    hoverEffect: 'none',
    animationDuration: 0.3
  });

  // New state for enhanced UX
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNotification, setShowNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const dragRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const validateField = (field: keyof SignatureData, value: string) => {
    const errors: Partial<SignatureData> = { ...formErrors };

    switch (field) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
      }
      case 'website':
        if (value && !value.startsWith('http') && !value.startsWith('https')) {
          // Auto-add https if missing
          const correctedValue = 'https://' + value;
          setSignature(prev => ({ ...prev, [field]: correctedValue }));
          delete errors.website;
          return;
        }
        delete errors.website;
        break;
      case 'linkedin':
      case 'twitter':
        if (value && !value.startsWith('http') && !value.startsWith('https') && !value.startsWith('@')) {
          errors[field] = 'URL should start with http:// or https://';
        } else {
          delete errors[field];
        }
        break;
      default:
        delete errors[field];
    }

    setFormErrors(errors);
  };

  const updateSignature = (field: keyof SignatureData, value: string) => {
    setSignature(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  // One-click demo data loader
  const loadDemoData = () => {
    const demoData: SignatureData = {
      name: 'Sarah Johnson',
      title: 'Senior Marketing Director',
      company: 'TechCorp Solutions',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      website: 'www.techcorp.com',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjtech',
      address: '123 Innovation Drive, Tech City, TC 12345'
    };

    setSignature(demoData);
    setHasUnsavedChanges(true);
    triggerAutoSave();
    showToast('Demo data loaded! Feel free to customize.', 'success');
  };

  // Enhanced notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(saveData, 1000);
  };

  const saveData = async () => {
    try {
      const data = {
        signature,
        elements: elements.map(el => ({ ...el, enabled: el.enabled })), // Save enabled state
        selectedTemplate,
        customColors,
        imageEffects,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('email-signature-app-data', JSON.stringify(data));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      showToast('Saved automatically', 'success');
    } catch (error) {
      console.error('Failed to save data:', error);
      showToast('Failed to save changes', 'error');
    }
  };

  const loadData = () => {
    try {
      const saved = localStorage.getItem('email-signature-app-data');
      if (saved) {
        const data = JSON.parse(saved);
        setSignature(data.signature || signature);
        setElements(data.elements || defaultElements);
        setSelectedTemplate(data.selectedTemplate || 'modern');
        setCustomColors(data.customColors || customColors);
        setImageEffects(data.imageEffects || imageEffects);
        if (data.lastSaved) {
          setLastSaved(new Date(data.lastSaved));
        }
        showToast('Data loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
      showToast('Failed to load saved data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveData();
        showToast('Saved manually!', 'success');
      }

      // Ctrl/Cmd + D to load demo
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        loadDemoData();
      }

      // Ctrl/Cmd + C to copy signature (when in preview tab)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && activeTab === 'preview') {
        e.preventDefault();
        copyToClipboard();
      }

      // Tab switching with number keys
      if (e.key >= '1' && e.key <= '4') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = ['editor', 'templates', 'effects', 'preview'];
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex] as 'editor' | 'preview' | 'templates' | 'effects');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

  // Mobile detection and handling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced copy with mobile support
  const enhancedCopyToClipboard = async () => {
    try {
      if (navigator.share && isMobile) {
        // Use native share on mobile
        await navigator.share({
          title: 'Email Signature',
          text: generateSignatureHTML(),
        });
        showToast('Signature shared!', 'success');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(generateSignatureHTML());
        showToast('Signature copied to clipboard!', 'success');
      }
    } catch (err) {
      console.error('Failed to copy/share: ', err);
      showToast('Failed to copy signature. Please try again.', 'error');
    }
  };

  // Export signature as file
  const exportSignature = () => {
    const signature = generateSignatureHTML();
    const blob = new Blob([signature], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-signature.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Signature exported as HTML file!', 'success');
  };

  // Update image effects
  const updateImageEffect = (effect: keyof ImageEffects, value: string | number) => {
    setImageEffects(prev => ({ ...prev, [effect]: value }));
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  // Reset image effects to default
  const resetImageEffects = () => {
    setImageEffects({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hueRotate: 0,
      blur: 0,
      opacity: 100,
      scale: 100,
      rotate: 0,
      skewX: 0,
      skewY: 0,
      borderRadius: 8,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      hoverEffect: 'none',
      animationDuration: 0.3
    });
    setHasUnsavedChanges(true);
    triggerAutoSave();
    showToast('Image effects reset!', 'info');
  };

  // Apply preset effects
  const applyPresetEffect = (preset: string) => {
    const presets: Record<string, Partial<ImageEffects>> = {
      'vintage': {
        brightness: 110,
        contrast: 120,
        saturation: 85,
        hueRotate: 15,
        borderRadius: 12,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        hoverEffect: 'glow'
      },
      'modern': {
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        hoverEffect: 'scale'
      },
      'cyberpunk': {
        brightness: 120,
        contrast: 130,
        saturation: 150,
        hueRotate: 180,
        borderRadius: 4,
        boxShadow: '0 0 20px rgba(255,0,255,0.3)',
        backgroundColor: 'rgba(0,255,255,0.1)',
        hoverEffect: 'pulse'
      },
      'minimal': {
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        hoverEffect: 'bounce'
      },
      'grayscale': {
        saturation: 0,
        contrast: 110,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        hoverEffect: 'rotate'
      }
    };

    if (presets[preset]) {
      setImageEffects(prev => ({ ...prev, ...presets[preset] }));
      setHasUnsavedChanges(true);
      triggerAutoSave();
      showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} effect applied!`, 'success');
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('email-signature-app-data');
      setSignature({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        linkedin: '',
        twitter: '',
        address: '',
      });
      setElements(defaultElements.map(el => ({ ...el, enabled: true })));
      setSelectedTemplate('modern');
      setCustomColors({
        primary: '#6366f1',
        text: '#1e293b',
        accent: '#3498db'
      });
      setImageEffects({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hueRotate: 0,
        blur: 0,
        opacity: 100,
        scale: 100,
        rotate: 0,
        skewX: 0,
        skewY: 0,
        borderRadius: 8,
        borderWidth: 0,
        borderColor: '#e2e8f0',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        hoverEffect: 'none',
        animationDuration: 0.3
      });
      setLastSaved(null);
      setHasUnsavedChanges(false);
      showToast('All data cleared!', 'info');
    }
  };

  const toggleElement = (elementId: string) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, enabled: !el.enabled } : el
    ));
  };

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElement(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedElement || draggedElement === targetId) return;

    const draggedIndex = elements.findIndex(el => el.id === draggedElement);
    const targetIndex = elements.findIndex(el => el.id === targetId);

    const newElements = [...elements];
    const [draggedItem] = newElements.splice(draggedIndex, 1);
    newElements.splice(targetIndex, 0, draggedItem);

    // Update order numbers
    newElements.forEach((el, index) => {
      el.order = index + 1;
    });

    setElements(newElements);
    setDraggedElement(null);
  };

  const templates = {
    modern: {
      name: 'Modern Professional',
      colors: { primary: '#6366f1', text: '#1e293b', accent: '#3498db' }
    },
    corporate: {
      name: 'Corporate Blue',
      colors: { primary: '#1e40af', text: '#1e293b', accent: '#3b82f6' }
    },
    creative: {
      name: 'Creative Purple',
      colors: { primary: '#8b5cf6', text: '#1e293b', accent: '#a855f7' }
    },
    minimalist: {
      name: 'Minimalist Gray',
      colors: { primary: '#6b7280', text: '#1e293b', accent: '#9ca3af' }
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    setSelectedTemplate(templateKey);
    setCustomColors(template.colors);
  };

  const generateSignatureHTML = () => {
    const { name, title, company, email, phone, website, linkedin, twitter, address, logo } = signature;
    const enabledElements = elements.filter(el => el.enabled).sort((a, b) => a.order - b.order);

    // Generate CSS styles for image effects
    const imageStyles = `
      filter: brightness(${imageEffects.brightness}%) contrast(${imageEffects.contrast}%) saturate(${imageEffects.saturation}%) hue-rotate(${imageEffects.hueRotate}deg) blur(${imageEffects.blur}px);
      opacity: ${imageEffects.opacity}%;
      transform: scale(${imageEffects.scale}%) rotate(${imageEffects.rotate}deg) skew(${imageEffects.skewX}deg, ${imageEffects.skewY}deg);
      border-radius: ${imageEffects.borderRadius}px;
      border: ${imageEffects.borderWidth}px solid ${imageEffects.borderColor};
      box-shadow: ${imageEffects.boxShadow};
      background-color: ${imageEffects.backgroundColor};
      transition: all ${imageEffects.animationDuration}s ease;
    `;

    // Generate hover effect styles
    const hoverStyles = imageEffects.hoverEffect !== 'none' ? `
      &:hover {
        ${imageEffects.hoverEffect === 'glow' ? `box-shadow: ${imageEffects.boxShadow}, 0 0 20px rgba(99, 102, 241, 0.4);` : ''}
        ${imageEffects.hoverEffect === 'bounce' ? `animation: bounce 0.6s ease;` : ''}
        ${imageEffects.hoverEffect === 'rotate' ? `transform: scale(${imageEffects.scale}%) rotate(${imageEffects.rotate + 5}deg) skew(${imageEffects.skewX}deg, ${imageEffects.skewY}deg);` : ''}
        ${imageEffects.hoverEffect === 'scale' ? `transform: scale(${Math.min(imageEffects.scale + 10, 150)}%) rotate(${imageEffects.rotate}deg) skew(${imageEffects.skewX}deg, ${imageEffects.skewY}deg);` : ''}
        ${imageEffects.hoverEffect === 'pulse' ? `animation: pulse 1s infinite;` : ''}
      }
    ` : '';

    const renderElement = (element: SignatureElement) => {
      switch (element.type) {
        case 'name':
          return name ? `<div style="font-weight: bold; font-size: 16px; color: ${customColors.text}; margin-bottom: 2px;">${name}</div>` : '';
        case 'title':
          return title ? `<div style="color: #7f8c8d; margin-bottom: 8px;">${title}</div>` : '';
        case 'company':
          return company ? `<div style="font-weight: bold; color: ${customColors.primary}; margin-bottom: 10px;">${company}</div>` : '';
        case 'email':
          return email ? `<div style="margin-bottom: 3px;"><a href="mailto:${email}" style="color: ${customColors.accent}; text-decoration: none;">${email}</a></div>` : '';
        case 'phone':
          return phone ? `<div style="margin-bottom: 3px;"><a href="tel:${phone}" style="color: ${customColors.accent}; text-decoration: none;">${phone}</a></div>` : '';
        case 'website':
          return website ? `<div style="margin-bottom: 3px;"><a href="${website.startsWith('http') ? website : 'https://' + website}" style="color: ${customColors.accent}; text-decoration: none;">${website}</a></div>` : '';
        case 'address':
          return address ? `<div style="margin-bottom: 8px; color: #7f8c8d;">${address}</div>` : '';
        case 'social':
          return (linkedin || twitter) ? `
            <div style="margin-top: 10px;">
              ${linkedin ? `<a href="${linkedin}" style="margin-right: 10px; text-decoration: none;"><span style="color: #0077b5; font-size: 18px;">in</span></a>` : ''}
              ${twitter ? `<a href="${twitter}" style="text-decoration: none;"><span style="color: #1da1f2; font-size: 18px;">t</span></a>` : ''}
            </div>
          ` : '';
        case 'spacer':
          return '<div style="height: 8px;"></div>';
        default:
          return '';
      }
    };

    const hasLogo = enabledElements.some(el => el.type === 'logo') && logo;

    return `
<table border="0" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: ${customColors.text};">
  <tr>
    ${hasLogo ? `<td style="padding-right: 15px; vertical-align: top;"><img src="${logo}" alt="${company}" style="max-width: 120px; height: auto; ${imageStyles}"></td>` : ''}
    <td style="vertical-align: top;">
      ${enabledElements.map(renderElement).filter(Boolean).join('')}
    </td>
  </tr>
</table>

<style>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.signature-logo:hover {
  ${hoverStyles}
}
</style>
    `.trim();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateSignatureHTML());
      showToast('Signature copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard. Please try again.', 'error');
    }
  };

  // Enhanced element toggle with auto-save
  const toggleElement = (elementId: string) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, enabled: !el.enabled } : el
    ));
    setHasUnsavedChanges(true);
    triggerAutoSave();
  };

  // Enhanced template application with feedback
  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    setSelectedTemplate(templateKey);
    setCustomColors(template.colors);
    setHasUnsavedChanges(true);
    triggerAutoSave();
    showToast(`Applied ${template.name} template`, 'success');
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading your signature...</h2>
          <p>Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Floating particles for visual appeal */}
      <div className="floating-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }} />
        ))}
      </div>

      <header className="header">
        <h1 className="title">✨ Modern Email Signature Builder</h1>
        <p className="subtitle">Create professional signatures that work across all email clients</p>

        {/* Status indicators */}
        <div className="status-bar">
          {lastSaved && (
            <div className="status-item">
              <span className="status-icon">💾</span>
              <span className="status-text">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="status-item unsaved">
              <span className="status-icon">⏳</span>
              <span className="status-text">Unsaved changes</span>
            </div>
          )}
          {!isMobile && (
            <div className="status-item help">
              <span className="status-icon">⌨️</span>
              <span className="status-text">
                Ctrl+S: Save • Ctrl+D: Demo • 1-4: Switch tabs
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Toast notifications */}
      {showNotification && (
        <div className={`toast toast-${showNotification.type}`}>
          <span className="toast-icon">
            {showNotification.type === 'success' && '✅'}
            {showNotification.type === 'error' && '❌'}
            {showNotification.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{showNotification.message}</span>
        </div>
      )}

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            📝 Editor
          </button>
          <button
            className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            🎨 Templates
          </button>
          <button
            className={`tab ${activeTab === 'effects' ? 'active' : ''}`}
            onClick={() => setActiveTab('effects')}
          >
            ✨ Effects
          </button>
          <button
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview
          </button>
        </div>

        <div className="content">
          {activeTab === 'editor' ? (
            <div className="editor">
              <div className="editor-layout">
                <div className="form-section">
                  <div className="form-header">
                    <h3>📝 Basic Information</h3>
                    <button className="demo-btn" onClick={loadDemoData}>
                      🎯 Load Demo Data
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={signature.name}
                        onChange={(e) => updateSignature('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        value={signature.title}
                        onChange={(e) => updateSignature('title', e.target.value)}
                        placeholder="Senior Developer"
                      />
                    </div>

                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={signature.company}
                        onChange={(e) => updateSignature('company', e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={signature.email}
                        onChange={(e) => updateSignature('email', e.target.value)}
                        placeholder="john.doe@company.com"
                        className={formErrors.email ? 'error' : ''}
                      />
                      {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={signature.phone}
                        onChange={(e) => updateSignature('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        value={signature.website}
                        onChange={(e) => updateSignature('website', e.target.value)}
                        placeholder="www.company.com"
                        className={formErrors.website ? 'error' : ''}
                      />
                      {formErrors.website && <span className="error-message">{formErrors.website}</span>}
                    </div>

                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        value={signature.linkedin}
                        onChange={(e) => updateSignature('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                        className={formErrors.linkedin ? 'error' : ''}
                      />
                      {formErrors.linkedin && <span className="error-message">{formErrors.linkedin}</span>}
                    </div>

                    <div className="form-group">
                      <label>Twitter</label>
                      <input
                        type="url"
                        value={signature.twitter}
                        onChange={(e) => updateSignature('twitter', e.target.value)}
                        placeholder="https://twitter.com/johndoe"
                        className={formErrors.twitter ? 'error' : ''}
                      />
                      {formErrors.twitter && <span className="error-message">{formErrors.twitter}</span>}
                    </div>

                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        value={signature.address}
                        onChange={(e) => updateSignature('address', e.target.value)}
                        placeholder="123 Business St, City, State 12345"
                        rows={2}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Company Logo URL (optional)</label>
                      <input
                        type="url"
                        value={signature.logo || ''}
                        onChange={(e) => updateSignature('logo', e.target.value)}
                        placeholder="https://company.com/logo.png"
                      />
                    </div>
                  </div>
                </div>

                <div className="elements-section">
                  <h3>🔧 Signature Elements</h3>
                  <p className="section-description">Drag and drop to reorder, toggle visibility</p>
                  <div className="elements-list" ref={dragRef}>
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`element-item ${element.enabled ? 'enabled' : 'disabled'} ${draggedElement === element.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, element.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, element.id)}
                      >
                        <div className="element-controls">
                          <input
                            type="checkbox"
                            checked={element.enabled}
                            onChange={() => toggleElement(element.id)}
                          />
                          <span className="drag-handle">⋮⋮</span>
                        </div>
                        <div className="element-label">
                          {element.type === 'name' && '👤 Name'}
                          {element.type === 'title' && '💼 Job Title'}
                          {element.type === 'company' && '🏢 Company'}
                          {element.type === 'email' && '📧 Email'}
                          {element.type === 'phone' && '📞 Phone'}
                          {element.type === 'website' && '🌐 Website'}
                          {element.type === 'address' && '📍 Address'}
                          {element.type === 'social' && '🔗 Social Links'}
                          {element.type === 'spacer' && '📏 Spacer'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'templates' ? (
            <div className="templates">
              <h3>🎨 Choose a Template</h3>
              <div className="templates-grid">
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`template-card ${selectedTemplate === key ? 'selected' : ''}`}
                    onClick={() => applyTemplate(key)}
                  >
                    <div className="template-preview">
                      <div
                        className="color-sample"
                        style={{ backgroundColor: template.colors.primary }}
                      ></div>
                      <div
                        className="color-sample"
                        style={{ backgroundColor: template.colors.accent }}
                      ></div>
                    </div>
                    <h4>{template.name}</h4>
                  </div>
                ))}
              </div>

              <div className="custom-colors">
                <h4>🎨 Custom Colors</h4>
                <div className="color-pickers">
                  <div className="color-group">
                    <label>Primary</label>
                    <input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                    />
                  </div>
                  <div className="color-group">
                    <label>Text</label>
                    <input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, text: e.target.value }))}
                    />
                  </div>
                  <div className="color-group">
                    <label>Accent</label>
                    <input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'effects' ? (
            <div className="effects">
              <div className="effects-header">
                <h3>✨ Image Effects</h3>
                <div className="effects-actions">
                  <button className="reset-btn" onClick={resetImageEffects}>
                    🔄 Reset Effects
                  </button>
                </div>
              </div>

              <div className="effects-layout">
                {/* Presets */}
                <div className="effects-section">
                  <h4>🎭 Effect Presets</h4>
                  <div className="presets-grid">
                    {['vintage', 'modern', 'cyberpunk', 'minimal', 'grayscale'].map(preset => (
                      <button
                        key={preset}
                        className="preset-btn"
                        onClick={() => applyPresetEffect(preset)}
                      >
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="effects-section">
                  <h4>🎨 Filters</h4>
                  <div className="effects-grid">
                    <div className="effect-control">
                      <label>Brightness</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageEffects.brightness}
                        onChange={(e) => updateImageEffect('brightness', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.brightness}%</span>
                    </div>

                    <div className="effect-control">
                      <label>Contrast</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageEffects.contrast}
                        onChange={(e) => updateImageEffect('contrast', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.contrast}%</span>
                    </div>

                    <div className="effect-control">
                      <label>Saturation</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={imageEffects.saturation}
                        onChange={(e) => updateImageEffect('saturation', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.saturation}%</span>
                    </div>

                    <div className="effect-control">
                      <label>Hue Rotate</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={imageEffects.hueRotate}
                        onChange={(e) => updateImageEffect('hueRotate', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.hueRotate}°</span>
                    </div>

                    <div className="effect-control">
                      <label>Blur</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={imageEffects.blur}
                        onChange={(e) => updateImageEffect('blur', parseFloat(e.target.value))}
                      />
                      <span>{imageEffects.blur}px</span>
                    </div>

                    <div className="effect-control">
                      <label>Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={imageEffects.opacity}
                        onChange={(e) => updateImageEffect('opacity', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.opacity}%</span>
                    </div>
                  </div>
                </div>

                {/* Transforms */}
                <div className="effects-section">
                  <h4>🔄 Transforms</h4>
                  <div className="effects-grid">
                    <div className="effect-control">
                      <label>Scale</label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={imageEffects.scale}
                        onChange={(e) => updateImageEffect('scale', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.scale}%</span>
                    </div>

                    <div className="effect-control">
                      <label>Rotate</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={imageEffects.rotate}
                        onChange={(e) => updateImageEffect('rotate', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.rotate}°</span>
                    </div>

                    <div className="effect-control">
                      <label>Skew X</label>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={imageEffects.skewX}
                        onChange={(e) => updateImageEffect('skewX', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.skewX}°</span>
                    </div>

                    <div className="effect-control">
                      <label>Skew Y</label>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={imageEffects.skewY}
                        onChange={(e) => updateImageEffect('skewY', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.skewY}°</span>
                    </div>
                  </div>
                </div>

                {/* Styles */}
                <div className="effects-section">
                  <h4>🎭 Styles</h4>
                  <div className="effects-grid">
                    <div className="effect-control">
                      <label>Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={imageEffects.borderRadius}
                        onChange={(e) => updateImageEffect('borderRadius', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.borderRadius}px</span>
                    </div>

                    <div className="effect-control">
                      <label>Border Width</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={imageEffects.borderWidth}
                        onChange={(e) => updateImageEffect('borderWidth', parseInt(e.target.value))}
                      />
                      <span>{imageEffects.borderWidth}px</span>
                    </div>

                    <div className="effect-control">
                      <label>Border Color</label>
                      <input
                        type="color"
                        value={imageEffects.borderColor}
                        onChange={(e) => updateImageEffect('borderColor', e.target.value)}
                      />
                    </div>

                    <div className="effect-control">
                      <label>Background</label>
                      <input
                        type="color"
                        value={imageEffects.backgroundColor}
                        onChange={(e) => updateImageEffect('backgroundColor', e.target.value)}
                      />
                    </div>

                    <div className="effect-control">
                      <label>Box Shadow</label>
                      <select
                        value={imageEffects.boxShadow}
                        onChange={(e) => updateImageEffect('boxShadow', e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="0 2px 4px rgba(0,0,0,0.1)">Subtle</option>
                        <option value="0 4px 8px rgba(0,0,0,0.15)">Medium</option>
                        <option value="0 8px 32px rgba(0,0,0,0.2)">Large</option>
                        <option value="0 0 20px rgba(99,102,241,0.3)">Glow</option>
                      </select>
                    </div>

                    <div className="effect-control">
                      <label>Hover Effect</label>
                      <select
                        value={imageEffects.hoverEffect}
                        onChange={(e) => updateImageEffect('hoverEffect', e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="glow">Glow</option>
                        <option value="bounce">Bounce</option>
                        <option value="rotate">Rotate</option>
                        <option value="scale">Scale</option>
                        <option value="pulse">Pulse</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="effects-section">
                  <h4>👁️ Live Preview</h4>
                  <div className="effects-preview">
                    {signature.logo ? (
                      <img
                        src={signature.logo}
                        alt="Logo Preview"
                        className="preview-image"
                        style={{
                          filter: `brightness(${imageEffects.brightness}%) contrast(${imageEffects.contrast}%) saturate(${imageEffects.saturation}%) hue-rotate(${imageEffects.hueRotate}deg) blur(${imageEffects.blur}px)`,
                          opacity: imageEffects.opacity / 100,
                          transform: `scale(${imageEffects.scale / 100}) rotate(${imageEffects.rotate}deg) skew(${imageEffects.skewX}deg, ${imageEffects.skewY}deg)`,
                          borderRadius: `${imageEffects.borderRadius}px`,
                          border: `${imageEffects.borderWidth}px solid ${imageEffects.borderColor}`,
                          boxShadow: imageEffects.boxShadow,
                          backgroundColor: imageEffects.backgroundColor,
                          transition: `all ${imageEffects.animationDuration}s ease`
                        }}
                      />
                    ) : (
                      <div className="no-logo-message">
                        📷 Add a logo URL in the Editor tab to see effects preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="preview">
              <div className="preview-header">
                <h3>📧 Email Preview</h3>
                <div className="preview-actions">
                  <button className="copy-btn secondary" onClick={exportSignature}>
                    💾 Export File
                  </button>
                  <button className="copy-btn danger" onClick={clearAllData}>
                    🗑️ Clear All
                  </button>
                  <button className="copy-btn" onClick={enhancedCopyToClipboard}>
                    {isMobile ? '📱 Share Signature' : '📋 Copy HTML'}
                    <span className="keyboard-shortcut">Ctrl+C</span>
                  </button>
                </div>
              </div>

              <div className="signature-preview">
                <div dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
              </div>

              <div className="html-code">
                <h4>🔧 Raw HTML Code:</h4>
                <pre>
                  <code>{generateSignatureHTML()}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
