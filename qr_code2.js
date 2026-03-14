const scannerStyles = `
    .btn-scan {
        margin-top: 15px;
        background: var(--primary, #5d0038);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
    }

    #scanner-modal {
        display: none; 
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.6); 
        backdrop-filter: blur(8px); 
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 15px;
        position: relative;
        width: 90%;
        max-width: 400px;
        text-align: center;
    }

    #reader {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        border: none !important;
    }

    .close-btn {
        position: absolute;
        top: 15px; right: 15px;
        background: #5d0038;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px; height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
`;

// Create style tag and add to head
const styleSheet = document.createElement("style");
styleSheet.innerText = scannerStyles;
document.head.appendChild(styleSheet);

if (typeof Html5QrcodeScanner === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/html5-qrcode";
    
    script.onload = () => {
        console.log("Library loaded. Patching HTTPS check for local testing...");
        // This keeps the "Magic" patch just in case HTTPS is still propagating
        if (typeof Html5QrcodeScanner !== 'undefined') {
            Html5QrcodeScanner.prototype.isHttpsOrLocalhost = () => true;
        }
        if (typeof Html5Qrcode !== 'undefined') {
            Html5Qrcode.prototype.isHttpsOrLocalhost = () => true;
        }
    };
    document.head.appendChild(script);
}

let html5QrcodeScanner = null;

function openScanner() {
    // 1. Check if the site is currently HTTP
    if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
        // Ask the user for permission to reload
        const confirmSwitch = confirm("Camera access requires a secure connection. Would you like to reload this page as HTTPS?\n\n(Note: If you see a 'Connection not private' warning, click 'Advanced' and then 'Proceed'.)");
        
        if (confirmSwitch) {
            window.location.href = window.location.href.replace("http:", "https:");
            return; // Stop execution so the scanner doesn't try to open on HTTP
        } else {
            return; // User cancelled, do nothing
        }
    }

    // 2. Original Scanner Logic (Runs only if already on HTTPS)
    const modal = document.getElementById('scanner-modal');
    if (!modal) {
        console.error("Error: #scanner-modal not found.");
        return;
    }

    if (typeof Html5QrcodeScanner === 'undefined') {
        alert("Camera library is loading... please click again in 1 second.");
        return;
    }

    modal.style.display = 'flex';
    
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: {width: 250, height: 250},
            aspectRatio: 1.0 
        });
    }

    html5QrcodeScanner.render(onScanSuccess);
}

function onScanSuccess(decodedText) {
    // Find input by placeholder (ID-independent)
    const voucherInput = Array.from(document.getElementsByTagName('input'))
                              .find(i => i.placeholder === "Place Voucher Code Here");

    if (voucherInput) {
        voucherInput.value = decodedText;
        voucherInput.dispatchEvent(new Event('input', { bubbles: true }));
        voucherInput.dispatchEvent(new Event('change', { bubbles: true }));

        const confirmBtn = document.querySelector('.cfirmBtn');
        if (confirmBtn) {
            setTimeout(() => {
                confirmBtn.click();
            }, 200);
        }
    } else {
        console.error("Voucher input field not found!");
    }
    
    closeScanner();
}

function closeScanner() {
    const modal = document.getElementById('scanner-modal');
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            if (modal) modal.style.display = 'none';
        }).catch(() => {
            if (modal) modal.style.display = 'none';
        });
    } else if (modal) {
        modal.style.display = 'none';
    }
}
