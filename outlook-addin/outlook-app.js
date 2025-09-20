// Email Signature Builder for Outlook Add-in
let currentSignature = '';

Office.onReady((info) => {
    if (info.host === Office.HostType.Outlook) {
        // Add-in is ready to use
        console.log('Email Signature Builder loaded in Outlook');

        // Set up event listeners
        setupEventListeners();

        // Generate initial preview
        generateSignature();
    }
});

function setupEventListeners() {
    // Auto-generate on input changes
    const inputs = ['sig-name', 'sig-title', 'sig-company', 'sig-email', 'sig-phone', 'sig-website'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', generateSignature);
        }
    });
}

function generateSignature() {
    const name = document.getElementById('sig-name').value.trim();
    const title = document.getElementById('sig-title').value.trim();
    const company = document.getElementById('sig-company').value.trim();
    const email = document.getElementById('sig-email').value.trim();
    const phone = document.getElementById('sig-phone').value.trim();
    const website = document.getElementById('sig-website').value.trim();

    // Generate HTML signature
    let signatureHTML = '<table border="0" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #333;">';
    signatureHTML += '<tr><td style="vertical-align: top;">';

    if (name) {
        signatureHTML += `<div style="font-weight: bold; font-size: 16px; color: #2c3e50; margin-bottom: 2px;">${escapeHtml(name)}</div>`;
    }

    if (title) {
        signatureHTML += `<div style="color: #7f8c8d; margin-bottom: 8px;">${escapeHtml(title)}</div>`;
    }

    if (company) {
        signatureHTML += `<div style="font-weight: bold; color: #3498db; margin-bottom: 10px;">${escapeHtml(company)}</div>`;
    }

    if (email) {
        signatureHTML += `<div style="margin-bottom: 3px;"><a href="mailto:${escapeHtml(email)}" style="color: #3498db; text-decoration: none;">${escapeHtml(email)}</a></div>`;
    }

    if (phone) {
        signatureHTML += `<div style="margin-bottom: 3px;"><a href="tel:${escapeHtml(phone)}" style="color: #3498db; text-decoration: none;">${escapeHtml(phone)}</a></div>`;
    }

    if (website) {
        const fullUrl = website.startsWith('http') ? website : 'https://' + website;
        signatureHTML += `<div style="margin-bottom: 3px;"><a href="${escapeHtml(fullUrl)}" style="color: #3498db; text-decoration: none;">${escapeHtml(website)}</a></div>`;
    }

    signatureHTML += '</td></tr></table>';

    currentSignature = signatureHTML;

    // Update preview
    const previewDiv = document.getElementById('signature-preview');
    previewDiv.innerHTML = signatureHTML;

    // Update HTML code display
    const htmlDiv = document.getElementById('signature-html');
    htmlDiv.textContent = signatureHTML;
    htmlDiv.style.display = 'block';
}

function insertSignature() {
    if (!currentSignature) {
        generateSignature();
    }

    if (!currentSignature) {
        alert('Please fill in at least your name and email to create a signature.');
        return;
    }

    // Get the current Outlook item
    Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            const currentBody = result.value;

            // Insert signature at the end of the body
            const newBody = currentBody + '<br><br>' + currentSignature;

            Office.context.mailbox.item.body.setAsync(newBody, {
                coercionType: Office.CoercionType.Html
            }, (setResult) => {
                if (setResult.status === Office.AsyncResultStatus.Succeeded) {
                    // Show success message
                    showNotification('Signature inserted successfully!', 'success');
                } else {
                    console.error('Error inserting signature:', setResult.error);
                    showNotification('Error inserting signature. Please try again.', 'error');
                }
            });
        } else {
            console.error('Error getting body:', result.error);
            showNotification('Error accessing email body. Please try again.', 'error');
        }
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Load saved signature data from localStorage
function loadSavedData() {
    try {
        const saved = localStorage.getItem('outlook-signature-data');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const element = document.getElementById('sig-' + key);
                if (element) {
                    element.value = data[key];
                }
            });
        }
    } catch (error) {
        console.warn('Could not load saved signature data:', error);
    }
}

// Save signature data to localStorage
function saveData() {
    try {
        const data = {
            name: document.getElementById('sig-name').value,
            title: document.getElementById('sig-title').value,
            company: document.getElementById('sig-company').value,
            email: document.getElementById('sig-email').value,
            phone: document.getElementById('sig-phone').value,
            website: document.getElementById('sig-website').value
        };
        localStorage.setItem('outlook-signature-data', JSON.stringify(data));
    } catch (error) {
        console.warn('Could not save signature data:', error);
    }
}

// Auto-save on input changes
setInterval(saveData, 1000);

// Load saved data when the add-in loads
document.addEventListener('DOMContentLoaded', loadSavedData);
