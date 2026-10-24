/**
 * HAR KADAM BIJLI KA - Interactive Logic & Microgrid Simulation
 * Conceived & Engineered by SOURADIP GHOSH
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // -------------------------------------------------------------
    // 1. Mobile Menu Toggle
    // -------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // -------------------------------------------------------------
    // 2. Interactive Footstep Tile Simulator (Web Audio + Ripple)
    // -------------------------------------------------------------
    let stepCount = 0;
    let totalJoules = 0;
    const stepTileBtn = document.getElementById('stepTileBtn');
    const stepRipple = document.getElementById('stepRipple');
    const liveStepCount = document.getElementById('liveStepCount');
    const liveJoules = document.getElementById('liveJoules');
    const liveVoltage = document.getElementById('liveVoltage');
    const soundToggle = document.getElementById('soundToggle');

    // Web Audio Synthesizer for Piezo-Acoustic Pulse
    let audioCtx = null;
    function playPiezoSound() {
        if (!soundToggle || !soundToggle.checked) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            // Click oscillator (mechanical impact)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.09);

            // Subtle electric hum
            const oscElec = audioCtx.createOscillator();
            const gainElec = audioCtx.createGain();
            oscElec.type = 'sine';
            oscElec.frequency.setValueAtTime(880, audioCtx.currentTime + 0.02);
            oscElec.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);

            gainElec.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.02);
            gainElec.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

            oscElec.connect(gainElec);
            gainElec.connect(audioCtx.destination);
            oscElec.start(audioCtx.currentTime + 0.02);
            oscElec.stop(audioCtx.currentTime + 0.16);
        } catch (e) {
            console.warn('AudioContext not allowed yet', e);
        }
    }

    if (stepTileBtn) {
        stepTileBtn.addEventListener('click', (e) => {
            stepCount++;
            // Generate random realistic human step Joules: 4.5 to 6.8 Joules
            const stepJ = +(4.5 + Math.random() * 2.3).toFixed(2);
            totalJoules += stepJ;
            const peakV = (18 + Math.random() * 14).toFixed(1);

            // Update UI
            if (liveStepCount) liveStepCount.textContent = stepCount.toLocaleString();
            if (liveJoules) liveJoules.textContent = `${totalJoules.toFixed(1)} J`;
            if (liveVoltage) liveVoltage.textContent = `${peakV} V`;

            // Audio feedback
            playPiezoSound();

            // Ripple effect
            if (stepRipple) {
                stepRipple.classList.remove('scale-0');
                stepRipple.classList.add('scale-150');
                setTimeout(() => {
                    stepRipple.classList.remove('scale-150');
                    stepRipple.classList.add('scale-0');
                }, 250);
            }

            // Create floating "+X.X J" particle
            const rect = stepTileBtn.getBoundingClientRect();
            const badge = document.createElement('div');
            badge.className = 'fixed font-mono font-bold text-xs text-cyan-300 pointer-events-none transition-all duration-700 z-50';
            badge.style.left = `${e.clientX || (rect.left + rect.width / 2)}px`;
            badge.style.top = `${e.clientY || (rect.top + 20)}px`;
            badge.textContent = `+${stepJ} J (${peakV}V)`;
            document.body.appendChild(badge);

            requestAnimationFrame(() => {
                badge.style.transform = 'translateY(-35px)';
                badge.style.opacity = '0';
            });
            setTimeout(() => badge.remove(), 700);
        });
    }

    // -------------------------------------------------------------
    // 3. Interactive Station Microgrid Calculator & Simulator
    // -------------------------------------------------------------
    const sliderFootfall = document.getElementById('sliderFootfall');
    const sliderTiles = document.getElementById('sliderTiles');
    const sliderSolar = document.getElementById('sliderSolar');
    const sliderSunHours = document.getElementById('sliderSunHours');

    const valFootfall = document.getElementById('valFootfall');
    const valTiles = document.getElementById('valTiles');
    const valSolar = document.getElementById('valSolar');
    const valSunHours = document.getElementById('valSunHours');

    const outTotalKwh = document.getElementById('outTotalKwh');
    const outAnnualMwh = document.getElementById('outAnnualMwh');
    const outKineticKwh = document.getElementById('outKineticKwh');
    const outFootstepsTapped = document.getElementById('outFootstepsTapped');
    const outSolarKwh = document.getElementById('outSolarKwh');
    const outSolarCapacity = document.getElementById('outSolarCapacity');
    const outCarbonOffset = document.getElementById('outCarbonOffset');
    const outRupeeSavings = document.getElementById('outRupeeSavings');
    const outDollarSavings = document.getElementById('outDollarSavings');
    const outSelfSufficiency = document.getElementById('outSelfSufficiency');

    // Chart.js instance
    let profileChart = null;

    function initHourlyChart() {
        const ctx = document.getElementById('hourlyProfileChart');
        if (!ctx) return;

        const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

        profileChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [
                    {
                        label: 'Kinetic Generation (kW)',
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        data: []
                    },
                    {
                        label: 'Solar PV Generation (kW)',
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        data: []
                    },
                    {
                        label: 'Station Baseline Load (kW)',
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#0b1622',
                        titleColor: '#ffffff',
                        borderColor: '#1e293b',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Outfit', size: 10 },
                            callback: (v) => `${v} kW`
                        }
                    }
                }
            }
        });
    }

    function calculateMicrogrid() {
        const footfall = parseInt(sliderFootfall.value, 10);
        const tiles = parseInt(sliderTiles.value, 10);
        const solarArea = parseInt(sliderSolar.value, 10);
        const sunHours = parseFloat(sliderSunHours.value);

        // Update Slider Label Readouts
        if (valFootfall) valFootfall.textContent = footfall.toLocaleString();
        if (valTiles) valTiles.textContent = `${tiles.toLocaleString()} tiles`;
        if (valSolar) valSolar.textContent = `${solarArea.toLocaleString()} m²`;
        if (valSunHours) valSunHours.textContent = `${sunHours.toFixed(1)} hrs`;

        // Physics & Calculations:
        // 1. Kinetic Energy
        // Each tile intercepts a fraction of commuter traffic based on tile density.
        // Approx 1.8 steps per commuter across tile zones. Average 5.4 Joules per step.
        const coverageRatio = Math.min(0.95, tiles / (tiles + 180));
        const effectiveSteps = footfall * coverageRatio * 2.5;
        const totalJoulesPerDay = effectiveSteps * 5.4;
        const kineticKwhPerDay = totalJoulesPerDay / 3600000;

        // 2. Solar PV Energy
        // High efficiency bifacial monocrystalline (205 W/m² nominal STC, 78% bifaciality adding ~12% platform albedo gain)
        const solarKwPeak = (solarArea * 0.205 * 1.12);
        // Performance Ratio PR ~ 0.80
        const solarKwhPerDay = solarKwPeak * sunHours * 0.80;

        // Total Generation
        const totalKwhPerDay = kineticKwhPerDay + solarKwhPerDay;
        const annualKwh = totalKwhPerDay * 365;
        const annualMwh = annualKwh / 1000;

        // Carbon Offset (CEA CO2 emission factor for Indian grid ~0.82 kg CO2 / kWh)
        const annualCo2Tons = (annualKwh * 0.82) / 1000;

        // Financial Savings (Commercial station tariff ₹8.50 per kWh, USD conversion 1 USD = 83 INR)
        const annualRupeeSavings = annualKwh * 8.5;
        const annualUsdSavings = annualRupeeSavings / 83.2;

        // Typical station auxiliary electrical load (lights, fans, displays, escalators)
        // Scaled with station footfall
        const stationDailyLoadKwh = 1200 + (footfall * 0.016);
        const selfSufficiencyPct = Math.min(100, (totalKwhPerDay / stationDailyLoadKwh) * 100);

        // Update UI Outputs
        if (outTotalKwh) outTotalKwh.innerHTML = `${Math.round(totalKwhPerDay).toLocaleString()} <span class="text-sm font-normal text-slate-400">kWh/day</span>`;
        if (outAnnualMwh) outAnnualMwh.textContent = `${Math.round(annualMwh).toLocaleString()} MWh/year`;
        if (outKineticKwh) outKineticKwh.innerHTML = `${Math.round(kineticKwhPerDay).toLocaleString()} <span class="text-sm font-normal text-slate-400">kWh/day</span>`;
        if (outFootstepsTapped) outFootstepsTapped.textContent = `${Math.round(effectiveSteps).toLocaleString()} steps captured`;
        if (outSolarKwh) outSolarKwh.innerHTML = `${Math.round(solarKwhPerDay).toLocaleString()} <span class="text-sm font-normal text-slate-400">kWh/day</span>`;
        if (outSolarCapacity) outSolarCapacity.textContent = `${Math.round(solarKwPeak)} kWp installed`;
        if (outCarbonOffset) outCarbonOffset.innerHTML = `${Math.round(annualCo2Tons).toLocaleString()} <span class="text-sm font-normal text-slate-400">Tons</span>`;

        if (outRupeeSavings) {
            if (annualRupeeSavings >= 10000000) {
                outRupeeSavings.textContent = `₹ ${(annualRupeeSavings / 10000000).toFixed(2)} Cr`;
            } else {
                outRupeeSavings.textContent = `₹ ${(annualRupeeSavings / 100000).toFixed(2)} Lakh`;
            }
        }
        if (outDollarSavings) outDollarSavings.textContent = `$${Math.round(annualUsdSavings).toLocaleString()} / year`;
        if (outSelfSufficiency) outSelfSufficiency.textContent = `${selfSufficiencyPct.toFixed(1)}%`;

        // Update Chart Data Profile
        if (profileChart) {
            // Hourly distribution weights
            // Kinetic: peaks at 8-10 AM (12%) and 17-20 PM (14%)
            const kineticWeights = [
                0.01, 0.005, 0.005, 0.01, 0.02, 0.04,
                0.07, 0.11, 0.13, 0.09, 0.05, 0.04,
                0.04, 0.04, 0.04, 0.05, 0.08, 0.12,
                0.14, 0.11, 0.06, 0.04, 0.03, 0.02
            ];

            // Solar: bell curve 6 AM to 18 PM
            const solarWeights = [
                0, 0, 0, 0, 0, 0,
                0.01, 0.04, 0.09, 0.14, 0.18, 0.20,
                0.19, 0.16, 0.11, 0.06, 0.02, 0.005,
                0, 0, 0, 0, 0, 0
            ];

            const loadWeights = [
                0.02, 0.02, 0.02, 0.02, 0.03, 0.04,
                0.05, 0.07, 0.07, 0.06, 0.05, 0.05,
                0.05, 0.05, 0.05, 0.06, 0.07, 0.07,
                0.07, 0.06, 0.05, 0.04, 0.03, 0.02
            ];

            const kineticData = kineticWeights.map(w => +(w * kineticKwhPerDay).toFixed(1));
            const solarData = solarWeights.map(w => +(w * solarKwhPerDay).toFixed(1));
            const loadData = loadWeights.map(w => +(w * stationDailyLoadKwh).toFixed(1));

            profileChart.data.datasets[0].data = kineticData;
            profileChart.data.datasets[1].data = solarData;
            profileChart.data.datasets[2].data = loadData;
            profileChart.update('none');
        }
    }

    // Attach Calculator Event Listeners
    [sliderFootfall, sliderTiles, sliderSolar, sliderSunHours].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateMicrogrid);
        }
    });

    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (sliderFootfall) sliderFootfall.value = btn.dataset.footfall;
            if (sliderTiles) sliderTiles.value = btn.dataset.tiles;
            if (sliderSolar) sliderSolar.value = btn.dataset.solar;
            if (sliderSunHours) sliderSunHours.value = btn.dataset.sun;
            calculateMicrogrid();
        });
    });

    // Reset Button
    const resetSimBtn = document.getElementById('resetSimBtn');
    if (resetSimBtn) {
        resetSimBtn.addEventListener('click', () => {
            if (sliderFootfall) sliderFootfall.value = 120000;
            if (sliderTiles) sliderTiles.value = 350;
            if (sliderSolar) sliderSolar.value = 3500;
            if (sliderSunHours) sliderSunHours.value = 5.2;
            calculateMicrogrid();
        });
    }

    // Initialize Chart and Run First Calculation
    initHourlyChart();
    calculateMicrogrid();

    // -------------------------------------------------------------
    // 4. Station Blueprint Interactive Zone Switcher
    // -------------------------------------------------------------
    const zoneData = {
        fob: {
            tag: 'ZONE 1 SPECIFICATIONS',
            title: 'Foot Overbridges & Skywalks',
            icon: 'git-commit',
            spec1: 'PZT-5H Ceramics + Dual Flywheel Rack',
            spec2: '750 N average dynamic load per footstep',
            spec3: '5.4 Joules / step (0.0015 Wh)',
            spec4: 'FOB lighting, CCTV cameras & emergency signs'
        },
        turnstile: {
            tag: 'ZONE 2 SPECIFICATIONS',
            title: 'Automated Turnstiles & Security Gates',
            icon: 'shield',
            spec1: 'High-Impact Piezoelectric Mat Arrays',
            spec2: '100% commuter passage contact rate',
            spec3: '6.2 Joules / commuter transit',
            spec4: 'Powers RFID turnstile motors & flap barriers'
        },
        canopy: {
            tag: 'ZONE 3 SPECIFICATIONS',
            title: 'Platform Rooftop Canopies',
            icon: 'sun',
            spec1: 'N-Type Bifacial Monocrystalline Glass Modules',
            spec2: '1,100 W/m² peak solar irradiance & albedo',
            spec3: '22.4% cell efficiency + 78% bifaciality',
            spec4: 'Platform floodlights, BLDC fans & EV charging'
        },
        hub: {
            tag: 'ZONE 4 SPECIFICATIONS',
            title: 'Microgrid Control & Supercapacitor Vault',
            icon: 'server',
            spec1: '500F Graphene Supercaps + 48V LiFePO4 Bank',
            spec2: 'Sub-millisecond pulse capture & AI dispatch',
            spec3: '96.8% inverter efficiency with grid sync',
            spec4: 'Station SCADA telemetry & traction grid tie'
        }
    };

    const zoneTabs = document.querySelectorAll('.zone-tab');
    const zoneTag = document.getElementById('zoneTag');
    const zoneTitle = document.getElementById('zoneTitle');
    const zoneSpec1 = document.getElementById('zoneSpec1');
    const zoneSpec2 = document.getElementById('zoneSpec2');
    const zoneSpec3 = document.getElementById('zoneSpec3');
    const zoneSpec4 = document.getElementById('zoneSpec4');

    zoneTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            zoneTabs.forEach(t => {
                t.classList.remove('active-zone');
                t.classList.add('bg-railway-800/50');
            });
            tab.classList.add('active-zone');
            tab.classList.remove('bg-railway-800/50');

            const zoneKey = tab.dataset.zone;
            const data = zoneData[zoneKey];
            if (data) {
                if (zoneTag) zoneTag.textContent = data.tag;
                if (zoneTitle) zoneTitle.textContent = data.title;
                if (zoneSpec1) zoneSpec1.textContent = data.spec1;
                if (zoneSpec2) zoneSpec2.textContent = data.spec2;
                if (zoneSpec3) zoneSpec3.textContent = data.spec3;
                if (zoneSpec4) zoneSpec4.textContent = data.spec4;
            }
        });
    });

    // -------------------------------------------------------------
    // 5. Whitepaper Modal Interactions
    // -------------------------------------------------------------
    const whitepaperModal = document.getElementById('whitepaperModal');
    const openWhitepaperBtn = document.getElementById('openWhitepaperBtn');
    const openWhitepaperBtn2 = document.getElementById('openWhitepaperBtn2');
    const closeWhitepaperBtn = document.getElementById('closeWhitepaperBtn');
    const closeWhitepaperBtn2 = document.getElementById('closeWhitepaperBtn2');

    function openModal() {
        if (whitepaperModal) {
            whitepaperModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (whitepaperModal) {
            whitepaperModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (openWhitepaperBtn) openWhitepaperBtn.addEventListener('click', openModal);
    if (openWhitepaperBtn2) openWhitepaperBtn2.addEventListener('click', openModal);
    if (closeWhitepaperBtn) closeWhitepaperBtn.addEventListener('click', closeModal);
    if (closeWhitepaperBtn2) closeWhitepaperBtn2.addEventListener('click', closeModal);

    // Close on backdrop click or ESC
    if (whitepaperModal) {
        whitepaperModal.addEventListener('click', (e) => {
            if (e.target === whitepaperModal) closeModal();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && whitepaperModal && !whitepaperModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // -------------------------------------------------------------
    // 6. Interactive Canvas Particle Animation (Energy Flow)
    // -------------------------------------------------------------
    const canvas = document.getElementById('energyCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        // Create particles
        const particleCount = 45;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                // Cyan for kinetic, Amber for solar, Emerald for grid
                color: Math.random() > 0.5 ? '#06b6d4' : (Math.random() > 0.5 ? '#f59e0b' : '#10b981')
            });
        }

        function drawEnergyField() {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 130)})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw individual particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(drawEnergyField);
        }

        drawEnergyField();
    }
});
