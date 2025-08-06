// app.js - extracted script logic from index.html for the Virtual Green Fleet Orchestrator demo

// --- SPLASH SCREEN ---
const initSplashScreen = () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainApp = document.getElementById('main-app');
    
    // Show splash screen initially
    splashScreen.style.opacity = '1';
    mainApp.style.opacity = '0';
    
    // After 3 seconds, fade out splash and fade in main app
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        mainApp.style.opacity = '1';
        
        // Remove splash screen from DOM after transition
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 1000);
    }, 3000);
};

// --- MOCK DATA ---
const fleets = [
    { id: 'f1', name: 'Metro School District', vehicleCount: 30, totalCapacityKWh: 3600, avgSoc: 0.85, status: 'available', icon: 'bus', type: 'School Bus', revenue: 0, savings: 0, communicationStatus: 'connected', lastResponse: null, location: 'Oakland, CA', gridZone: 'CAISO Zone 3', substation: 'Oakland 115kV' },
    { id: 'f2', name: 'Prime Logistics', vehicleCount: 75, totalCapacityKWh: 9000, avgSoc: 0.70, status: 'dispatching', icon: 'truck', type: 'Delivery Van', revenue: 0, savings: 0, communicationStatus: 'connected', lastResponse: null, location: 'San Francisco, CA', gridZone: 'CAISO Zone 3', substation: 'SF Mission Bay' },
    { id: 'f3', name: 'City Services', vehicleCount: 40, totalCapacityKWh: 4000, avgSoc: 0.90, status: 'charging', icon: 'car', type: 'Municipal Car', revenue: 0, savings: 0, communicationStatus: 'connected', lastResponse: null, location: 'Berkeley, CA', gridZone: 'CAISO Zone 3', substation: 'Berkeley 69kV' },
    { id: 'f4', name: 'RideShare Partners', vehicleCount: 150, totalCapacityKWh: 10500, avgSoc: 0.65, status: 'available', icon: 'taxi', type: 'Rideshare', revenue: 0, savings: 0, communicationStatus: 'connected', lastResponse: null, location: 'San Jose, CA', gridZone: 'CAISO Zone 4', substation: 'San Jose Downtown' }
];

let potentialFleets = [
    { id: 'pf1', name: 'County Waste Management', vehicleCount: 25, totalCapacityKWh: 5000, type: 'Refuse Truck', location: 'Fremont, CA', gridZone: 'CAISO Zone 4' },
    { id: 'pf2', name: 'Regional Port Authority', vehicleCount: 50, totalCapacityKWh: 12000, type: 'Yard Tractor', location: 'Oakland Port, CA', gridZone: 'CAISO Zone 3' }
];

// Grid zones data
const gridZones = {
    'CAISO Zone 3': { name: 'CAISO Zone 3', capacity: 2500, constraints: 'None', primarySubstation: 'Oakland 115kV' },
    'CAISO Zone 4': { name: 'CAISO Zone 4', capacity: 1800, constraints: 'None', primarySubstation: 'San Jose Downtown' }
};

// Map common locations to grid zones (extend as needed)
const locationToZone = {
    'Oakland, CA': 'CAISO Zone 3',
    'San Francisco, CA': 'CAISO Zone 3',
    'Berkeley, CA': 'CAISO Zone 3',
    'Fremont, CA': 'CAISO Zone 3',
    'Oakland Port, CA': 'CAISO Zone 3',
    'San Jose, CA': 'CAISO Zone 4'
};

// New dispatch requests tracking
let dispatchRequests = [];

