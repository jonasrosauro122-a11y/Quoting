(() => {
  "use strict";

  const TRAINER_PASSWORD = "LavaTrainer2025!";
  const STORAGE = {
    currentUser: "lava_static_current_user",
    users: "lava_static_users",
    quotes: "lava_static_quotes",
    theme: "lava_static_theme"
  };

  const CARRIERS = [
    { id: "travelers", name: "Travelers", shortName: "TRV", color: "#E31937", autoBase: 1280, homeBase: 1350, variance: [-0.03, 0.04], amBest: "A++" },
    { id: "safeco", name: "Safeco", shortName: "SAF", color: "#003DA5", autoBase: 1120, homeBase: 1280, variance: [-0.04, 0.03], amBest: "A" },
    { id: "progressive", name: "Progressive", shortName: "PRG", color: "#0070C0", autoBase: 1050, homeBase: 1180, variance: [-0.05, 0.05], amBest: "A+" },
    { id: "mercury", name: "Mercury", shortName: "MRC", color: "#B21F24", autoBase: 1090, homeBase: 1250, variance: [-0.03, 0.03], amBest: "A" },
    { id: "bamboo", name: "Bamboo", shortName: "BAM", color: "#008060", autoBase: 1180, homeBase: 1050, variance: [-0.04, 0.06], amBest: "A-" },
    { id: "erie", name: "Erie", shortName: "ERI", color: "#005EB8", autoBase: 1160, homeBase: 1380, variance: [-0.02, 0.04], amBest: "A+" },
    { id: "national_general", name: "National General", shortName: "NG", color: "#4B5563", autoBase: 1220, homeBase: 1150, variance: [-0.05, 0.04], amBest: "A-" }
  ];

  const STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"
  ];

  const AUTO_SCENARIOS = {
    easy: {
      fullName: "Maria Santos", dateOfBirth: "1992-06-15", state: "CA", zip: "90210",
      vin: "1HGCM82633A004352", year: "2021", make: "Honda", model: "Accord", annualMileage: "9500", vehicleUse: "Commute",
      licenseStatus: "valid", yearsDriving: "10", atFaultAccidents: "0", movingViolations: "0", liabilityLimit: "100/300",
      compDeductible: "500", collisionDeductible: "500", medicalPayments: "5000",
      uninsuredMotorist: true, rentalReimbursement: true, roadsideAssistance: false,
      multiCar: false, homeownerBundle: true, goodDriver: true, safetyDevice: true, dynamicDrive: false
    },
    normal: {
      fullName: "Daniel Rivera", dateOfBirth: "1985-02-20", state: "TX", zip: "75001",
      vin: "5YJ3E1EA7KF317000", year: "2019", make: "Tesla", model: "Model 3", annualMileage: "13500", vehicleUse: "Commute",
      licenseStatus: "valid", yearsDriving: "6", atFaultAccidents: "1", movingViolations: "0", liabilityLimit: "100/300",
      compDeductible: "1000", collisionDeductible: "1000", medicalPayments: "5000",
      uninsuredMotorist: true, rentalReimbursement: false, roadsideAssistance: true,
      multiCar: true, homeownerBundle: false, goodDriver: false, safetyDevice: true, dynamicDrive: true
    },
    hard: {
      fullName: "Chris Morgan", dateOfBirth: "2003-11-08", state: "FL", zip: "33101",
      vin: "3FA6P0H75ER208976", year: "2014", make: "Ford", model: "Fusion", annualMileage: "21000", vehicleUse: "Business",
      licenseStatus: "valid", yearsDriving: "2", atFaultAccidents: "2", movingViolations: "2", liabilityLimit: "250/500",
      compDeductible: "250", collisionDeductible: "250", medicalPayments: "10000",
      uninsuredMotorist: true, rentalReimbursement: true, roadsideAssistance: true,
      multiCar: false, homeownerBundle: false, goodDriver: false, safetyDevice: false, dynamicDrive: false
    }
  };

  const HOME_SCENARIOS = {
    easy: {
      fullName: "Ana Lopez", state: "VA", zip: "22030", policyType: "HO3", yearBuilt: "2018", constructionType: "masonry", roofType: "metal", roofAge: "4",
      swimmingPool: false, trampoline: false, dwellingCoverage: "350000", otherStructures: "10", personalProperty: "50", liability: "300000", medicalPayments: "5000", numberOfClaims: "0",
      multiPolicy: true, protectiveDevices: true, claimsFree: true, replacementCost: true, waterBackup: false, earthquake: false, flood: false
    },
    normal: {
      fullName: "Jordan Miller", state: "CA", zip: "95814", policyType: "HO6", yearBuilt: "1998", constructionType: "frame", roofType: "tile", roofAge: "12",
      swimmingPool: false, trampoline: false, dwellingCoverage: "180000", otherStructures: "0", personalProperty: "40", liability: "300000", medicalPayments: "5000", numberOfClaims: "1",
      multiPolicy: true, protectiveDevices: false, claimsFree: false, replacementCost: true, waterBackup: true, earthquake: true, flood: false
    },
    hard: {
      fullName: "Taylor Bennett", state: "FL", zip: "33139", policyType: "HO3", yearBuilt: "1958", constructionType: "frame", roofType: "asphalt", roofAge: "24",
      swimmingPool: true, trampoline: true, dwellingCoverage: "625000", otherStructures: "10", personalProperty: "70", liability: "500000", medicalPayments: "10000", numberOfClaims: "3",
      multiPolicy: false, protectiveDevices: false, claimsFree: false, replacementCost: true, waterBackup: true, earthquake: false, flood: true
    }
  };

  const dom = {
    topbar: document.getElementById("topbar"),
    loginScreen: document.getElementById("loginScreen"),
    loginForm: document.getElementById("loginForm"),
    loginName: document.getElementById("loginName"),
    loginEmail: document.getElementById("loginEmail"),
    loginError: document.getElementById("loginError"),
    trainerPasswordWrap: document.getElementById("trainerPasswordWrap"),
    trainerPassword: document.getElementById("trainerPassword"),
    logoutBtn: document.getElementById("logoutBtn"),
    themeToggle: document.getElementById("themeToggle"),
    autoForm: document.getElementById("autoForm"),
    homeForm: document.getElementById("homeForm"),
    resultsGrid: document.getElementById("resultsGrid"),
    resultsTitle: document.getElementById("resultsTitle"),
    resultsMeta: document.getElementById("resultsMeta"),
    saveQuoteBtn: document.getElementById("saveQuoteBtn"),
    printQuoteBtn: document.getElementById("printQuoteBtn"),
    historyTable: document.getElementById("historyTable"),
    usersTable: document.getElementById("usersTable"),
    toast: document.getElementById("toast")
  };

  let selectedRole = "student";
  let currentQuote = null;

  function getJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Unable to read ${key}`, error);
      return fallback;
    }
  }

  function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCurrentUser() {
    return getJson(STORAGE.currentUser, null);
  }

  function setCurrentUser(user) {
    setJson(STORAGE.currentUser, user);
    const users = getJson(STORAGE.users, []);
    const existing = users.find(item => item.email === user.email);
    const now = new Date().toISOString();
    if (existing) {
      existing.name = user.name;
      existing.role = user.role;
      existing.loginCount = (existing.loginCount || 0) + 1;
      existing.lastLogin = now;
    } else {
      users.unshift({ ...user, loginCount: 1, createdAt: now, lastLogin: now });
    }
    setJson(STORAGE.users, users);
  }

  function getQuotes() {
    return getJson(STORAGE.quotes, []);
  }

  function setQuotes(quotes) {
    setJson(STORAGE.quotes, quotes);
  }

  function money(value) {
    return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  }

  function dateShort(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => dom.toast.classList.remove("show"), 2600);
  }

  function populateStates() {
    document.querySelectorAll('select[name="state"]').forEach(select => {
      select.innerHTML = STATES.map(state => `<option value="${state}">${state}</option>`).join("");
      select.value = "CA";
    });
  }

  function formToObject(form) {
    const data = {};
    const elements = Array.from(form.elements).filter(el => el.name);
    elements.forEach(el => {
      if (el.type === "checkbox") data[el.name] = el.checked;
      else data[el.name] = el.value.trim ? el.value.trim() : el.value;
    });
    return data;
  }

  function fillForm(form, values) {
    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements[name];
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value;
    });
  }

  function requiredNumber(value, fallback = 0) {
    const parsed = parseFloat(String(value || "").replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function calculateAge(dob) {
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return 35;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  }

  function getAgeFactor(dob) {
    const age = calculateAge(dob);
    if (age < 18) return 2.0;
    if (age < 21) return 1.65;
    if (age < 25) return 1.45;
    if (age < 30) return 1.15;
    if (age <= 65) return 1.0;
    if (age <= 75) return 1.15;
    return 1.35;
  }

  function getVehicleAgeFactor(year) {
    const vehicleAge = new Date().getFullYear() - requiredNumber(year, 2020);
    if (vehicleAge <= 1) return 1.25;
    if (vehicleAge <= 3) return 1.15;
    if (vehicleAge <= 5) return 1.05;
    if (vehicleAge <= 10) return 1.0;
    if (vehicleAge <= 15) return 0.9;
    return 0.8;
  }

  function getMileageFactor(mileage) {
    const m = requiredNumber(mileage, 12000);
    if (m < 5000) return 0.85;
    if (m < 8000) return 0.9;
    if (m < 12000) return 1.0;
    if (m < 15000) return 1.05;
    if (m < 20000) return 1.15;
    return 1.25;
  }

  function getDrivingRecordFactor(accidents, violations) {
    return 1 + requiredNumber(accidents, 0) * 0.25 + requiredNumber(violations, 0) * 0.12;
  }

  function getLicenseStatusFactor(status) {
    return ({ valid: 1, permit: 1.5, suspended: 2.5, revoked: 3 })[status] || 1;
  }

  function getYearsDrivingFactor(years) {
    const y = requiredNumber(years, 5);
    if (y < 1) return 1.6;
    if (y < 3) return 1.3;
    if (y < 5) return 1.1;
    if (y <= 10) return 1.0;
    return 0.95;
  }

  function getLiabilityMultiplier(limit) {
    return ({ "25/50": 0.8, "50/100": 1.0, "100/300": 1.25, "250/500": 1.55 })[limit] || 1.0;
  }

  function getDeductibleFactor(deductible) {
    return ({ "250": 1.2, "500": 1.0, "1000": 0.85, "2000": 0.7 })[deductible] || 1.0;
  }

  function getStateFactor(state) {
    const high = { MI: 1.45, FL: 1.35, LA: 1.3, NY: 1.25, NJ: 1.25, CA: 1.2, TX: 1.15, GA: 1.1, DC: 1.2, CT: 1.15 };
    const low = { ME: 0.8, VT: 0.82, NH: 0.82, IA: 0.85, ID: 0.85, OH: 0.88, WI: 0.88, NC: 0.9, VA: 0.9, IN: 0.9 };
    return high[state] || low[state] || 1.0;
  }

  function getPolicyTypeFactor(type) {
    return ({ HO3: 1.0, HO4: 0.3, HO6: 0.5 })[type] || 1.0;
  }

  function getYearBuiltFactor(yearBuilt) {
    const year = requiredNumber(yearBuilt, 2000);
    if (year < 1960) return 1.45;
    if (year < 1980) return 1.3;
    if (year < 2000) return 1.1;
    if (year < 2010) return 1.0;
    return 0.95;
  }

  function getRoofFactor(roofType, roofAge) {
    const typeFactor = ({ asphalt: 1.0, tile: 0.9, metal: 0.85, slate: 0.8 })[roofType] || 1.0;
    const age = requiredNumber(roofAge, 10);
    let ageFactor = 1.0;
    if (age > 20) ageFactor = 1.4;
    else if (age > 15) ageFactor = 1.25;
    else if (age > 10) ageFactor = 1.1;
    return typeFactor * ageFactor;
  }

  function getConstructionFactor(type) {
    return ({ frame: 1.0, masonry: 0.9, steel: 0.85 })[type] || 1.0;
  }

  function seededRandom(seed) {
    let hash = 0;
    const seedText = String(seed || "LAVA");
    for (let i = 0; i < seedText.length; i += 1) {
      hash = ((hash << 5) - hash) + seedText.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.sin(hash) * 10000) % 1 + 1) % 1;
  }

  function calculateAutoQuotes(input) {
    const discount = Math.max(0.65,
      1 - (input.multiCar ? 0.05 : 0) - (input.homeownerBundle ? 0.10 : 0) - (input.goodDriver ? 0.08 : 0) - (input.safetyDevice ? 0.03 : 0) - (input.dynamicDrive ? 0.07 : 0)
    );

    let addons = 0;
    if (input.uninsuredMotorist) addons += 45;
    if (input.rentalReimbursement) addons += 25;
    if (input.roadsideAssistance) addons += 15;
    addons += requiredNumber(input.medicalPayments, 0) * 0.003;

    const factor = getAgeFactor(input.dateOfBirth)
      * getVehicleAgeFactor(input.year)
      * getMileageFactor(input.annualMileage)
      * getDrivingRecordFactor(input.atFaultAccidents, input.movingViolations)
      * getLicenseStatusFactor(input.licenseStatus)
      * getYearsDrivingFactor(input.yearsDriving)
      * getLiabilityMultiplier(input.liabilityLimit)
      * ((getDeductibleFactor(input.compDeductible) + getDeductibleFactor(input.collisionDeductible)) / 2)
      * getStateFactor(input.state)
      * discount;

    const details = [
      ["Liability", input.liabilityLimit],
      ["Comp Deductible", `$${input.compDeductible}`],
      ["Collision Deductible", `$${input.collisionDeductible}`],
      ["Vehicle", `${input.year} ${input.make} ${input.model}`]
    ];

    const discounts = [];
    if (input.multiCar) discounts.push("Multi-Car");
    if (input.homeownerBundle) discounts.push("Home Bundle");
    if (input.goodDriver) discounts.push("Good Driver");
    if (input.safetyDevice) discounts.push("Safety Device");
    if (input.dynamicDrive) discounts.push("Telematics");

    return buildCarrierQuotes("auto", input, factor, addons, details, discounts);
  }

  function calculateHomeQuotes(input) {
    const discount = Math.max(0.7,
      1 - (input.multiPolicy ? 0.10 : 0) - (input.protectiveDevices ? 0.05 : 0) - (input.claimsFree ? 0.08 : 0)
    );
    const propertyRisk = 1 + (input.swimmingPool ? 0.08 : 0) + (input.trampoline ? 0.05 : 0);
    const claims = (() => {
      const c = requiredNumber(input.numberOfClaims, 0);
      if (c === 0) return 1;
      if (c === 1) return 1.2;
      if (c === 2) return 1.45;
      return 1.45 + (c - 2) * 0.2;
    })();
    const dwelling = requiredNumber(input.dwellingCoverage, 250000) / 250000;
    const liability = ({ "100000": 1.0, "300000": 1.15, "500000": 1.3 })[input.liability] || 1.0;

    let addons = 0;
    if (input.replacementCost) addons += 85;
    if (input.waterBackup) addons += 55;
    if (input.earthquake) addons += 180;
    if (input.flood) addons += 250;

    const factor = getPolicyTypeFactor(input.policyType)
      * getYearBuiltFactor(input.yearBuilt)
      * getRoofFactor(input.roofType, input.roofAge)
      * getConstructionFactor(input.constructionType)
      * propertyRisk
      * claims
      * discount
      * dwelling
      * liability
      * getStateFactor(input.state);

    const details = [
      ["Policy Type", input.policyType],
      ["Dwelling", money(input.dwellingCoverage)],
      ["Liability", money(input.liability)],
      ["Year Built", input.yearBuilt]
    ];

    const discounts = [];
    if (input.multiPolicy) discounts.push("Multi-Policy");
    if (input.protectiveDevices) discounts.push("Protective Devices");
    if (input.claimsFree) discounts.push("Claims-Free");
    if (input.replacementCost) discounts.push("Replacement Cost");
    if (input.waterBackup) discounts.push("Water Backup");
    if (input.earthquake) discounts.push("Earthquake");
    if (input.flood) discounts.push("Flood");

    return buildCarrierQuotes("home", input, factor, addons, details, discounts);
  }

  function buildCarrierQuotes(type, input, factor, addons, details, discounts) {
    const seedBase = `${type}-${input.fullName}-${input.zip}-${input.state}-${input.vin || input.yearBuilt || ""}`;
    const quotes = CARRIERS.map(carrier => {
      const [minVariance, maxVariance] = carrier.variance;
      const rand = seededRandom(seedBase + carrier.id);
      const variance = 1 + minVariance + rand * (maxVariance - minVariance);
      const base = type === "auto" ? carrier.autoBase : carrier.homeBase;
      const annualPremium = Math.round((base * factor * variance + addons) * 100) / 100;
      return {
        carrierId: carrier.id,
        carrierName: carrier.name,
        shortName: carrier.shortName,
        color: carrier.color,
        amBest: carrier.amBest,
        annualPremium,
        semiAnnualPremium: Math.round((annualPremium / 2) * 100) / 100,
        monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
        details,
        discounts,
        best: false
      };
    }).sort((a, b) => a.annualPremium - b.annualPremium);
    if (quotes[0]) quotes[0].best = true;
    return quotes;
  }

  function createQuote(type, input, quotes) {
    const user = getCurrentUser();
    return {
      id: `LAVA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      type,
      vaName: user?.name || "Guest",
      vaEmail: user?.email || "",
      applicant: input.fullName,
      state: input.state,
      zip: input.zip,
      input,
      quotes,
      bestCarrier: quotes[0]?.carrierName || "—",
      bestAnnual: quotes[0]?.annualPremium || 0,
      createdAt: new Date().toISOString(),
      saved: false
    };
  }

  function renderResults(quote) {
    currentQuote = quote;
    dom.resultsTitle.textContent = `${quote.type === "auto" ? "Auto" : "Homeowners"} Quote Results`;
    dom.resultsMeta.textContent = `${quote.applicant} • ${quote.state} ${quote.zip} • Generated by ${quote.vaName} • ${dateShort(quote.createdAt)}`;
    dom.saveQuoteBtn.textContent = quote.saved ? "Already Saved" : "Save Quote";
    dom.resultsGrid.innerHTML = quote.quotes.map(item => `
      <article class="result-card glass-card ${item.best ? "best" : ""}">
        <div class="result-top">
          <div>
            <span class="badge ${item.best ? "best-badge" : ""}">${item.best ? "Best Value" : "Carrier Option"}</span>
            <h3 style="margin-top:12px">${escapeHtml(item.carrierName)}</h3>
          </div>
          <div class="carrier-mark" style="background:${item.color}">${escapeHtml(item.shortName)}</div>
        </div>
        <div class="premium">
          <strong>${money(item.annualPremium)}</strong>
          <span>Annual premium</span>
        </div>
        <div class="detail-list">
          <div><span>Monthly</span><strong>${money(item.monthlyPremium)}</strong></div>
          <div><span>Semi-Annual</span><strong>${money(item.semiAnnualPremium)}</strong></div>
          <div><span>AM Best</span><strong>${escapeHtml(item.amBest)}</strong></div>
          ${item.details.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
          <div><span>Discounts</span><strong>${item.discounts.length ? escapeHtml(item.discounts.join(", ")) : "None"}</strong></div>
        </div>
      </article>
    `).join("");
  }

  function saveCurrentQuote() {
    if (!currentQuote) return;
    const quotes = getQuotes();
    const exists = quotes.some(item => item.id === currentQuote.id);
    if (!exists) {
      currentQuote.saved = true;
      quotes.unshift(currentQuote);
      setQuotes(quotes);
      dom.saveQuoteBtn.textContent = "Already Saved";
      showToast("Quote saved to local history.");
    } else {
      showToast("This quote is already saved.");
    }
    refreshAllViews();
  }

  function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    const allQuotes = getQuotes();
    const myQuotes = user.role === "trainer" ? allQuotes : allQuotes.filter(item => item.vaEmail === user.email);
    const auto = myQuotes.filter(item => item.type === "auto");
    const home = myQuotes.filter(item => item.type === "home");
    const carrierCounts = myQuotes.reduce((acc, item) => {
      acc[item.bestCarrier] = (acc[item.bestCarrier] || 0) + 1;
      return acc;
    }, {});
    const topCarrier = Object.entries(carrierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    document.getElementById("welcomeName").textContent = `Welcome back, ${user.name}`;
    document.getElementById("welcomeSubtext").textContent = user.role === "trainer"
      ? "Trainer mode is active. You can monitor local quote activity and users."
      : "Select Auto or Homeowners to start a new training quote.";
    document.getElementById("statTotal").textContent = myQuotes.length;
    document.getElementById("statAuto").textContent = auto.length;
    document.getElementById("statHome").textContent = home.length;
    document.getElementById("statCarrier").textContent = topCarrier;
  }

  function renderHistory() {
    const user = getCurrentUser();
    const allQuotes = getQuotes();
    const rows = (user?.role === "trainer" ? allQuotes : allQuotes.filter(item => item.vaEmail === user?.email));
    dom.historyTable.innerHTML = rows.length ? rows.map(item => `
      <tr>
        <td>${dateShort(item.createdAt)}</td>
        <td>${escapeHtml(item.vaName)}</td>
        <td>${item.type === "auto" ? "Auto" : "Home"}</td>
        <td>${escapeHtml(item.applicant)}</td>
        <td>${escapeHtml(item.bestCarrier)}</td>
        <td>${money(item.bestAnnual)}</td>
        <td><div class="row-actions"><button data-view-quote="${item.id}">View</button><button data-delete-quote="${item.id}">Delete</button></div></td>
      </tr>
    `).join("") : `<tr><td colspan="7">No saved quotes yet.</td></tr>`;
  }

  function renderTrainer() {
    const user = getCurrentUser();
    if (user?.role !== "trainer") return;
    const users = getJson(STORAGE.users, []);
    const quotes = getQuotes();
    document.getElementById("trainerUsers").textContent = users.length;
    document.getElementById("trainerQuotes").textContent = quotes.length;
    document.getElementById("trainerAuto").textContent = quotes.filter(item => item.type === "auto").length;
    document.getElementById("trainerHome").textContent = quotes.filter(item => item.type === "home").length;
    dom.usersTable.innerHTML = users.length ? users.map(item => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.role)}</td>
        <td>${item.loginCount || 0}</td>
        <td>${dateShort(item.lastLogin)}</td>
      </tr>
    `).join("") : `<tr><td colspan="5">No users yet.</td></tr>`;
  }

  function refreshAllViews() {
    const user = getCurrentUser();
    const isTrainer = user?.role === "trainer";
    document.querySelectorAll(".trainer-only").forEach(el => el.classList.toggle("hidden", !isTrainer));
    renderDashboard();
    renderHistory();
    renderTrainer();
  }

  function routeTo(route) {
    const user = getCurrentUser();
    if (!user && route !== "login") route = "login";
    if (route === "trainer" && user?.role !== "trainer") route = "dashboard";
    const map = {
      login: "loginScreen",
      dashboard: "dashboardScreen",
      auto: "autoScreen",
      home: "homeScreen",
      results: "resultsScreen",
      history: "historyScreen",
      trainer: "trainerScreen"
    };
    Object.entries(map).forEach(([key, id]) => {
      document.getElementById(id).classList.toggle("hidden", key !== route);
    });
    dom.topbar.classList.toggle("hidden", route === "login");
    document.querySelectorAll("[data-route]").forEach(btn => btn.classList.toggle("active", btn.dataset.route === route));
    if (route !== "login") refreshAllViews();
    if (location.hash.replace("#", "") !== route) history.replaceState(null, "", `#${route}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogin(event) {
    event.preventDefault();
    const name = dom.loginName.value.trim();
    const email = dom.loginEmail.value.trim().toLowerCase();
    dom.loginError.textContent = "";

    if (name.length < 2) {
      dom.loginError.textContent = "Please enter your full name.";
      return;
    }
    if (!email.endsWith("@lavatraining.com")) {
      dom.loginError.textContent = "Please use your @lavatraining.com email address.";
      return;
    }
    if (selectedRole === "trainer" && dom.trainerPassword.value !== TRAINER_PASSWORD) {
      dom.loginError.textContent = "Incorrect trainer password.";
      return;
    }

    setCurrentUser({ name, email, role: selectedRole });
    dom.loginForm.reset();
    selectedRole = "student";
    document.querySelectorAll(".role-option").forEach(btn => btn.classList.toggle("active", btn.dataset.role === selectedRole));
    dom.trainerPasswordWrap.classList.add("hidden");
    showToast("Login successful. Welcome to LAVA PL RATER.");
    routeTo("dashboard");
  }

  function logout() {
    localStorage.removeItem(STORAGE.currentUser);
    currentQuote = null;
    routeTo("login");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
  }

  function decodeVinLocal(vin) {
    const clean = String(vin || "").trim().toUpperCase();
    if (clean.length !== 17) return null;
    const yearMap = {
      A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019,
      L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
      1: 2031, 2: 2032, 3: 2033, 4: 2034, 5: 2035, 6: 2036, 7: 2037, 8: 2038, 9: 2039
    };
    const wmi = clean.slice(0, 3);
    const year = yearMap[clean[9]] || "";
    const makeMap = [
      { test: /^1HG|^2HG|^5FN/, make: "Honda", model: "Accord" },
      { test: /^JT|^4T|^5T/, make: "Toyota", model: "Camry" },
      { test: /^1FA|^2FA|^3FA/, make: "Ford", model: "Fusion" },
      { test: /^1G|^2G|^3G/, make: "Chevrolet", model: "Malibu" },
      { test: /^5YJ|^7SA/, make: "Tesla", model: "Model 3" },
      { test: /^WBA|^WBS/, make: "BMW", model: "3 Series" },
      { test: /^WDD|^4JG/, make: "Mercedes-Benz", model: "C-Class" }
    ];
    const match = makeMap.find(item => item.test.test(wmi));
    return { year, make: match?.make || "", model: match?.model || "" };
  }

  function maybeDecodeVin() {
    const vinField = dom.autoForm.elements.vin;
    const hint = document.getElementById("vinHint");
    const result = decodeVinLocal(vinField.value);
    if (!result) {
      hint.textContent = vinField.value.trim().length ? "VIN must be 17 characters for the local helper." : "Enter a 17-character VIN to auto-detect sample year/make/model when available.";
      return;
    }
    if (result.year) dom.autoForm.elements.year.value = result.year;
    if (result.make) dom.autoForm.elements.make.value = result.make;
    if (result.model) dom.autoForm.elements.model.value = result.model;
    hint.textContent = result.make ? `VIN helper detected: ${result.year || "Year unknown"} ${result.make} ${result.model}` : "VIN format looks valid, but this local helper does not recognize the WMI. You can still type the vehicle details manually.";
  }

  function downloadCsv(filename, rows) {
    if (!rows.length) {
      showToast("No records to export.");
      return;
    }
    const headers = ["Quote ID", "Date", "VA Name", "Email", "Type", "Applicant", "State", "ZIP", "Best Carrier", "Best Annual"];
    const csvRows = [headers, ...rows.map(item => [
      item.id, item.createdAt, item.vaName, item.vaEmail, item.type, item.applicant, item.state, item.zip, item.bestCarrier, item.bestAnnual
    ])].map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exported.");
  }

  function initTheme() {
    const theme = localStorage.getItem(STORAGE.theme) || "dark";
    document.body.classList.toggle("light", theme === "light");
    dom.themeToggle.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
  }

  function toggleTheme() {
    const next = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem(STORAGE.theme, next);
    initTheme();
  }

  function initEvents() {
    document.addEventListener("click", event => {
      const routeBtn = event.target.closest("[data-route]");
      if (routeBtn) routeTo(routeBtn.dataset.route);

      const autoScenario = event.target.closest("[data-auto-scenario]");
      if (autoScenario) {
        fillForm(dom.autoForm, AUTO_SCENARIOS[autoScenario.dataset.autoScenario]);
        maybeDecodeVin();
        showToast("Auto scenario loaded.");
      }

      const homeScenario = event.target.closest("[data-home-scenario]");
      if (homeScenario) {
        fillForm(dom.homeForm, HOME_SCENARIOS[homeScenario.dataset.homeScenario]);
        showToast("Home scenario loaded.");
      }

      const viewQuote = event.target.closest("[data-view-quote]");
      if (viewQuote) {
        const quote = getQuotes().find(item => item.id === viewQuote.dataset.viewQuote);
        if (quote) {
          quote.saved = true;
          renderResults(quote);
          routeTo("results");
        }
      }

      const deleteQuote = event.target.closest("[data-delete-quote]");
      if (deleteQuote && confirm("Delete this saved quote?")) {
        setQuotes(getQuotes().filter(item => item.id !== deleteQuote.dataset.deleteQuote));
        refreshAllViews();
        showToast("Quote deleted.");
      }
    });

    document.querySelectorAll(".role-option").forEach(button => {
      button.addEventListener("click", () => {
        selectedRole = button.dataset.role;
        document.querySelectorAll(".role-option").forEach(btn => btn.classList.toggle("active", btn === button));
        dom.trainerPasswordWrap.classList.toggle("hidden", selectedRole !== "trainer");
      });
    });

    dom.loginForm.addEventListener("submit", handleLogin);
    dom.logoutBtn.addEventListener("click", logout);
    dom.themeToggle.addEventListener("click", toggleTheme);
    dom.saveQuoteBtn.addEventListener("click", saveCurrentQuote);
    dom.printQuoteBtn.addEventListener("click", () => window.print());
    dom.autoForm.elements.vin.addEventListener("input", maybeDecodeVin);

    dom.autoForm.addEventListener("submit", event => {
      event.preventDefault();
      const input = formToObject(dom.autoForm);
      const quotes = calculateAutoQuotes(input);
      const quote = createQuote("auto", input, quotes);
      renderResults(quote);
      routeTo("results");
      showToast("Auto quote generated.");
    });

    dom.homeForm.addEventListener("submit", event => {
      event.preventDefault();
      const input = formToObject(dom.homeForm);
      const quotes = calculateHomeQuotes(input);
      const quote = createQuote("home", input, quotes);
      renderResults(quote);
      routeTo("results");
      showToast("Home quote generated.");
    });

    document.getElementById("exportMyCsvBtn").addEventListener("click", () => {
      const user = getCurrentUser();
      const rows = user?.role === "trainer" ? getQuotes() : getQuotes().filter(item => item.vaEmail === user?.email);
      downloadCsv("lava-pl-rater-my-quotes.csv", rows);
    });

    document.getElementById("exportAllCsvBtn").addEventListener("click", () => downloadCsv("lava-pl-rater-all-quotes.csv", getQuotes()));

    document.getElementById("clearMyHistoryBtn").addEventListener("click", () => {
      const user = getCurrentUser();
      if (!user) return;
      if (!confirm("Clear your saved quote history in this browser?")) return;
      setQuotes(getQuotes().filter(item => item.vaEmail !== user.email));
      refreshAllViews();
      showToast("Your quote history was cleared.");
    });

    document.getElementById("clearAllDataBtn").addEventListener("click", () => {
      const user = getCurrentUser();
      if (user?.role !== "trainer") return;
      if (!confirm("Clear all local users and quote history? This cannot be undone.")) return;
      localStorage.removeItem(STORAGE.users);
      localStorage.removeItem(STORAGE.quotes);
      refreshAllViews();
      showToast("All local training data was cleared.");
    });

    window.addEventListener("hashchange", () => routeTo(location.hash.replace("#", "") || "dashboard"));
  }

  function init() {
    populateStates();
    initTheme();
    initEvents();
    fillForm(dom.autoForm, AUTO_SCENARIOS.easy);
    fillForm(dom.homeForm, HOME_SCENARIOS.easy);
    maybeDecodeVin();
    const initialRoute = getCurrentUser() ? (location.hash.replace("#", "") || "dashboard") : "login";
    routeTo(initialRoute);
  }

  init();
})();
