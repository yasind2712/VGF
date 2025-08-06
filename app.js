// app.js - extracted script logic from index.html for the Virtual Green Fleet Orchestrator demo

// --- MOCK DATA ---
const fleets = [
    { id: 'f1', name: 'Metro School District', vehicleCount: 30, totalCapacityKWh: 3600, avgSoc: 0.85, status: 'available', icon: 'bus', type: 'School Bus', revenue: 0, savings: 0 },
    { id: 'f2', name: 'Prime Logistics', vehicleCount: 75, totalCapacityKWh: 9000, avgSoc: 0.70, status: 'dispatching', icon: 'truck', type: 'Delivery Van', revenue: 0, savings: 0 },
    { id: 'f3', name: 'City Services', vehicleCount: 40, totalCapacityKWh: 4000, avgSoc: 0.90, status: 'charging', icon: 'car', type: 'Municipal Car', revenue: 0, savings: 0 },
    { id: 'f4', name: 'RideShare Partners', vehicleCount: 150, totalCapacityKWh: 10500, avgSoc: 0.65, status: 'available', icon: 'taxi', type: 'Rideshare', revenue: 0, savings: 0 }
];

let potentialFleets = [
    { id: 'pf1', name: 'County Waste Management', vehicleCount: 25, totalCapacityKWh: 5000, type: 'Refuse Truck' },
    { id: 'pf2', name: 'Regional Port Authority', vehicleCount: 50, totalCapacityKWh: 12000, type: 'Yard Tractor' }
];

// --- GLOBAL STATE ---
let chart;
let isSimMode = false;
let liveUpdateInterval;

// --- UI ELEMENTS ---
const kpiCapexEl = document.getElementById('kpi-capex');
const kpiPeakEl = document.getElementById('kpi-peak');
const kpiRevenueEl = document.getElementById('kpi-revenue');
const kpiFleetsEl = document.getElementById('kpi-fleets');
const fleetListEl = document.getElementById('fleet-list');
const eventLogEl = document.getElementById('event-log');
const gridFreqEl = document.getElementById('grid-freq');
const gridDemandEl = document.getElementById('grid-demand');
const gridPriceEl = document.getElementById('grid-price');
const modeLiveBtn = document.getElementById('mode-live');
const modeSimBtn = document.getElementById('mode-sim');
const simControlsEl = document.getElementById('sim-controls');
const simFleetSelectEl = document.getElementById('sim-fleet-select');
const runSimBtn = document.getElementById('run-sim-btn');
const simResultsEl = document.getElementById('sim-results');
const simRevenueEl = document.getElementById('sim-revenue');
const simTcoEl = document.getElementById('sim-tco');
const currentTimeEl = document.getElementById('current-time');
const fleetNameInputEl = document.getElementById('fleet-name-input');
const vehicleTypeSelectEl = document.getElementById('vehicle-type-select');
const vehicleCountInputEl = document.getElementById('vehicle-count-input');
const onboardFleetBtn = document.getElementById('onboard-fleet-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIconEl = document.getElementById('theme-icon');

// --- THEME ---
const applyTheme = (theme) => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
    themeIconEl.className = theme === 'dark' ? 'ph-sun text-lg' : 'ph-moon text-lg';
    localStorage.setItem('theme', theme);

    // Update chart colors
    if (chart) {
        const textColor = theme === 'dark' ? '#8b949e' : '#374151';
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.title.color = theme === 'dark' ? '#c9d1d9' : '#1f2937';
        chart.data.datasets[0].borderColor = theme === 'dark' ? 'rgba(96,165,250,1)' : 'rgba(37,99,235,1)';
        chart.data.datasets[0].backgroundColor = theme === 'dark' ? 'rgba(96,165,250,0.2)' : 'rgba(37,99,235,0.2)';
        chart.data.datasets[1].borderColor = theme === 'dark' ? 'rgba(251,191,36,1)' : 'rgba(234,179,8,1)';
        chart.data.datasets[1].backgroundColor = theme === 'dark' ? 'rgba(251,191,36,0.2)' : 'rgba(234,179,8,0.2)';
        chart.update('none');
    }
};