// --- GLOBAL STATE ---
let chart;
let simChart;
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
const locationSelectEl = document.getElementById('location-select');
const onboardFleetBtn = document.getElementById('onboard-fleet-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIconEl = document.getElementById('theme-icon');

// New UI elements for enhanced features
const bidCapacityEl = document.getElementById('bid-capacity');
const marketRevenueEl = document.getElementById('market-revenue');
const carbonAvoidedEl = document.getElementById('carbon-avoided');
const gridStabilityEl = document.getElementById('grid-stability');
const peakShavingEl = document.getElementById('peak-shaving');
const voltageSupportEl = document.getElementById('voltage-support');
const frequencyRegEl = document.getElementById('frequency-reg');
const fleetRevenueEl = document.getElementById('fleet-revenue');
const tcoReductionEl = document.getElementById('tco-reduction');
const demandSavingsEl = document.getElementById('demand-savings');
const routeAssuranceEl = document.getElementById('route-assurance');

// New UI elements for fleet communication
const pendingRequestsEl = document.getElementById('pending-requests');
const confirmedDispatchEl = document.getElementById('confirmed-dispatch');
const responseRateEl = document.getElementById('response-rate');
const dispatchRequestsEl = document.getElementById('dispatch-requests');
const closeCommunicationBtn = document.getElementById('close-communication-btn');

// New UI elements for location details
const primaryZoneEl = document.getElementById('primary-zone');
const substationEl = document.getElementById('substation');
const fleetCoverageEl = document.getElementById('fleet-coverage');
const gridConstraintsEl = document.getElementById('grid-constraints');

// Analytics UI elements
const weeklyRevenueEl = document.getElementById('weekly-revenue');
const avgResponseRateEl = document.getElementById('avg-response-rate');

// Synthetic Telematics UI elements
const activePatternsEl = document.getElementById('active-patterns');
const routeSimulationEl = document.getElementById('route-simulation');
const socUpdatesEl = document.getElementById('soc-updates');

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
    // Re-render fleet list so card backgrounds switch when theme changes
    if (typeof renderFleetList === 'function') {
        renderFleetList();
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

// New function to simulate grid events and market conditions
const simulateGridEvents = () => {
    const events = [
        {
            type: 'market_spike',
            condition: () => Math.random() < 0.1, // 10% chance
            action: () => {
                const price = randomBetween(300, 600);
                addLog(`🚨 Market spike detected! Price: $${price.toFixed(0)}/MWh - Optimal dispatch opportunity.`, 'warn');
                return price;
            }
        },
        {
            type: 'grid_stress',
            condition: () => Math.random() < 0.05, // 5% chance
            action: () => {
                addLog(`⚡ Grid stress detected - VGF dispatch requested for frequency regulation.`, 'dispatch');
                return 200; // Higher price during grid stress
            }
        },
        {
            type: 'renewable_surge',
            condition: () => Math.random() < 0.08, // 8% chance
            action: () => {
                addLog(`🌞 Renewable energy surge detected! VGF Agent sending charging requests to fleet operators to absorb excess solar/wind generation.`, 'info');
                return 15; // Very low price
            }
        }
    ];

    const event = events.find(e => e.condition());
    if (event) {
        return event.action();
    }
    return randomBetween(25, 250); // Normal price range
};

// New function to demonstrate VGF Agent-driven optimization
const optimizeFleetDispatch = (price, gridDemand) => {
    const optimizationLog = [];
    
    fleets.forEach(fleet => {
        if (fleet.status === 'offline' || fleet.communicationStatus === 'request_sent') return;
        
        const currentSoc = fleet.avgSoc;
        const capacity = fleet.totalCapacityKWh;
        const maxDispatch = capacity * currentSoc * 0.3; // Max 30% dispatch rate
        
        // VGF Agent optimization logic - send requests instead of direct control
        if (price > 150 && currentSoc > 0.4 && fleet.status === 'available') {
            // High price + sufficient SoC = request dispatch
            const requestedMW = Math.min(maxDispatch / 1000, 2.0); // Cap at 2 MW per request
            const reason = price > 300 ? 'Market Spike' : 'High Price Opportunity';
            sendDispatchRequest(fleet, requestedMW, price, reason);
            optimizationLog.push(`🤖 VGF Agent requested: ${fleet.name} dispatch ${requestedMW.toFixed(1)} MW at $${price.toFixed(2)}/MWh`);
        } else if (price < 30 && currentSoc < 0.9 && fleet.status === 'available') {
            // Low price + room to charge = suggest charging
            fleet.status = 'charging';
            optimizationLog.push(`🤖 VGF Agent suggested: ${fleet.name} charge at $${price.toFixed(2)}/MWh`);
        } else if (currentSoc < 0.3 && fleet.status === 'dispatching') {
            // Critical SoC - stop dispatching
            fleet.status = 'charging';
            optimizationLog.push(`⚠️ Safety override: ${fleet.name} SoC critical (${(currentSoc * 100).toFixed(0)}%)`);
        }
    });
    
    // Log optimization decisions
    optimizationLog.forEach(log => addLog(log, 'info'));
};

// New function to generate synthetic telematics with realistic patterns
const generateSyntheticTelematics = (fleet) => {
    const patterns = {
        'School Bus': {
            operationalHours: { start: 6, end: 18 },
            routePattern: 'morning_afternoon',
            chargingPreference: 'overnight',
            avgDailyMiles: 120
        },
        'Delivery Van': {
            operationalHours: { start: 8, end: 20 },
            routePattern: 'continuous',
            chargingPreference: 'opportunistic',
            avgDailyMiles: 80
        },
        'Municipal Car': {
            operationalHours: { start: 7, end: 17 },
            routePattern: 'intermittent',
            chargingPreference: 'scheduled',
            avgDailyMiles: 60
        },
        'Rideshare': {
            operationalHours: { start: 5, end: 23 },
            routePattern: 'variable',
            chargingPreference: 'fast_charging',
            avgDailyMiles: 150
        }
    };
    
    const pattern = patterns[fleet.type] || patterns['Delivery Van'];
    const currentHour = new Date().getHours();
    const isOperational = currentHour >= pattern.operationalHours.start && currentHour <= pattern.operationalHours.end;
    
    // Generate realistic SoC changes based on operational patterns
    if (isOperational) {
        // During operations, SoC decreases
        const hourlyConsumption = pattern.avgDailyMiles / 24 / 3; // Assume 3 miles per kWh
        fleet.avgSoc = Math.max(0.1, fleet.avgSoc - (hourlyConsumption / fleet.totalCapacityKWh));
    } else {
        // During idle time, SoC can be maintained or increased
        if (fleet.status === 'charging') {
            fleet.avgSoc = Math.min(1, fleet.avgSoc + 0.05);
        }
    }
    
    return {
        isOperational,
        pattern,
        estimatedRange: fleet.avgSoc * fleet.totalCapacityKWh * 3, // miles
        nextChargingWindow: pattern.chargingPreference
    };
};

// New function to send dispatch requests to fleet operators
const sendDispatchRequest = (fleet, requestedMW, price, reason) => {
    const request = {
        id: `req-${Date.now()}`,
        fleetId: fleet.id,
        fleetName: fleet.name,
        requestedMW: requestedMW,
        price: price,
        reason: reason,
        timestamp: new Date(),
        status: 'pending', // pending, accepted, declined, expired
        responseTime: null
    };
    
    dispatchRequests.unshift(request);
    fleet.communicationStatus = 'request_sent';
    
    addLog(`📤 Dispatch request sent to ${fleet.name}: ${requestedMW.toFixed(1)} MW at $${price}/MWh (${reason})`, 'dispatch');
    
    // Simulate fleet operator response after 1-3 minutes
    setTimeout(() => {
        simulateFleetResponse(request);
    }, randomBetween(60000, 180000)); // 1-3 minutes
    
    updateDispatchRequestsUI();
};

// New function to simulate fleet operator responses
const simulateFleetResponse = (request) => {
    const fleet = fleets.find(f => f.id === request.fleetId);
    if (!fleet) return;
    
    const responseTime = new Date() - request.timestamp;
    const responseRate = Math.random(); // 0-1
    
    if (responseRate > 0.3) { // 70% acceptance rate
        request.status = 'accepted';
        request.responseTime = responseTime;
        fleet.status = 'dispatching';
        fleet.lastResponse = new Date();
        fleet.communicationStatus = 'confirmed';
        
        addLog(`✅ ${fleet.name} accepted dispatch request (${(responseTime/1000).toFixed(0)}s)`, 'success');
    } else {
        request.status = 'declined';
        request.responseTime = responseTime;
        fleet.communicationStatus = 'declined';
        
        addLog(`❌ ${fleet.name} declined dispatch request (${(responseTime/1000).toFixed(0)}s)`, 'warn');
    }
    
    updateDispatchRequestsUI();
};

// New function to update dispatch requests UI
const updateDispatchRequestsUI = () => {
    dispatchRequestsEl.innerHTML = '';
    
    dispatchRequests.slice(0, 5).forEach(request => { // Show last 5 requests
        const fleet = fleets.find(f => f.id === request.fleetId);
        const statusColors = {
            pending: 'text-yellow-400',
            accepted: 'text-green-400',
            declined: 'text-red-400',
            expired: 'text-gray-400'
        };
        
        const requestEl = document.createElement('div');
        requestEl.className = 'p-2 bg-gray-800/50 rounded text-xs cursor-pointer hover:bg-gray-700/50 transition-colors';
        requestEl.setAttribute('data-request-id', request.id);
        requestEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-white">${fleet?.name || 'Unknown Fleet'}</p>
                    <p class="text-gray-400">${request.requestedMW.toFixed(1)} MW @ $${request.price.toFixed(2)}/MWh</p>
                    <p class="text-gray-500">${request.reason}</p>
                </div>
                <div class="text-right">
                    <p class="${statusColors[request.status]} font-bold">${request.status.toUpperCase()}</p>
                    <p class="text-gray-500">${request.timestamp.toLocaleTimeString()}</p>
                </div>
            </div>
        `;
        
        // Add click handler to show communication details
        requestEl.addEventListener('click', () => {
            showCommunicationModal(request, fleet);
        });
        
        dispatchRequestsEl.appendChild(requestEl);
    });
    
    // Update communication panel
    const pendingCount = dispatchRequests.filter(r => r.status === 'pending').length;
    const confirmedMW = dispatchRequests
        .filter(r => r.status === 'accepted')
        .reduce((acc, r) => acc + r.requestedMW, 0);
    const responseRate = dispatchRequests.length > 0 ? 
        (dispatchRequests.filter(r => r.status !== 'pending').length / dispatchRequests.length * 100) : 0;
    
    pendingRequestsEl.textContent = pendingCount;
    confirmedDispatchEl.textContent = `${confirmedMW.toFixed(1)} MW`;
    responseRateEl.textContent = `${responseRate.toFixed(0)}%`;
};

// New function to show communication modal
const showCommunicationModal = (request, fleet) => {
    const modal = document.getElementById('communication-modal');
    const details = document.getElementById('communication-details');
    
    const responseTime = request.responseTime ? `${(request.responseTime / 1000).toFixed(0)} seconds` : 'Pending';
    const statusIcon = request.status === 'accepted' ? '✅' : request.status === 'declined' ? '❌' : '⏳';
    
    details.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-300 mb-2">Request Details</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Fleet:</span>
                            <span class="text-white">${fleet?.name || 'Unknown'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Location:</span>
                            <span class="text-white">${fleet?.location || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Grid Zone:</span>
                            <span class="text-white">${fleet?.gridZone || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Requested Power:</span>
                            <span class="text-white">${request.requestedMW.toFixed(1)} MW</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Market Price:</span>
                            <span class="text-white">$${request.price.toFixed(2)}/MWh</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Reason:</span>
                            <span class="text-white">${request.reason}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-300 mb-2">Communication Status</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Status:</span>
                            <span class="text-white">${statusIcon} ${request.status.toUpperCase()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Sent:</span>
                            <span class="text-white">${request.timestamp.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Response Time:</span>
                            <span class="text-white">${responseTime}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Communication:</span>
                            <span class="text-white">API + SMS Alert</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4 p-3 bg-gray-800/50 rounded">
                <h4 class="font-semibold text-gray-300 mb-2">VGF Agent Message</h4>
                <p class="text-sm text-gray-300">
                    "Hello ${fleet?.name || 'Fleet Operator'}, the VGF Orchestrator has detected a ${request.reason.toLowerCase()} opportunity. 
                    We're requesting ${request.requestedMW.toFixed(1)} MW of dispatch capacity at $${request.price.toFixed(2)}/MWh. 
                    Please respond within 15 minutes if you can participate in this grid service."
                </p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
};

const hideCommunicationModal = () => {
    const modal = document.getElementById('communication-modal');
    modal.classList.add('hidden');
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
    let totalFleetRevenue = 0;
    let totalFleetSavings = 0;
    let totalCarbonAvoided = 0;

    fleets.forEach(f => {
        if (f.status === 'dispatching') {
            gridContribution += f.totalCapacityKWh * f.avgSoc * 0.2; // Assume 20% dispatch rate
            totalFleetRevenue += f.revenue || 0;
            // Carbon avoided calculation (assuming 0.5 kg CO2/kWh from fossil fuel generation)
            totalCarbonAvoided += (f.totalCapacityKWh * f.avgSoc * 0.2 * 0.5) / 1000; // kg CO2
        }
        if (f.status === 'charging') {
            chargingLoad += f.totalCapacityKWh * 0.15;
            totalFleetSavings += f.savings || 0;
        }
    });

    const gridContributionMW = parseFloat(formatMW(gridContribution));
    const chargingLoadMW = parseFloat(formatMW(chargingLoad));

    // Update KPI dashboard
    animateNumber(kpiFleetsEl, fleets.length);
    animateNumber(kpiPeakEl, Math.round(gridContributionMW));
    animateNumber(kpiRevenueEl, Math.round(gridContributionMW * 1.2 * 24)); // Mock daily revenue
    animateNumber(kpiCapexEl, Math.max(1, Math.round(gridContributionMW * 2)));

    // Update grid status
    gridFreqEl.textContent = `${randomBetween(59.98, 60.02).toFixed(2)} Hz`;
    const demand = 1200 + randomBetween(-50, 50) - gridContributionMW + chargingLoadMW;
    gridDemandEl.textContent = `${demand.toFixed(0)} MW`;
    const price = simulateGridEvents(); // Use new grid event simulation
    gridPriceEl.textContent = `$${price.toFixed(0)}/MWh`;
    gridPriceEl.className = `font-bold text-lg ${price > 100 ? 'text-red-400' : 'text-green-400'}`;

    // VGF Agent-driven optimization (run every 30 seconds)
    if (Date.now() % 30000 < 5000) { // Every 30 seconds
        optimizeFleetDispatch(price, demand);
    }

    // Apply synthetic telematics to update fleet SoC realistically
    fleets.forEach(fleet => {
        if (fleet.status !== 'offline') {
            generateSyntheticTelematics(fleet);
        }
    });

    // Update market integration panel
    bidCapacityEl.textContent = `${gridContributionMW.toFixed(1)} MW`;
    marketRevenueEl.textContent = `$${Math.round(totalFleetRevenue).toLocaleString()}`;
    carbonAvoidedEl.textContent = `${Math.round(totalCarbonAvoided).toLocaleString()} kg CO₂`;

    // Update grid zone details
    const uniqueZones = [...new Set(fleets.map(f => f.gridZone))];
    const primaryZone = uniqueZones[0] || 'CAISO Zone 3';
    const primarySubstation = fleets.find(f => f.gridZone === primaryZone)?.substation || 'Oakland 115kV';
    
    primaryZoneEl.textContent = primaryZone;
    substationEl.textContent = primarySubstation;
    fleetCoverageEl.textContent = `${uniqueZones.length} Zones`;
    
    // Check for grid constraints based on zone capacity
    const totalFleetCapacity = fleets.reduce((acc, f) => acc + f.totalCapacityKWh, 0) / 1000; // MW
    const zoneCapacity = gridZones[primaryZone]?.capacity || 2000;
    const constraintStatus = totalFleetCapacity > zoneCapacity * 0.8 ? 'Capacity Limit' : 'None';
    gridConstraintsEl.textContent = constraintStatus;
    gridConstraintsEl.className = `text-${constraintStatus === 'None' ? 'green' : 'yellow'}-400`;

    // Update fleet economics dashboard
    gridStabilityEl.textContent = gridContributionMW > 0 ? '100%' : '95%';
    peakShavingEl.textContent = `${gridContributionMW.toFixed(1)} MW`;
    voltageSupportEl.textContent = gridContributionMW > 0 ? 'Active' : 'Standby';
    frequencyRegEl.textContent = gridContributionMW > 0 ? 'Active' : 'Standby';
    
    fleetRevenueEl.textContent = `$${Math.round(totalFleetRevenue).toLocaleString()}`;
    const totalFleetCost = fleets.reduce((acc, f) => acc + (f.vehicleCount * 1500), 0); // Mock TCO calculation
    const tcoReductionPercent = totalFleetCost > 0 ? (totalFleetRevenue / totalFleetCost * 100) : 0;
    tcoReductionEl.textContent = `${tcoReductionPercent.toFixed(1)}%`;
    demandSavingsEl.textContent = `$${Math.round(totalFleetSavings).toLocaleString()}`;
    routeAssuranceEl.textContent = '100%'; // All fleets meet their SoC requirements

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
    
    // Update analytics
    updateAnalytics();
    
    // Update synthetic telematics data
    updateTelematicsData();
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
        
        const communicationClasses = {
            connected: 'text-green-400',
            request_sent: 'text-yellow-400',
            confirmed: 'text-blue-400',
            declined: 'text-red-400'
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
                    <p class="text-xs ${communicationClasses[f.communicationStatus] || 'text-gray-400'}">
                        <i class="ph-radio-button mr-1"></i>${f.communicationStatus.replace('_', ' ')}
                    </p>
                    <p class="text-xs text-gray-500">
                        <i class="ph-map-pin mr-1"></i>${f.location} - ${f.gridZone}
                    </p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <button class="toggle-offline p-1" data-fleet-id="${f.id}" title="${f.status === 'offline' ? 'Reconnect' : 'Disconnect'}">
                    <i class="${f.status === 'offline' ? 'ph-plugs-connected text-green-400' : 'ph-plug text-red-400'} text-xl"></i>
                </button>
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

    // Attach offline/reconnect listeners (fresh each render)
    fleetListEl.querySelectorAll('.toggle-offline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.fleetId;
            const fleet = fleets.find(fl => fl.id === id);
            if (!fleet) return;

            if (fleet.status === 'offline') {
                fleet.status = 'available';
                fleet.communicationStatus = 'connected';
                addLog(`${fleet.name} reconnected to orchestrator.`, 'success');
            } else {
                fleet.status = 'offline';
                fleet.communicationStatus = 'disconnected';
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

const createSimChart = () => {
    const ctx = document.getElementById('simChart');
    if (!ctx) return;
    
    simChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Simulated Dispatch (MW)',
                    data: [],
                    borderColor: 'rgba(96, 165, 250, 1)',
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Simulated Charging (MW)',
                    data: [],
                    borderColor: 'rgba(251, 191, 36, 1)',
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4
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

const updateSimChartData = (newData) => {
    if (!simChart) return;
    simChart.data.labels = newData.labels;
    simChart.data.datasets[0].data = newData.dispatchedPower;
    simChart.data.datasets[1].data = newData.chargingLoad;
    simChart.update('quiet');
};

const liveChartUpdate = () => {
    if (!chart) return;

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
// This functionality has been removed as the dashboard now only shows live mode
// and simulation is handled in a separate tab

// --- EVENT HANDLERS ---
// Mode switching event handlers removed - no longer needed

runSimBtn.addEventListener('click', () => {
    // Determine if user entered a custom fleet or selected a template
    let selectedFleet;

    const customName = fleetNameInputEl.value.trim();
    const customCount = parseInt(vehicleCountInputEl.value, 10);
    const customType = vehicleTypeSelectEl.value;
    const customLocation = locationSelectEl.value;

    if (customName && customCount > 0) {
        const meta = vehicleTypeMeta[customType] || vehicleTypeMeta['Delivery Van'];
        selectedFleet = {
            id: `pf-${Date.now()}`,
            name: customName,
            vehicleCount: customCount,
            totalCapacityKWh: meta.capacity * customCount,
            type: customType,
            icon: meta.icon,
            location: customLocation,
            gridZone: locationToZone[customLocation] || 'CAISO Zone 3',
            substation: gridZones[locationToZone[customLocation] || 'CAISO Zone 3']?.primarySubstation || 'Unknown'
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

        updateSimChartData({
            labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
            dispatchedPower: hourlyDispatch,
            chargingLoad: hourlyCharge
        });

        // Persist final SoC for onboarding / realism
        selectedFleet.avgSoc = simData.finalSoc;
        lastSimFleet.avgSoc = simData.finalSoc;
        lastSimFleet.revenue = simData.revenue; // Store the calculated revenue

        simRevenueEl.textContent = `Projected Annual Revenue: $${(simData.revenue * 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        simTcoEl.textContent = `Estimated TCO Reduction: ${(simData.revenue / (selectedFleet.vehicleCount * 1500)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1 })}`;
        simResultsEl.classList.remove('hidden');
        onboardFleetBtn.classList.remove('hidden');
        runSimBtn.disabled = false;
        runSimBtn.textContent = 'Run Simulation';
        
        // Update simulation chart
        updateSimChartData({
            labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
            dispatchedPower: hourlyDispatch,
            chargingLoad: hourlyCharge
        });
    }, 1500);
});

// Onboard fleet after successful simulation
onboardFleetBtn.addEventListener('click', () => {
    if (!lastSimFleet) return;
    
    showOnboardingModal(lastSimFleet);
});

// Modal event handlers
document.getElementById('confirm-onboard-btn').addEventListener('click', () => {
    if (!lastSimFleet) return;
    
    fleets.push({
        ...lastSimFleet,
        avgSoc: 0.8,
        status: 'available',
        revenue: 0,
        savings: 0,
        communicationStatus: 'connected',
        lastResponse: null
    });

    renderFleetList();
    updateDashboard();
    addLog(`Fleet '${lastSimFleet.name}' onboarded to active program.`, 'success');
    
    hideOnboardingModal();
    onboardFleetBtn.classList.add('hidden');
});

document.getElementById('cancel-onboard-btn').addEventListener('click', () => {
    hideOnboardingModal();
});

// Communication modal close button
closeCommunicationBtn.addEventListener('click', () => {
    hideCommunicationModal();
});

// Sidebar toggle functionality
const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');

sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
});

// Initialize sidebar state
const initSidebar = () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
};

