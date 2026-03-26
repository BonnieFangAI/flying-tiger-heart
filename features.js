// ===== PLANE DATA =====
const PLANES = [
    { tier: 'Falcon', tierZh: '雏鹰', tierJa: 'ファルコン', tierKo: '팔콘', ftt: 10000, returnRate: 125, models: ['P-2'], color: '#8b8b8b', rarity: 60 },
    { tier: 'Iron Wing', tierZh: '铁翼', tierJa: 'アイアンウィング', tierKo: '아이언윙', ftt: 30000, returnRate: 150, models: ['P-38 Lightning'], color: '#4a90d9', rarity: 25 },
    { tier: 'Elite', tierZh: '精英', tierJa: 'エリート', tierKo: '엘리트', ftt: 90000, returnRate: 180, models: ['P-40 Warhawk'], color: '#7b61ff', rarity: 10 },
    { tier: 'Glory', tierZh: '荣耀', tierJa: 'グローリー', tierKo: '글로리', ftt: 270000, returnRate: 200, models: ['P-51 Mustang'], color: '#d4af37', rarity: 3 },
    { tier: 'Hero', tierZh: '英雄', tierJa: 'ヒーロー', tierKo: '히어로', ftt: 810000, returnRate: 250, models: ['P-61 Black Widow', 'B-17'], color: '#ff6b35', rarity: 1.5 },
    { tier: 'Ace', tierZh: '王牌', tierJa: 'エース', tierKo: '에이스', ftt: 2430000, returnRate: 300, models: ['B-25 Mitchell', 'F4U Corsair'], color: '#ff3355', rarity: 0.4 },
    { tier: 'Legendary', tierZh: '传奇', tierJa: 'レジェンダリー', tierKo: '레전더리', ftt: 7290000, returnRate: 350, models: ['F6F Hellcat', 'F8F Bearcat'], color: '#ff00ff', rarity: 0.1 }
];

// ===== COUNTDOWN TIMER (disabled) =====
function initCountdown() {
    // Countdown removed per request
}

// ===== WALLET CONNECTION =====
function initWallet() {
    const btn = document.getElementById('walletBtn');
    const modal = document.getElementById('walletModal');
    const closeBtn = document.getElementById('walletModalClose');
    const status = document.getElementById('walletStatus');
    let connected = false;
    
    btn.addEventListener('click', () => {
        if (connected) {
            modal.classList.add('active');
        } else {
            modal.classList.add('active');
        }
    });
    
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    document.querySelectorAll('.wallet-option').forEach(opt => {
        opt.addEventListener('click', async () => {
            const walletName = opt.dataset.wallet;
            
            // Check if wallet is available
            if (walletName === 'phantom' && window.solana?.isPhantom) {
                try {
                    const resp = await window.solana.connect();
                    showConnected(resp.publicKey.toString());
                } catch (err) {
                    showDemoWallet(walletName);
                }
            } else {
                showDemoWallet(walletName);
            }
        });
    });
    
    function showDemoWallet(name) {
        // Demo mode - simulate connection
        const fakeAddr = '0x' + Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...';
        showConnected(fakeAddr);
    }
    
    function showConnected(addr) {
        connected = true;
        const shortAddr = addr.length > 12 ? addr.slice(0, 6) + '...' + addr.slice(-4) : addr;
        document.getElementById('walletAddress').textContent = shortAddr;
        status.style.display = 'flex';
        document.querySelector('.wallet-options').style.display = 'none';
        btn.innerHTML = `<span class="wallet-icon">◈</span> ${shortAddr}`;
        btn.classList.add('connected');
        
        // Fill form wallet field if empty
        const walletInput = document.getElementById('regWallet');
        if (walletInput && !walletInput.value) {
            walletInput.value = addr;
        }
    }
    
    document.getElementById('walletDisconnect')?.addEventListener('click', () => {
        connected = false;
        status.style.display = 'none';
        document.querySelector('.wallet-options').style.display = 'flex';
        btn.innerHTML = '<span class="wallet-icon">◈</span> Connect Wallet';
        btn.classList.remove('connected');
        modal.classList.remove('active');
    });
}