themeToggleBtn.addEventListener('click', () => {
    const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Meta for vehicle archetypes
const vehicleTypeMeta = {
    'School Bus': { capacity: 120, icon: 'bus' },
    'Delivery Van': { capacity: 90, icon: 'truck' },
    'Municipal Car': { capacity: 60, icon: 'car' },
    'Rideshare': { capacity: 60, icon: 'taxi' },
    'Refuse Truck': { capacity: 200, icon: 'truck' },
    'Yard Tractor': { capacity: 150, icon: 'truck' }
};

let lastSimFleet = null;

// --- UTILITY FUNCTIONS ---
const formatMW = (kWh) => (kWh / 1000).toFixed(1);
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const addLog = (message, type = 'info') => {
    const colors = { info: 'text-gray-400', success: 'text-green-400', warn: 'text-yellow-400', dispatch: 'text-blue-400' };
    const now = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `flex items-start`;
    logEntry.innerHTML = `<span class="font-mono text-gray-500 mr-2">${now}</span><p class="${colors[type]}">${message}</p>`;
    eventLogEl.prepend(logEntry);
    if (eventLogEl.children.length > 20) {
        eventLogEl.lastChild.remove();
    }
};
const getIcon = (iconName) => {
    const icons = {
        bus: `<i class="ph-bus text-2xl text-blue-400"></i>`,
        truck: `<i class="ph-truck text-2xl text-green-400"></i>`,
        car: `<i class="ph-car text-2xl text-yellow-400"></i>`,
        taxi: `<i class="ph-taxi text-2xl text-purple-400"></i>`
    };
    return icons[iconName] || `<i class="ph-plugs-connected text-2xl text-gray-400"></i>`;
};
const animateNumber = (el, finalValue) => {
    el.style.setProperty("--num", finalValue);
};

// --- DATA GENERATION ---
const generateTimeLabels = (count = 30) => {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 120000); // 2 minute intervals
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    return labels;
};

const generateSyntheticData = (fleet) => {
    addLog(`Generating synthetic telematics for '${fleet.name}'...`, 'info');
    const data = {
        dispatchedPower: [],
        chargingLoad: [],
        revenue: 0
    };
    let currentSoc = 0.7; // Start at a reasonable SoC

    for (let i = 0; i < 24 * 60; i++) { // 1440 minutes in a day
        const hour = (i / 60) % 24;
        const isAvailable = (hour < 7 || hour > 18); // Simple availability for demo
        const marketPrice = (hour > 17 && hour < 21) ? randomBetween(150, 400) : randomBetween(20, 50);

        let dispatchedPower = 0;
        let chargingLoad = 0;

        if (isAvailable && marketPrice > 100 && currentSoc > 0.3) {
            // Dispatch to grid (V2G)
            dispatchedPower = Math.min(formatMW(fleet.totalCapacityKWh) * 0.3, formatMW(fleet.totalCapacityKWh) * (currentSoc - 0.2));
            currentSoc -= (dispatchedPower * 1000) / fleet.totalCapacityKWh / 60;
            data.revenue += dispatchedPower * marketPrice / 60;
        } else if (isAvailable && marketPrice < 30 && currentSoc < 0.95) {
            // Charge from grid (G2V)
            chargingLoad = Math.min(formatMW(fleet.totalCapacityKWh) * 0.4, formatMW(fleet.totalCapacityKWh) * (0.95 - currentSoc));
            currentSoc += (chargingLoad * 1000) / fleet.totalCapacityKWh / 60;
            data.revenue -= chargingLoad * marketPrice / 60; // Cost
        }
        data.dispatchedPower.push(dispatchedPower);
        data.chargingLoad.push(chargingLoad);
    }
    data.finalSoc = currentSoc;
    addLog(`Simulation for '${fleet.name}' complete.`, 'success');
    return data;
};

// --- UI UPDATE FUNCTIONS ---
const updateDashboard = () => {
    let gridContribution = 0;
    let chargingLoad = 0;

    fleets.forEach(f => {
        if (f.status === 'dispatching') {
            gridContribution += f.totalCapacityKWh * f.avgSoc * 0.2; // Assume 20% dispatch rate
        }
        if (f.status === 'charging') {
            chargingLoad += f.totalCapacityKWh * 0.15;
        }
    });

    const gridContributionMW = parseFloat(formatMW(gridContribution));

    animateNumber(kpiFleetsEl, fleets.length);
    animateNumber(kpiPeakEl, Math.round(gridContributionMW));
    animateNumber(kpiRevenueEl, Math.round(gridContributionMW * 1.2 * 24)); // Mock daily revenue
    // Ensure non-zero, integer-friendly capex figure for demo purposes
    animateNumber(kpiCapexEl, Math.max(1, Math.round(gridContributionMW * 2)));

    gridFreqEl.textContent = `${randomBetween(59.98, 60.02).toFixed(2)} Hz`;
    const demand = 1200 + randomBetween(-50, 50) - gridContributionMW + parseFloat(formatMW(chargingLoad));
    gridDemandEl.textContent = `${demand.toFixed(0)} MW`;
    const price = randomBetween(25, 250);
    gridPriceEl.textContent = `$${price.toFixed(0)}/MWh`;
    gridPriceEl.className = `font-bold text-lg ${price > 100 ? 'text-red-400' : 'text-green-400'}`;

    // --- Compute fleet-level economics ---
    const INTERVAL_HOURS = 5 / 3600; // updateDashboard called every 5s
    const CHEAP_THRESHOLD = 50; // $/MWh
    const NUDGE_THRESHOLD = 150; // price trigger
    const NUDGE_INTERVAL_MS = 10 * 60 * 1000; // 10-minute cooldown

    fleets.forEach(f => {
        if (f.status === 'dispatching') {
            const dispatchMW = (f.totalCapacityKWh * f.avgSoc * 0.2) / 1000;
            f.revenue = (f.revenue || 0) + dispatchMW * price * INTERVAL_HOURS;

            // SoC decreases
            const deltaSoc = - (dispatchMW * 1000 * INTERVAL_HOURS) / f.totalCapacityKWh;
            f.avgSoc = Math.max(0, f.avgSoc + deltaSoc);

        } else if (f.status === 'charging') {
            const chargeMW = (f.totalCapacityKWh * 0.15) / 1000;
            const delta = (CHEAP_THRESHOLD - price) * chargeMW * INTERVAL_HOURS;
            f.savings = (f.savings || 0) + delta;

            // SoC increases
            const deltaSoc = (chargeMW * 1000 * INTERVAL_HOURS) / f.totalCapacityKWh;
            f.avgSoc = Math.min(1, f.avgSoc + deltaSoc);
        }

        // --- Nudging logic ---
        if (price > NUDGE_THRESHOLD && f.status !== 'dispatching') {
            const now = Date.now();
            if (!f.lastNudgeTs || now - f.lastNudgeTs > NUDGE_INTERVAL_MS) {
                const potentialMW = (f.totalCapacityKWh * f.avgSoc * 0.2) / 1000;
                const potentialHr = Math.round(potentialMW * price);
                addLog(`Market spike $${price.toFixed(0)}/MWh! ${f.name} could earn ~$${potentialHr.toLocaleString()}\/h by exporting.`, 'warn');
                f.lastNudgeTs = now;
            }
        }
    });

    // Re-render fleet list to reflect updated badges
    renderFleetList();
};

const renderFleetList = () => {
    fleetListEl.innerHTML = '';
    fleets.forEach(f => {
        const statusClasses = {
            available: 'status-available',
            dispatching: 'status-dispatching',
            charging: 'status-charging',
            offline: 'status-offline'
        };
        const fleetEl = document.createElement('div');
        const cardBg = document.body.classList.contains('dark-mode') ? 'bg-gray-900/50' : 'bg-gray-100';
        fleetEl.className = `p-3 rounded-lg flex items-center justify-between ${cardBg}`;

        const revenueClass = 'bg-blue-700 text-blue-200';
        const savingsClass = f.savings >= 0 ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200';

        fleetEl.innerHTML = `
            <div class="flex items-center space-x-3">
                ${getIcon(f.icon)}
                <div>
                    <p class="font-bold text-white">${f.name}</p>
                    <p class="text-sm text-gray-400">${f.vehicleCount} vehicles (${f.type})</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <button class="toggle-offline p-1" data-fleet-id="${f.id}" title="${f.status === 'offline' ? 'Reconnect' : 'Disconnect'}">
                    <i class="${f.status === 'offline' ? 'ph-plugs-connected text-green-400' : 'ph-plug text-red-400'} text-xl"></i>
                </button>
                <label class="cursor-pointer ${f.status === 'offline' ? 'opacity-50 pointer-events-none' : ''}">
                    <input type="checkbox" class="toggle-power" data-fleet-id="${f.id}" ${f.status === 'dispatching' ? 'checked' : ''} ${f.status === 'offline' ? 'disabled' : ''}>
                </label>
                <div class="text-right">
                    <div class="flex items-center justify-end">
                        <span class="status-dot ${statusClasses[f.status]}"></span>
                        <span class="text-sm font-medium capitalize text-white">${f.status}</span>
                    </div>
                    <p class="text-sm text-gray-400">${(f.avgSoc * 100).toFixed(0)}% SoC</p>
                    <p class="text-xs mt-0.5 space-x-1">
                        <span class="px-1.5 py-0.5 rounded ${revenueClass}">$${f.revenue.toFixed(0)}</span>
                        <span class="px-1.5 py-0.5 rounded ${savingsClass}">$${f.savings.toFixed(0)}</span>
                    </p>
                </div>
            </div>
        `;
        fleetListEl.appendChild(fleetEl);
    });

    // Attach toggle listeners (fresh each render)
    fleetListEl.querySelectorAll('.toggle-power').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const id = e.target.dataset.fleetId;
            const fleet = fleets.find(fl => fl.id === id);
            if (!fleet) return;

            if (fleet.status === 'offline') return; // ignore if offline

            if (e.target.checked) {
                fleet.status = 'dispatching';
                addLog(`${fleet.name} is now dispatching power to grid.`, 'dispatch');
            } else {
                fleet.status = 'charging';
                addLog(`${fleet.name} started charging.`, 'info');
            }

            // Simple SoC adjustment
            fleet.avgSoc = Math.max(0.1, Math.min(1, fleet.avgSoc + (fleet.status === 'charging' ? 0.02 : -0.02)));

            updateDashboard();
            liveChartUpdate();
            renderFleetList(); // re-render to reflect new status / SoC
        });
    });

    // Offline / reconnect listeners
    fleetListEl.querySelectorAll('.toggle-offline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.fleetId;
            const fleet = fleets.find(fl => fl.id === id);
            if (!fleet) return;

            if (fleet.status === 'offline') {
                fleet.status = 'available';
                addLog(`${fleet.name} reconnected to orchestrator.`, 'success');
            } else {
                fleet.status = 'offline';
                addLog(`${fleet.name} disconnected from orchestrator.`, 'warn');
            }

            updateDashboard();
            liveChartUpdate();
            renderFleetList();
        });
    });
};