// Analytics data updates
const updateAnalytics = () => {
    const totalRevenue = fleets.reduce((acc, f) => acc + (f.revenue || 0), 0);
    const weeklyRevenue = totalRevenue * 7; // Daily to weekly
    weeklyRevenueEl.textContent = `$${Math.round(weeklyRevenue).toLocaleString()}`;
    
    const responseRate = dispatchRequests.length > 0 ? 
        (dispatchRequests.filter(r => r.status !== 'pending').length / dispatchRequests.length * 100) : 0;
    avgResponseRateEl.textContent = `${responseRate.toFixed(1)}%`;
};

// Synthetic telematics data updates
const updateTelematicsData = () => {
    const uniqueFleetTypes = [...new Set(fleets.map(f => f.type))];
    activePatternsEl.textContent = `${uniqueFleetTypes.length} Fleet Types`;
    
    const currentHour = new Date().getHours();
    const operationalFleets = fleets.filter(f => {
        const pattern = generateSyntheticTelematics(f);
        return pattern.isOperational;
    });
    
    routeSimulationEl.textContent = `${operationalFleets.length}/${fleets.length} Active`;
    
    // Show last update time
    const now = new Date();
    socUpdatesEl.textContent = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// --- UX: Deselect template when user customises fields ---
const clearTemplateSelection = () => { 
    simFleetSelectEl.value = ''; 
};
[fleetNameInputEl, vehicleTypeSelectEl, vehicleCountInputEl, locationSelectEl].forEach(el => {
    el.addEventListener('input', clearTemplateSelection);
    el.addEventListener('change', clearTemplateSelection);
});

// When a template is chosen, wipe custom inputs
simFleetSelectEl.addEventListener('change', () => {
    if (simFleetSelectEl.value) {
        fleetNameInputEl.value = '';
        vehicleCountInputEl.value = '';
        locationSelectEl.value = 'Oakland, CA';
    }
});

// Manual dispatch request button
// manualDispatchBtn.addEventListener('click', () => {
//     const availableFleets = fleets.filter(f => f.status === 'available' && f.communicationStatus === 'connected');
//     if (availableFleets.length === 0) {
//         addLog('❌ No available fleets for dispatch request.', 'warn');
//         return;
//     }
    
//     const randomFleet = availableFleets[Math.floor(Math.random() * availableFleets.length)];
//     const requestedMW = randomBetween(0.5, 2.0);
//     const price = randomBetween(100, 300);
//     const reasons = ['Peak Load Reduction', 'Market Opportunity', 'Grid Stability', 'Frequency Regulation'];
//     const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
//     sendDispatchRequest(randomFleet, requestedMW, price, reason);
// });

// Clear all requests button
// clearRequestsBtn.addEventListener('click', () => {
//     dispatchRequests = [];
//     updateDispatchRequestsUI();
//     addLog('🗑️ All dispatch requests cleared.', 'info');
// });

// Tab navigation functionality
const initTabNavigation = () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.add('active');
                }
            });
            
            // Don't log tab changes to keep event log clean
        });
    });
};