// ===== BLIND BOX SYSTEM =====
function initBlindBox() {
    let openCount = 0;
    let totalFTT = 0;
    const boxes = document.querySelectorAll('.blindbox');
    const history = [];
    
    function getRandomPlane() {
        const roll = Math.random() * 100;
        let cumulative = 0;
        for (const plane of PLANES) {
            cumulative += plane.rarity;
            if (roll <= cumulative) return plane;
        }
        return PLANES[0]; // fallback
    }
    
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            if (box.classList.contains('opened')) return;
            
            const plane = getRandomPlane();
            box.classList.add('opening');
            
            // Shake animation
            setTimeout(() => {
                box.classList.remove('opening');
                box.classList.add('opened');
                
                // Fill result
                const back = box.querySelector('.blindbox-back');
                back.querySelector('.blindbox-result-icon').textContent = '✈️';
                back.querySelector('.blindbox-result-tier').textContent = plane.tier;
                back.querySelector('.blindbox-result-tier').style.color = plane.color;
                back.querySelector('.blindbox-result-name').textContent = plane.models[0];
                back.querySelector('.blindbox-result-ftt').textContent = `${plane.ftt.toLocaleString()} FTT`;
                
                // Glow color based on rarity
                back.style.borderColor = plane.color;
                back.style.boxShadow = `0 0 30px ${plane.color}40`;
                
                openCount++;
                totalFTT += plane.ftt;
                document.getElementById('boxOpenCount').textContent = openCount;
                document.getElementById('boxTotalFTT').textContent = totalFTT.toLocaleString();
                
                // Add to history
                history.unshift(plane);
                updateHistory();
                
                // Confetti for rare pulls
                if (PLANES.indexOf(plane) >= 3) {
                    createConfetti(box);
                }
            }, 800);
        });
    });
    
    // Reset button
    document.getElementById('blindboxReset')?.addEventListener('click', () => {
        openCount = 0;
        totalFTT = 0;
        document.getElementById('boxOpenCount').textContent = '0';
        document.getElementById('boxTotalFTT').textContent = '0';
        
        boxes.forEach(box => {
            box.classList.remove('opened', 'opening');
        });
    });
    
    function updateHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;
        list.innerHTML = history.slice(0, 10).map(p => 
            `<div class="history-item" style="border-left: 3px solid ${p.color}">
                <span class="history-tier">${p.tier}</span>
                <span class="history-model">${p.models[0]}</span>
                <span class="history-ftt">${p.ftt.toLocaleString()} FTT</span>
            </div>`
        ).join('');
    }
    
    function createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#d4af37', '#f0d060', '#ff6b35', '#7b61ff', '#ff3355'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 9999;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${Math.random() * 1 + 0.5}s ease-out forwards;
                --tx: ${(Math.random() - 0.5) * 300}px;
                --ty: ${Math.random() * -200 - 50}px;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 1500);
        }
    }
}