const populateSimSelect = () => {
    simFleetSelectEl.innerHTML = '';
    // Placeholder option so "no template" is possible
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '-- Select Template (optional) --';
    simFleetSelectEl.appendChild(placeholderOption);

    potentialFleets.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = `${f.name} (${f.vehicleCount} ${f.type}s)`;
        simFleetSelectEl.appendChild(option);
    });
};

const updateTime = () => {
    currentTimeEl.textContent = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// --- CHARTING ---
const createChart = () => {
    const ctx = document.getElementById('powerChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(),
            datasets: [
                {
                    label: 'VGF Grid Contribution (MW)',
                    data: [],
                    borderColor: 'rgba(96, 165, 250, 1)',
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'VGF Charging Load (MW)',
                    data: [],
                    borderColor: 'rgba(251, 191, 36, 1)',
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Power (MW)', color: '#c9d1d9' },
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' }
                },
                x: {
                    ticks: { color: '#8b949e', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { color: '#c9d1d9' } },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
};

const updateChartData = (newData) => {
    if (!chart) return;
    chart.data.labels = newData.labels;
    chart.data.datasets[0].data = newData.dispatchedPower;
    chart.data.datasets[1].data = newData.chargingLoad;
    chart.update('quiet');
};

const liveChartUpdate = () => {
    if (isSimMode || !chart) return;

    chart.data.labels.shift();
    chart.data.labels.push(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Recalculate current dispatch & charging in MW
    const dispatched = fleets
        .filter(f => f.status === 'dispatching')
        .reduce((acc, f) => acc + (f.totalCapacityKWh * f.avgSoc * 0.2) / 1000, 0); // MW

    const charging = fleets
        .filter(f => f.status === 'charging')
        .reduce((acc, f) => acc + (f.totalCapacityKWh * 0.15) / 1000, 0); // MW

    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(dispatched + randomBetween(-dispatched * 0.1, dispatched * 0.1));

    chart.data.datasets[1].data.shift();
    chart.data.datasets[1].data.push(charging + randomBetween(-charging * 0.1, charging * 0.1));

    chart.update('quiet');
};

// --- MODE SWITCHING ---
const setMode = (mode) => {
    isSimMode = (mode === 'sim');
    if (isSimMode) {
        modeLiveBtn.classList.remove('active-mode');
        modeLiveBtn.classList.add('btn-secondary');
        modeSimBtn.classList.add('active-mode');
        modeSimBtn.classList.remove('btn-secondary');
        simControlsEl.classList.remove('hidden');
        clearInterval(liveUpdateInterval);
        addLog('Switched to Simulation Mode.', 'warn');
    } else {
        modeSimBtn.classList.remove('active-mode');
        modeSimBtn.classList.add('btn-secondary');
        modeLiveBtn.classList.add('active-mode');
        modeLiveBtn.classList.remove('btn-secondary');
        simControlsEl.classList.add('hidden');
        simResultsEl.classList.add('hidden');
        startLiveUpdates();
        addLog('Switched to Live Mode.', 'info');
    }
};

// --- EVENT HANDLERS ---
modeLiveBtn.addEventListener('click', () => setMode('live'));
modeSimBtn.addEventListener('click', () => setMode('sim'));

runSimBtn.addEventListener('click', () => {
    // Determine if user entered a custom fleet or selected a template
    let selectedFleet;

    const customName = fleetNameInputEl.value.trim();
    const customCount = parseInt(vehicleCountInputEl.value, 10);
    const customType = vehicleTypeSelectEl.value;

    if (customName && customCount > 0) {
        const meta = vehicleTypeMeta[customType] || vehicleTypeMeta['Delivery Van'];
        selectedFleet = {
            id: `pf-${Date.now()}`,
            name: customName,
            vehicleCount: customCount,
            totalCapacityKWh: meta.capacity * customCount,
            type: customType,
            icon: meta.icon
        };

        // Add to potential fleet templates for future reuse
        potentialFleets.push(selectedFleet);
        populateSimSelect();
    } else {
        const selectedFleetId = simFleetSelectEl.value;
        selectedFleet = potentialFleets.find(f => f.id === selectedFleetId);
    }

    if (!selectedFleet) return;

    lastSimFleet = selectedFleet;

    runSimBtn.disabled = true;
    runSimBtn.textContent = 'Simulating...';
    simResultsEl.classList.add('hidden');

    setTimeout(() => { // Simulate processing time
        const simData = generateSyntheticData(selectedFleet);
        const hourlyDispatch = simData.dispatchedPower.filter((_, i) => i % 60 === 0);
        const hourlyCharge = simData.chargingLoad.filter((_, i) => i % 60 === 0);

        updateChartData({
            labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
            dispatchedPower: hourlyDispatch,
            chargingLoad: hourlyCharge
        });

        // Persist final SoC for onboarding / realism
        selectedFleet.avgSoc = simData.finalSoc;
        lastSimFleet.avgSoc = simData.finalSoc;

        simRevenueEl.textContent = `Projected Annual Revenue: $${(simData.revenue * 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        simTcoEl.textContent = `Estimated TCO Reduction: ${(simData.revenue / (selectedFleet.vehicleCount * 1500)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1 })}`;
        simResultsEl.classList.remove('hidden');
        onboardFleetBtn.classList.remove('hidden');
        runSimBtn.disabled = false;
        runSimBtn.textContent = 'Run Simulation';
    }, 1500);
});

// Onboard fleet after successful simulation
onboardFleetBtn.addEventListener('click', () => {
    if (!lastSimFleet) return;

    fleets.push({
        ...lastSimFleet,
        avgSoc: 0.8,
        status: 'available',
        revenue: 0,
        savings: 0
    });

    renderFleetList();
    updateDashboard();
    addLog(`Fleet '${lastSimFleet.name}' onboarded to active program.`, 'success');

    onboardFleetBtn.classList.add('hidden');
});

// --- UX: Deselect template when user customises fields ---
const clearTemplateSelection = () => { simFleetSelectEl.value = ''; };
[fleetNameInputEl, vehicleTypeSelectEl, vehicleCountInputEl].forEach(el => {
    el.addEventListener('input', clearTemplateSelection);
    el.addEventListener('change', clearTemplateSelection);
});

// When a template is chosen, wipe custom inputs
simFleetSelectEl.addEventListener('change', () => {
    if (simFleetSelectEl.value) {
        fleetNameInputEl.value = '';
        vehicleCountInputEl.value = '';
    }
});

// --- INITIALIZATION ---
const startLiveUpdates = () => {
    updateDashboard();
    const initialData = {
        labels: generateTimeLabels(),
        dispatchedPower: Array(30).fill(0),
        chargingLoad: Array(30).fill(0)
    };
    updateChartData(initialData);
    setTimeout(liveChartUpdate, 100);

    liveUpdateInterval = setInterval(() => {
        updateDashboard();
        liveChartUpdate();
        updateTime();
    }, 5000);
};

document.addEventListener('DOMContentLoaded', () => {
    createChart();
    renderFleetList();
    populateSimSelect();
    updateTime();
    applyTheme(localStorage.getItem('theme') || 'light');
    setMode('live'); // Start in live mode
    addLog('System Initialized. Welcome to the VGF Orchestrator.', 'success');
}); 