// Modal functionality
const showOnboardingModal = (fleet) => {
    const modal = document.getElementById('onboarding-modal');
    const details = document.getElementById('onboarding-details');
    
    // Calculate revenue from simulation data
    const annualRevenue = (fleet.revenue * 365).toLocaleString('en-US', { maximumFractionDigits: 0 });
    
    details.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Fleet Name:</span>
                <span class="font-bold text-white">${fleet.name}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Vehicle Type:</span>
                <span class="font-bold text-white">${fleet.type}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Vehicle Count:</span>
                <span class="font-bold text-white">${fleet.vehicleCount}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Location:</span>
                <span class="font-bold text-white">${fleet.location || 'Oakland, CA'}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Total Capacity:</span>
                <span class="font-bold text-white">${fleet.totalCapacityKWh} kWh</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-300">Projected Revenue:</span>
                <span class="font-bold text-green-400">$${annualRevenue}/year</span>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
};

const hideOnboardingModal = () => {
    const modal = document.getElementById('onboarding-modal');
    modal.classList.add('hidden');
};

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
    // Initialize splash screen first
    initSplashScreen();
    
    // Initialize all other components
    createChart();
    createSimChart(); // Initialize simulation chart
    renderFleetList();
    populateSimSelect();
    updateTime();
    updateDispatchRequestsUI(); // Initialize dispatch requests UI
    applyTheme(localStorage.getItem('theme') || 'light');
    startLiveUpdates(); // Start live updates immediately
    addLog('System Initialized. Welcome to the VGF Orchestrator.', 'success');
    initTabNavigation(); // Initialize tab navigation
    initSidebar(); // Initialize sidebar state
    updateAnalytics(); // Initialize analytics
    updateTelematicsData(); // Initialize telematics data
}); 