// ===== EARNINGS CALCULATOR =====
function initCalculator() {
    const inputs = ['calcPlane', 'calcRank', 'calcCorps', 'calcCount'];
    
    function calculate() {
        const planeIdx = parseInt(document.getElementById('calcPlane').value);
        const rankBoost = parseInt(document.getElementById('calcRank').value);
        const corpsBoost = parseInt(document.getElementById('calcCorps').value);
        const count = parseInt(document.getElementById('calcCount').value) || 1;
        
        const plane = PLANES[planeIdx];
        const baseFTT = plane.ftt;
        const totalBoost = 1 + (rankBoost + corpsBoost) / 100;
        const dailyPerPlane = baseFTT * totalBoost;
        const dailyTotal = dailyPerPlane * count;
        const monthlyTotal = dailyTotal * 30;
        const monthlyUSDT = monthlyTotal * 0.0025;
        const totalReturn = plane.returnRate + rankBoost + corpsBoost;
        
        animateNumber('calcDaily', dailyTotal);
        animateNumber('calcMonthly', monthlyTotal);
        document.getElementById('calcUSDT').textContent = `$${monthlyUSDT.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        document.getElementById('calcReturn').textContent = `${totalReturn}%`;
    }
    
    function animateNumber(id, target) {
        const el = document.getElementById(id);
        const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
        const diff = target - current;
        const steps = 20;
        const stepSize = diff / steps;
        let step = 0;
        
        const anim = setInterval(() => {
            step++;
            const val = Math.round(current + stepSize * step);
            el.textContent = val.toLocaleString();
            if (step >= steps) {
                el.textContent = Math.round(target).toLocaleString();
                clearInterval(anim);
            }
        }, 30);
    }
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculate);
        if (el) el.addEventListener('input', calculate);
    });
    
    calculate(); // Initial calculation
}

// ===== DONUT CHART (Canvas) =====
function initDonutChart() {
    const canvas = document.getElementById('tokenCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = 120, centerY = 120, radius = 85, lineWidth = 28;
    
    const segments = [
        { pct: 70, color: '#d4af37', label: 'Ecosystem' },
        { pct: 10, color: '#b8860b', label: 'Community' },
        { pct: 10, color: '#8b6914', label: 'Team' },
        { pct: 5, color: '#6b4f10', label: 'Investors' },
        { pct: 5, color: '#4a370b', label: 'Advisors' }
    ];
    
    let currentAngle = -Math.PI / 2;
    let animProgress = 0;
    
    function draw() {
        ctx.clearRect(0, 0, 240, 240);
        let angle = -Math.PI / 2;
        
        segments.forEach((seg, i) => {
            const segAngle = (seg.pct / 100) * Math.PI * 2 * Math.min(animProgress, 1);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angle, angle + segAngle);
            ctx.strokeStyle = seg.color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'butt';
            ctx.stroke();
            angle += (seg.pct / 100) * Math.PI * 2 * Math.min(animProgress, 1);
        });
        
        if (animProgress < 1) {
            animProgress += 0.03;
            requestAnimationFrame(draw);
        }
    }
    
    // Start animation when visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animProgress = 0;
            draw();
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    
    observer.observe(canvas);
    
    // Hover effect on legend
    document.querySelectorAll('.legend-item').forEach((item, i) => {
        item.addEventListener('mouseenter', () => {
            // Redraw with highlight
            ctx.clearRect(0, 0, 240, 240);
            let angle = -Math.PI / 2;
            segments.forEach((seg, j) => {
                const segAngle = (seg.pct / 100) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, j === i ? radius + 5 : radius, angle, angle + segAngle);
                ctx.strokeStyle = seg.color;
                ctx.lineWidth = j === i ? lineWidth + 4 : lineWidth;
                ctx.globalAlpha = j === i ? 1 : 0.4;
                ctx.stroke();
                ctx.globalAlpha = 1;
                angle += segAngle;
            });
        });
        
        item.addEventListener('mouseleave', () => {
            animProgress = 1;
            draw();
        });
    });
}

// ===== PLANE DETAIL MODAL =====
function showPlaneDetail(el) {
    const tierName = el.dataset.tier;
    const planeIdx = ['falcon','ironwing','elite','glory','hero','ace','legendary'].indexOf(tierName);
    if (planeIdx === -1) return;
    
    const plane = PLANES[planeIdx];
    const modal = document.getElementById('planeModal');
    const detail = document.getElementById('planeDetail');
    
    detail.innerHTML = `
        <div class="plane-detail-header" style="border-top: 4px solid ${plane.color}">
            <div class="plane-detail-icon">✈️</div>
            <h2 style="color: ${plane.color}">${plane.tier}</h2>
            <div class="plane-detail-badge">${plane.models.join(' / ')}</div>
        </div>
        <div class="plane-detail-stats">
            <div class="pd-stat">
                <div class="pd-stat-label">Return Rate</div>
                <div class="pd-stat-value" style="color: ${plane.color}">${plane.returnRate}%</div>
            </div>
            <div class="pd-stat">
                <div class="pd-stat-label">FTT Output</div>
                <div class="pd-stat-value">${plane.ftt.toLocaleString()}</div>
            </div>
            <div class="pd-stat">
                <div class="pd-stat-label">Drop Rate</div>
                <div class="pd-stat-value">${plane.rarity}%</div>
            </div>
            <div class="pd-stat">
                <div class="pd-stat-label">USDT Value</div>
                <div class="pd-stat-value">$${(plane.ftt * 0.0025).toLocaleString()}</div>
            </div>
        </div>
        <div class="plane-detail-bar">
            <div class="pd-bar-label">Rarity</div>
            <div class="pd-bar-track">
                <div class="pd-bar-fill" style="width: ${Math.min(plane.rarity * 1.5, 100)}%; background: ${plane.color}"></div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('planeModalClose').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

// ===== REGISTRATION FORM =====
function initRegistration() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            telegram: document.getElementById('regTelegram').value,
            tier: document.getElementById('regTier').value,
            wallet: document.getElementById('regWallet').value,
            timestamp: new Date().toISOString()
        };
        
        // Store locally
        const registrations = JSON.parse(localStorage.getItem('ftt-registrations') || '[]');
        registrations.push(data);
        localStorage.setItem('ftt-registrations', JSON.stringify(registrations));
        
        // Generate ID
        const id = 'FTT-' + Date.now().toString(36).toUpperCase();
        document.getElementById('regId').textContent = id;
        
        // Show success
        form.style.display = 'none';
        document.getElementById('registerSuccess').style.display = 'block';
        
        // Update counter
        const counter = document.getElementById('regCounter');
        const currentCount = parseInt(counter.textContent.replace(/,/g, ''));
        counter.textContent = (currentCount + 1).toLocaleString();
    });
}

// ===== CONFETTI KEYFRAMES =====
function addConfettiCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== INIT ALL FEATURES =====
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initWallet();
    initBlindBox();
    initCalculator();
    initDonutChart();
    initRegistration();
    addConfettiCSS();
});
