(() => {
  "use strict";

  const STORAGE_KEY = "lava_pl_rater_realistic_history_v1";
  const SESSION_KEY = "lava_pl_rater_realistic_session_v1";
  const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  const TODAY = new Date();

  const $ = (id) => document.getElementById(id);
  const money = (value) => Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const percent = (value) => `${Math.round(value)}%`;
  const clean = (value) => String(value ?? "").trim();
  const uid = () => `LQR-${TODAY.getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const stateFactor = {
    CA: 1.22, FL: 1.3, TX: 1.1, NY: 1.23, NJ: 1.18, LA: 1.25, MI: 1.19, NV: 1.16,
    GA: 1.1, AZ: 1.06, CO: 1.08, WA: 1.03, OR: 1.01, VA: 0.98, NC: 0.96, OH: 0.94,
    PA: 1.01, IL: 1.02, MA: 1.05, MD: 1.08
  };

  const carriers = [
    {
      name: "Summit Preferred",
      tier: "Preferred",
      autoBase: 1120,
      homeBase: 1380,
      appetite: "Clean risks with continuous prior insurance, favorable loss history, and strong coverage profile.",
      likes: ["Continuous prior insurance", "No major violations", "Updated homes", "Bundle and paperless discounts"],
      caution: ["Lapse over 30 days", "Older roof", "Business or rideshare exposure"],
      decline: ["DUI with SR-22", "Vacant property", "Major unrepaired damage"]
    },
    {
      name: "Harbor Standard",
      tier: "Standard",
      autoBase: 1285,
      homeBase: 1510,
      appetite: "Mainstream placement for average risks needing balanced pricing and flexible underwriting.",
      likes: ["Standard coverage limits", "Minor claim history", "Normal commute usage", "Owner-occupied homes"],
      caution: ["Two or more losses", "Old plumbing/electrical", "High mileage"],
      decline: ["Fraud concern", "Commercial delivery exposure", "Vacancy over 60 days"]
    },
    {
      name: "RedRock Select",
      tier: "Select",
      autoBase: 1215,
      homeBase: 1455,
      appetite: "Good fit for customers with stronger coverage selections and verified documentation.",
      likes: ["Higher liability limits", "Protective devices", "Roof under 15 years", "EFT or paid-in-full"],
      caution: ["Minimum limits", "Prior cancellation", "Pool without fence"],
      decline: ["Aggressive dog with bite history", "Salvage vehicle", "Unlicensed primary driver"]
    },
    {
      name: "Keystone Specialty",
      tier: "Referral / Specialty",
      autoBase: 1620,
      homeBase: 1895,
      appetite: "Backup placement for risks with underwriting flags requiring documentation or manual approval.",
      likes: ["Documented exceptions", "Trainer review", "Clear notes", "Acceptable remediation plan"],
      caution: ["Multiple claims", "Coverage lapse", "Short-term rental", "Older roof"],
      decline: ["Material misrepresentation", "Unacceptable hazard", "Ineligible occupancy"]
    }
  ];

  const app = {
    user: null,
    route: "dashboard",
    product: "auto",
    quoteNumber: uid(),
    stepIndex: 0,
    answers: { auto: {}, home: {} },
    lastResults: null
  };

  function q(id, label, type, options = {}) {
    return { id, label, type, required: false, wide: false, options: [], help: "", placeholder: "", min: null, max: null, pattern: null, ...options };
  }

  const questions = {
    auto: [
      {
        id: "setup", title: "Account Setup", short: "Quote transaction", helper: "Carrier portals begin with transaction details so the system knows what product, effective date, producer, and billing method to apply.",
        questions: [
          q("transactionType", "Transaction type", "select", { required: true, options: ["New Business", "Rewrite", "Remarket"], help: "Select New Business for first-time customer placement." }),
          q("effectiveDate", "Requested policy effective date", "date", { required: true, help: "Date coverage should begin. Do not backdate without carrier approval." }),
          q("agencyCode", "Agency / producer code", "text", { required: true, placeholder: "Example: LAVA-PL-001", help: "Training code or producer identifier used for quote tracking." }),
          q("producerName", "Producer / CSR name", "text", { required: true, placeholder: "Example: J. Rosauro", help: "The person responsible for the quote entry." }),
          q("quoteSource", "Quote source", "select", { required: true, options: ["Inbound Call", "Email Request", "Referral", "Renewal Review", "Website Lead"], help: "Helps classify how the lead entered the agency." }),
          q("paymentPlan", "Preferred payment plan", "select", { required: true, options: ["Paid in Full", "Monthly EFT", "Monthly Direct Bill", "Mortgagee Bill / Escrow Not Applicable"], help: "Payment plan can affect down payment and eligibility." })
        ]
      },
      {
        id: "insured", title: "Named Insured", short: "Customer identity", helper: "Use exact customer information. Small errors in name, date of birth, or contact details can cause policy issuance problems.",
        questions: [
          q("firstName", "Named insured first name", "text", { required: true, placeholder: "Maria", help: "Use legal name from ID or prior policy." }),
          q("lastName", "Named insured last name", "text", { required: true, placeholder: "Santos", help: "Use legal surname exactly as it should appear on the policy." }),
          q("dob", "Date of birth", "date", { required: true, help: "DOB is a rating and eligibility factor." }),
          q("maritalStatus", "Marital status", "select", { required: true, options: ["Single", "Married", "Domestic Partner", "Divorced", "Widowed"], help: "Many carriers use marital status for rating." }),
          q("email", "Customer email address", "email", { required: true, placeholder: "customer@email.com", help: "Used for e-signature, quote delivery, and policy documents." }),
          q("phone", "Best contact number", "tel", { required: true, placeholder: "555-555-1212", help: "Needed for follow-up and underwriting questions." }),
          q("occupation", "Occupation / industry", "text", { required: false, placeholder: "Example: Office Manager", help: "Some carriers ask for occupation for risk profile and discounts." }),
          q("homeownerStatus", "Residence status", "select", { required: true, options: ["Own Home", "Rent", "Condo Owner", "Live with Family", "Other"], help: "Can affect account discounts and underwriting notes." })
        ]
      },
      {
        id: "address", title: "Garaging & Mailing", short: "Address verification", helper: "The garaging address must be where the vehicle is primarily kept overnight, not simply the mailing address.",
        questions: [
          q("garageStreet", "Garaging street address", "text", { required: true, placeholder: "123 Main St", help: "Use the vehicle's primary overnight location." }),
          q("garageCity", "Garaging city", "text", { required: true, placeholder: "Los Angeles", help: "City must match garaging location." }),
          q("garageState", "Garaging state", "select", { required: true, options: STATES, help: "State determines rules, rating territory, and available coverages." }),
          q("garageZip", "Garaging ZIP code", "text", { required: true, pattern: "zip", placeholder: "90210", help: "ZIP is one of the strongest rating fields." }),
          q("mailingSame", "Is mailing address the same as garaging?", "select", { required: true, options: ["Yes", "No"], help: "If No, obtain the mailing address before binding." }),
          q("yearsAtAddress", "Years at current address", "number", { required: true, min: 0, max: 80, placeholder: "3", help: "If under 2 years, many carriers ask for prior address." }),
          q("priorAddressNeeded", "If less than 2 years, was prior address collected?", "select", { required: true, options: ["Not Applicable", "Yes", "No"], help: "Carrier may require prior residence history." })
        ]
      },
      {
        id: "prior", title: "Prior Insurance", short: "Existing coverage", helper: "Current coverage, lapse, and prior limits influence rating tier and whether proof is required.",
        questions: [
          q("currentlyInsured", "Does the customer currently have active auto insurance?", "select", { required: true, options: ["Yes", "No"], help: "No current insurance can create a surcharge or referral." }),
          q("priorCarrier", "Current or prior carrier name", "text", { required: false, placeholder: "Example: State Farm", help: "Enter carrier name if available." }),
          q("priorPolicyExpiration", "Current/prior policy expiration date", "date", { required: false, help: "Used to validate no lapse and align effective date." }),
          q("priorBILimits", "Current/prior bodily injury limits", "select", { required: true, options: ["None", "State Minimum", "25/50", "50/100", "100/300", "250/500", "500 CSL"], help: "Higher prior limits can improve tiering." }),
          q("lapseDays", "Total lapse days within the last 12 months", "number", { required: true, min: 0, max: 365, placeholder: "0", help: "Enter 0 if there was no lapse." }),
          q("priorCancellation", "Any cancellation or non-renewal for non-payment or underwriting?", "select", { required: true, options: ["No", "Yes"], help: "Prior cancellation may require referral." }),
          q("priorClaims", "Auto claims in the last 5 years", "number", { required: true, min: 0, max: 20, placeholder: "0", help: "Include liability, comp, and collision claims." })
        ]
      },
      {
        id: "vehicle", title: "Vehicle Information", short: "VIN and usage", helper: "Vehicle rating depends on VIN, age, ownership, usage, mileage, and physical damage selections.",
        questions: [
          q("vin", "Vehicle Identification Number (VIN)", "text", { required: true, placeholder: "17 characters", help: "Real VIN should have 17 characters. Verify against registration." }),
          q("vehicleYear", "Vehicle year", "number", { required: true, min: 1981, max: TODAY.getFullYear() + 1, placeholder: "2022", help: "Year affects value and physical damage rating." }),
          q("make", "Vehicle make", "text", { required: true, placeholder: "Toyota", help: "Use registration/VIN decode value." }),
          q("model", "Vehicle model / trim", "text", { required: true, placeholder: "Camry SE", help: "Trim can change vehicle symbol." }),
          q("ownership", "Ownership status", "select", { required: true, options: ["Owned", "Financed", "Leased"], help: "Financed/leased vehicles usually require comp/collision and loss payee." }),
          q("vehicleUse", "Primary vehicle use", "select", { required: true, options: ["Pleasure", "Commute", "Business", "Delivery / Rideshare"], help: "Delivery/rideshare is often ineligible or referral." }),
          q("commuteMiles", "One-way commute miles", "number", { required: true, min: 0, max: 200, placeholder: "10", help: "Use 0 for pleasure-only use." }),
          q("annualMileage", "Estimated annual mileage", "number", { required: true, min: 0, max: 100000, placeholder: "12000", help: "Higher mileage increases exposure." }),
          q("salvage", "Is the vehicle salvaged, rebuilt, customized, or modified?", "select", { required: true, options: ["No", "Yes"], help: "Modified/salvage vehicles often require review." })
        ]
      },
      {
        id: "drivers", title: "Drivers & Household", short: "Operator details", helper: "Carrier portals expect all household drivers and regular operators to be identified or properly excluded.",
        questions: [
          q("driverCount", "Total drivers to rate/list", "number", { required: true, min: 1, max: 12, placeholder: "1", help: "Include household members and regular operators." }),
          q("excludedDrivers", "Any excluded drivers requested?", "select", { required: true, options: ["No", "Yes"], help: "Excluded driver rules vary by state and carrier." }),
          q("licenseStatus", "Primary driver license status", "select", { required: true, options: ["Valid", "Permit", "Foreign License", "Suspended", "Revoked"], help: "Suspended or revoked licenses typically require referral/decline." }),
          q("licenseState", "Primary driver license state", "select", { required: true, options: STATES, help: "Use the state that issued the current license." }),
          q("yearsLicensed", "Years licensed in the U.S.", "number", { required: true, min: 0, max: 80, placeholder: "8", help: "Newly licensed drivers are higher risk." }),
          q("atFaultAccidents", "At-fault accidents in the last 5 years", "number", { required: true, min: 0, max: 20, placeholder: "0", help: "Chargeable accidents can change eligibility and price." }),
          q("violations", "Moving violations in the last 5 years", "number", { required: true, min: 0, max: 20, placeholder: "0", help: "Include speeding, reckless driving, and major tickets." }),
          q("dui", "Any DUI/DWI/reckless driving in the last 5 years?", "select", { required: true, options: ["No", "Yes"], help: "Major violations usually trigger referral." }),
          q("sr22", "Is SR-22/FR-44 filing required?", "select", { required: true, options: ["No", "Yes"], help: "Financial responsibility filing changes carrier eligibility." })
        ]
      },
      {
        id: "coverage", title: "Coverage Selection", short: "Limits and deductibles", helper: "Coverage selections must match customer needs, lienholder requirements, and state-specific options.",
        questions: [
          q("liabilityLimit", "Bodily injury liability limit", "select", { required: true, options: ["25/50", "50/100", "100/300", "250/500", "500 CSL"], help: "Higher limits improve protection and may qualify for better tiers." }),
          q("propertyDamage", "Property damage liability limit", "select", { required: true, options: ["25,000", "50,000", "100,000", "250,000"], help: "Pays for damage to others' property." }),
          q("medical", "Medical payments / PIP selection", "select", { required: true, options: ["Reject / None", "1,000", "5,000", "10,000", "State Required PIP"], help: "Availability depends on state." }),
          q("umUim", "UM/UIM selection", "select", { required: true, options: ["Reject", "Match BI", "Lower than BI", "State Minimum"], help: "Document rejection/selection where required." }),
          q("compDeductible", "Comprehensive deductible", "select", { required: true, options: ["None", "250", "500", "1000", "2000"], help: "May be required by lienholder." }),
          q("collisionDeductible", "Collision deductible", "select", { required: true, options: ["None", "250", "500", "1000", "2000"], help: "May be required for financed/leased vehicles." }),
          q("rental", "Rental reimbursement", "select", { required: true, options: ["No", "30/900", "40/1200", "50/1500"], help: "Rental limit after covered loss." }),
          q("roadside", "Roadside assistance / towing", "select", { required: true, options: ["No", "Yes"], help: "Optional towing/roadside endorsement." }),
          q("gap", "Loan/lease gap coverage requested?", "select", { required: true, options: ["No", "Yes", "Not Eligible / Not Needed"], help: "Often applicable for financed or leased vehicles." })
        ]
      },
      {
        id: "discounts", title: "Discounts & Documents", short: "Savings and proof", helper: "Only select discounts supported by customer facts and available documentation.",
        questions: [
          q("discounts", "Discounts requested / eligible", "checkbox", { wide: true, options: ["Multi-policy", "Homeowner", "Good driver", "Good student", "Defensive driver", "Telematics", "Paperless", "EFT", "Paid in full", "Anti-theft"], help: "Select only discounts that can be documented or validated." }),
          q("documents", "Documents to request before binding", "checkbox", { wide: true, options: ["Proof of prior insurance", "Driver license copy", "Vehicle registration", "Lienholder information", "Signed UM/UIM form", "Discount proof", "Photos", "No documents needed yet"], help: "Use this to train proper follow-up after rating." }),
          q("quoteNotes", "Producer quote notes", "textarea", { wide: true, required: false, placeholder: "Add customer request, coverage preference, missing information, or trainer note.", help: "Clear notes help the next person understand the quote." })
        ]
      },
      {
        id: "underwriting", title: "Underwriting Questions", short: "Eligibility flags", helper: "These are the carrier-style questions that determine whether the quote can be issued, referred, or declined.",
        questions: [
          q("businessUse", "Is any vehicle used for business, delivery, courier, livery, or rideshare?", "select", { required: true, options: ["No", "Yes"], help: "Commercial usage may be ineligible for personal auto." }),
          q("outOfState", "Is the vehicle garaged outside the policy state for more than 30 days per year?", "select", { required: true, options: ["No", "Yes"], help: "Can affect eligibility and territory." }),
          q("unlistedOperators", "Are there any unlisted regular operators or household members?", "select", { required: true, options: ["No", "Yes"], help: "Unlisted operators create underwriting concern." }),
          q("fraudConcern", "Any concern about inaccurate information, fraud, or material misrepresentation?", "select", { required: true, options: ["No", "Yes"], help: "Material misrepresentation is a serious underwriting issue." }),
          q("vehicleDamage", "Any unrepaired damage, salvage title, or vehicle not roadworthy?", "select", { required: true, options: ["No", "Yes"], help: "Can restrict physical damage coverage." }),
          q("finalReview", "All required risk questions reviewed with customer?", "select", { required: true, options: ["Yes", "No"], help: "Trainee should not run quote until customer answers have been reviewed." })
        ]
      }
    ],
    home: [
      {
        id: "setup", title: "Account Setup", short: "Quote transaction", helper: "Start by identifying the policy transaction, producer, effective date, and desired billing setup.",
        questions: [
          q("transactionType", "Transaction type", "select", { required: true, options: ["New Business", "Rewrite", "Remarket"], help: "Select New Business for first-time policy placement." }),
          q("effectiveDate", "Requested policy effective date", "date", { required: true, help: "Date coverage should start. Coordinate with closing or renewal date." }),
          q("agencyCode", "Agency / producer code", "text", { required: true, placeholder: "Example: LAVA-PL-001", help: "Training or producer code used for quote tracking." }),
          q("producerName", "Producer / CSR name", "text", { required: true, placeholder: "Example: J. Rosauro", help: "The person responsible for the quote entry." }),
          q("quoteSource", "Quote source", "select", { required: true, options: ["Inbound Call", "Email Request", "Referral", "Lender Request", "Website Lead"], help: "Helps classify how the request entered the agency." }),
          q("paymentPlan", "Preferred payment plan", "select", { required: true, options: ["Paid in Full", "Monthly EFT", "Mortgagee Bill / Escrow", "Monthly Direct Bill"], help: "Escrow billing is common for homeowners." })
        ]
      },
      {
        id: "insured", title: "Named Insured", short: "Customer identity", helper: "Use legal name and contact information exactly. Home policies often include additional named insureds or mortgagee details.",
        questions: [
          q("firstName", "Named insured first name", "text", { required: true, placeholder: "Maria", help: "Use legal first name." }),
          q("lastName", "Named insured last name", "text", { required: true, placeholder: "Santos", help: "Use legal last name." }),
          q("dob", "Date of birth", "date", { required: true, help: "DOB may be required by carrier." }),
          q("email", "Customer email address", "email", { required: true, placeholder: "customer@email.com", help: "Used for quote delivery and policy documents." }),
          q("phone", "Best contact number", "tel", { required: true, placeholder: "555-555-1212", help: "Needed for follow-up." }),
          q("additionalInsured", "Is there a co-applicant or additional named insured?", "select", { required: true, options: ["No", "Yes"], help: "Spouse or co-owner may need to be listed." }),
          q("mortgagee", "Is there a mortgagee/lender?", "select", { required: true, options: ["No", "Yes"], help: "Mortgagee clause is usually required for escrow/loan." })
        ]
      },
      {
        id: "location", title: "Property Location", short: "Risk address", helper: "Home rating depends heavily on the exact property address, occupancy, distance to fire services, and location hazards.",
        questions: [
          q("propertyStreet", "Property street address", "text", { required: true, placeholder: "123 Main St", help: "Use the insured property location." }),
          q("propertyCity", "Property city", "text", { required: true, placeholder: "Austin", help: "City must match property address." }),
          q("propertyState", "Property state", "select", { required: true, options: STATES, help: "State determines forms and coverage rules." }),
          q("propertyZip", "Property ZIP code", "text", { required: true, pattern: "zip", placeholder: "78701", help: "ZIP impacts territory rating and catastrophe exposure." }),
          q("occupancy", "Occupancy type", "select", { required: true, options: ["Primary Residence", "Secondary / Seasonal", "Tenant Occupied", "Vacant", "Under Renovation"], help: "Vacant, seasonal, or tenant-occupied homes may need different forms." }),
          q("purchaseClosing", "Is this for a purchase/closing?", "select", { required: true, options: ["No", "Yes"], help: "Closing quotes may require lender/mortgagee details." }),
          q("distanceFireHydrant", "Distance to fire hydrant", "select", { required: true, options: ["Within 1000 ft", "1001 ft to 5 miles", "Over 5 miles", "Unknown"], help: "Protection class and distance can affect eligibility." })
        ]
      },
      {
        id: "property", title: "Property Characteristics", short: "Home details", helper: "Replacement cost and eligibility depend on construction, roof, updates, square footage, and protective devices.",
        questions: [
          q("yearBuilt", "Year built", "number", { required: true, min: 1800, max: TODAY.getFullYear() + 1, placeholder: "2008", help: "Older homes usually require update details." }),
          q("squareFeet", "Finished living area square footage", "number", { required: true, min: 200, max: 25000, placeholder: "1850", help: "Used to estimate Coverage A replacement cost." }),
          q("construction", "Construction type", "select", { required: true, options: ["Frame", "Masonry", "Brick Veneer", "Stucco", "Manufactured / Mobile Home", "Log Home"], help: "Construction affects fire resistance and eligibility." }),
          q("stories", "Number of stories", "select", { required: true, options: ["1", "1.5", "2", "3+"], help: "Used in replacement cost and underwriting." }),
          q("roofType", "Roof material", "select", { required: true, options: ["Architectural Shingle", "3-Tab Shingle", "Tile", "Metal", "Flat / Tar", "Wood Shake", "Other"], help: "Roof type affects wind/hail and eligibility." }),
          q("roofAge", "Roof age in years", "number", { required: true, min: 0, max: 100, placeholder: "8", help: "Older roofs can trigger ACV roof, inspection, or decline." }),
          q("electricalUpdated", "Electrical system updated?", "select", { required: true, options: ["Yes", "No", "Unknown", "Not Needed / Newer Home"], help: "Older electrical systems may be ineligible." }),
          q("plumbingUpdated", "Plumbing system updated?", "select", { required: true, options: ["Yes", "No", "Unknown", "Not Needed / Newer Home"], help: "Old plumbing can increase water loss risk." }),
          q("heatingUpdated", "Heating/HVAC updated?", "select", { required: true, options: ["Yes", "No", "Unknown", "Not Needed / Newer Home"], help: "Updates help carrier accept older homes." }),
          q("protectiveDevices", "Protective devices", "checkbox", { wide: true, options: ["Central fire alarm", "Central burglar alarm", "Local smoke detectors", "Water leak detection", "Sprinkler system", "Smart home sensors", "None"], help: "Protective devices may qualify for discounts." })
        ]
      },
      {
        id: "prior", title: "Prior Insurance & Claims", short: "Loss history", helper: "Prior insurance and claims history are key underwriting items for homeowners carriers.",
        questions: [
          q("currentlyInsured", "Does the customer currently have homeowners insurance?", "select", { required: true, options: ["Yes", "No"], help: "No prior insurance can affect eligibility and pricing." }),
          q("priorCarrier", "Current or prior home carrier", "text", { required: false, placeholder: "Example: Travelers", help: "Enter if known." }),
          q("priorExpiration", "Current/prior policy expiration date", "date", { required: false, help: "Used to align new effective date." }),
          q("lapseDays", "Total lapse days within the last 12 months", "number", { required: true, min: 0, max: 365, placeholder: "0", help: "A lapse can trigger referral." }),
          q("homeClaims", "Property claims in the last 5 years", "number", { required: true, min: 0, max: 20, placeholder: "0", help: "Include wind/hail, water, fire, liability, theft, and weather claims." }),
          q("claimTypes", "Claim type details", "checkbox", { wide: true, options: ["None", "Water", "Wind/Hail", "Fire", "Theft", "Liability", "Weather", "Mold", "Other"], help: "Select all claim types that apply." }),
          q("priorCancellation", "Any cancellation/non-renewal for underwriting or non-payment?", "select", { required: true, options: ["No", "Yes"], help: "May require carrier review." })
        ]
      },
      {
        id: "coverage", title: "Coverage Selection", short: "HO limits", helper: "Coverage A drives many related limits. Deductibles, endorsements, and water backup must be selected carefully.",
        questions: [
          q("coverageA", "Dwelling Coverage A limit", "number", { required: true, min: 50000, max: 5000000, placeholder: "450000", help: "Use replacement cost estimate, not market value." }),
          q("deductible", "All other perils deductible", "select", { required: true, options: ["500", "1000", "1500", "2500", "5000"], help: "Higher deductible usually lowers premium." }),
          q("windHailDeductible", "Wind/hail deductible", "select", { required: true, options: ["Same as AOP", "1%", "2%", "5%", "Excluded / Not Available"], help: "Varies by state and carrier." }),
          q("personalProperty", "Personal property coverage", "select", { required: true, options: ["50% of Coverage A", "60% of Coverage A", "70% of Coverage A", "Scheduled / Custom"], help: "Coverage C limit selection." }),
          q("liability", "Personal liability limit", "select", { required: true, options: ["100,000", "300,000", "500,000", "1,000,000"], help: "Higher liability limits are recommended for many customers." }),
          q("medicalPayments", "Medical payments to others", "select", { required: true, options: ["1,000", "2,000", "5,000", "10,000"], help: "No-fault medical payments coverage." }),
          q("waterBackup", "Water backup / sump overflow", "select", { required: true, options: ["No", "5,000", "10,000", "25,000", "50,000"], help: "Common endorsement that must be offered/documented." }),
          q("replacementCost", "Personal property replacement cost requested?", "select", { required: true, options: ["Yes", "No"], help: "Changes settlement for personal property losses." })
        ]
      },
      {
        id: "discounts", title: "Discounts & Endorsements", short: "Savings and extras", helper: "Select only discounts and endorsements supported by the customer’s risk and carrier availability.",
        questions: [
          q("discounts", "Discounts requested / eligible", "checkbox", { wide: true, options: ["Multi-policy", "Claims-free", "New home", "Roof update", "Protective device", "Paperless", "EFT", "Paid in full", "Gated community", "Smart home"], help: "Verify discount proof where required." }),
          q("endorsements", "Optional endorsements to quote", "checkbox", { wide: true, options: ["Equipment breakdown", "Service line", "Identity theft", "Scheduled jewelry", "Home systems protection", "Ordinance or law increase", "Personal injury", "Matching siding/roof", "None"], help: "Use customer needs and agency standards." }),
          q("documents", "Documents to request before binding", "checkbox", { wide: true, options: ["Replacement cost estimate", "Roof photos", "4-point inspection", "Wind mitigation", "Prior declarations", "Mortgagee clause", "Alarm certificate", "No documents needed yet"], help: "Document requirements depend on age, state, and carrier." }),
          q("quoteNotes", "Producer quote notes", "textarea", { wide: true, required: false, placeholder: "Add lender details, customer preferences, missing information, or trainer note.", help: "Clear notes help with training review." })
        ]
      },
      {
        id: "underwriting", title: "Underwriting Questions", short: "Eligibility flags", helper: "These carrier-style questions identify whether the property can be quoted, referred, or declined.",
        questions: [
          q("vacancy", "Is the home vacant, unoccupied, or under major renovation?", "select", { required: true, options: ["No", "Yes"], help: "Vacancy/renovation may require specialty coverage." }),
          q("business", "Any business, daycare, or customer foot traffic on premises?", "select", { required: true, options: ["No", "Yes"], help: "Business exposure can create liability concerns." }),
          q("shortTermRental", "Is the property rented short-term or listed on Airbnb/VRBO?", "select", { required: true, options: ["No", "Yes"], help: "Short-term rental may be ineligible or require specialty policy." }),
          q("animals", "Any dogs, exotic animals, or bite history?", "select", { required: true, options: ["No", "Yes"], help: "Animal exposure can trigger liability review." }),
          q("poolTrampoline", "Any pool, diving board, slide, or trampoline?", "select", { required: true, options: ["No", "Yes"], help: "May require fence, safety measures, or exclusion." }),
          q("brushFlood", "Any brush/wildfire, flood, coastal, or catastrophe concern?", "select", { required: true, options: ["No", "Yes", "Unknown"], help: "Catastrophe exposure affects carrier availability." }),
          q("unrepairedDamage", "Any unrepaired damage, open claim, or maintenance concern?", "select", { required: true, options: ["No", "Yes"], help: "Open damage often prevents binding." }),
          q("finalReview", "All required risk questions reviewed with customer?", "select", { required: true, options: ["Yes", "No"], help: "Do not proceed if risk questions were not reviewed." })
        ]
      }
    ]
  };

  function boot() {
    bindEvents();
    renderDate();
    renderAppetite();
    const savedSession = safeJson(localStorage.getItem(SESSION_KEY));
    if (savedSession?.user) {
      app.user = savedSession.user;
      showPortal();
    }
    refreshDashboard();
    renderStep();
  }

  function bindEvents() {
    $("loginForm").addEventListener("submit", handleLogin);
    $("logoutBtn").addEventListener("click", logout);
    $("themeBtn").addEventListener("click", () => document.body.classList.toggle("dark"));
    document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => go(button.dataset.route)));
    document.querySelectorAll("[data-start-product]").forEach((button) => button.addEventListener("click", () => startQuote(button.dataset.startProduct)));
    document.querySelectorAll("[data-product]").forEach((button) => button.addEventListener("click", () => switchProduct(button.dataset.product)));
    $("prevStepBtn").addEventListener("click", previousStep);
    $("nextStepBtn").addEventListener("click", nextStep);
    $("runQuoteBtn").addEventListener("click", runQuote);
    $("saveQuoteBtn").addEventListener("click", saveCurrentQuote);
    $("printQuoteBtn").addEventListener("click", () => window.print());
    $("clearQuoteBtn").addEventListener("click", clearQuote);
    $("validateStepBtn").addEventListener("click", () => showValidation(validateCurrentStep(true)));
    $("exportCsvBtn").addEventListener("click", exportCsv);
    $("clearHistoryBtn").addEventListener("click", clearHistory);
  }

  function handleLogin(event) {
    event.preventDefault();
    const name = clean($("userName").value);
    const email = clean($("userEmail").value);
    const role = $("userRole").value;
    if (!name || !email || !email.includes("@")) {
      $("loginError").textContent = "Please enter a valid name and email.";
      return;
    }
    app.user = { name, email, role, signedInAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: app.user }));
    showPortal();
  }

  function showPortal() {
    $("loginScreen").classList.remove("active");
    $("portalScreen").classList.add("active");
    $("miniUserName").textContent = app.user.name;
    $("miniUserRole").textContent = app.user.role;
    go("dashboard");
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    app.user = null;
    $("portalScreen").classList.remove("active");
    $("loginScreen").classList.add("active");
  }

  function renderDate() {
    $("portalDate").textContent = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(TODAY);
  }

  function go(route) {
    app.route = route;
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    $(`${route}View`).classList.add("active");
    document.querySelectorAll(".side-nav button").forEach((button) => button.classList.toggle("active", button.dataset.route === route));
    const titles = { dashboard: "Dashboard", quote: "New Business Quote", appetite: "Carrier Appetite", history: "Quote History", guide: "Training Guide" };
    $("pageTitle").textContent = titles[route] || "Portal";
    if (route === "history") renderHistory();
    if (route === "dashboard") refreshDashboard();
  }

  function startQuote(product) {
    app.product = product;
    app.stepIndex = 0;
    app.lastResults = null;
    app.quoteNumber = uid();
    updateProductButtons();
    renderStep();
    $("resultsPanel").hidden = true;
    go("quote");
  }

  function switchProduct(product) {
    if (app.product === product) return;
    app.product = product;
    app.stepIndex = 0;
    app.lastResults = null;
    app.quoteNumber = uid();
    updateProductButtons();
    renderStep();
    $("resultsPanel").hidden = true;
  }

  function updateProductButtons() {
    $("autoProductBtn").classList.toggle("active", app.product === "auto");
    $("homeProductBtn").classList.toggle("active", app.product === "home");
    $("quoteTitle").textContent = app.product === "auto" ? "Personal Auto New Business Quote" : "Homeowners New Business Quote";
    $("quoteSubtitle").textContent = app.product === "auto"
      ? "Complete account, insured, garaging, prior insurance, vehicle, driver, coverage, discounts, and underwriting sections."
      : "Complete account, insured, property, prior insurance, coverage, discounts, and underwriting sections.";
    $("quoteNumberMini").textContent = app.quoteNumber;
  }

  function renderStep() {
    updateProductButtons();
    const productSteps = questions[app.product];
    const step = productSteps[app.stepIndex];
    $("stepEyebrow").textContent = `Step ${app.stepIndex + 1} of ${productSteps.length}`;
    $("stepTitle").textContent = step.title;
    $("stepHelper").textContent = step.helper;
    $("questionContainer").innerHTML = step.questions.map(renderQuestion).join("");
    $("validationBox").hidden = true;
    bindFieldEvents();
    renderStepList();
    updateProgress();
    $("prevStepBtn").disabled = app.stepIndex === 0;
    const finalStep = app.stepIndex === productSteps.length - 1;
    $("nextStepBtn").hidden = finalStep;
    $("runQuoteBtn").hidden = !finalStep;
  }

  function renderStepList() {
    const wrap = $("stepList");
    wrap.innerHTML = questions[app.product].map((step, index) => {
      const complete = isStepComplete(index);
      return `<button type="button" class="step-item ${index === app.stepIndex ? "active" : ""} ${complete ? "complete" : ""}" data-step-index="${index}">
        <span class="num">${complete ? "✓" : index + 1}</span>
        <span><strong>${escapeHtml(step.title)}</strong><small>${escapeHtml(step.short)}</small></span>
      </button>`;
    }).join("");
    wrap.querySelectorAll("[data-step-index]").forEach((button) => {
      button.addEventListener("click", () => {
        app.stepIndex = Number(button.dataset.stepIndex);
        renderStep();
      });
    });
  }

  function renderQuestion(question) {
    const value = getAnswer(question.id);
    const required = question.required ? `<span class="required-dot">Required</span>` : `<span></span>`;
    let control = "";
    if (question.type === "select") {
      control = `<select id="${question.id}" data-question="${question.id}" ${question.required ? "required" : ""}>
        <option value="">Select...</option>
        ${question.options.map((opt) => `<option value="${escapeHtml(opt)}" ${value === opt ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}
      </select>`;
    } else if (question.type === "textarea") {
      control = `<textarea id="${question.id}" data-question="${question.id}" placeholder="${escapeHtml(question.placeholder)}">${escapeHtml(value)}</textarea>`;
    } else if (question.type === "checkbox") {
      const selected = Array.isArray(value) ? value : [];
      control = `<div class="check-grid">${question.options.map((opt) => `<label class="check-item"><input type="checkbox" data-question="${question.id}" value="${escapeHtml(opt)}" ${selected.includes(opt) ? "checked" : ""}> ${escapeHtml(opt)}</label>`).join("")}</div>`;
    } else {
      control = `<input id="${question.id}" data-question="${question.id}" type="${question.type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(question.placeholder)}" ${question.required ? "required" : ""} ${question.min !== null ? `min="${question.min}"` : ""} ${question.max !== null ? `max="${question.max}"` : ""}/>`;
    }
    return `<article class="question-card ${question.wide ? "wide" : ""}">
      <label class="question-label" for="${question.id}"><span>${escapeHtml(question.label)}</span>${required}</label>
      ${control}
      <p class="help-text">${escapeHtml(question.help)}</p>
    </article>`;
  }

  function bindFieldEvents() {
    document.querySelectorAll("[data-question]").forEach((field) => {
      field.addEventListener("input", handleFieldChange);
      field.addEventListener("change", handleFieldChange);
    });
  }

  function handleFieldChange(event) {
    const id = event.target.dataset.question;
    if (!id) return;
    const qDef = currentStep().questions.find((item) => item.id === id);
    if (qDef?.type === "checkbox") {
      const selected = [...document.querySelectorAll(`[data-question="${id}"]:checked`)].map((el) => el.value);
      setAnswer(id, selected);
    } else {
      setAnswer(id, event.target.value);
    }
    event.target.classList.remove("input-error");
    updateProgress();
    renderStepList();
    $("resultsPanel").hidden = true;
  }

  function currentStep() { return questions[app.product][app.stepIndex]; }
  function getAnswer(id) { return app.answers[app.product][id] ?? ""; }
  function setAnswer(id, value) { app.answers[app.product][id] = value; }

  function nextStep() {
    const result = validateCurrentStep(true);
    if (!result.valid) return showValidation(result);
    if (app.stepIndex < questions[app.product].length - 1) {
      app.stepIndex += 1;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function previousStep() {
    if (app.stepIndex > 0) {
      app.stepIndex -= 1;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function validateCurrentStep(mark = false) {
    const missing = [];
    const invalid = [];
    currentStep().questions.forEach((question) => {
      const value = getAnswer(question.id);
      const empty = Array.isArray(value) ? value.length === 0 : clean(value) === "";
      const field = document.getElementById(question.id);
      if (question.required && empty) {
        missing.push(question.label);
        if (mark && field) field.classList.add("input-error");
        return;
      }
      if (!empty && question.pattern === "zip" && !/^\d{5}(-\d{4})?$/.test(clean(value))) {
        invalid.push(`${question.label} must be a valid ZIP code.`);
        if (mark && field) field.classList.add("input-error");
      }
      if (!empty && question.type === "email" && !/^\S+@\S+\.\S+$/.test(clean(value))) {
        invalid.push(`${question.label} must be a valid email address.`);
        if (mark && field) field.classList.add("input-error");
      }
      if (!empty && question.type === "number") {
        const n = Number(value);
        if (Number.isNaN(n) || (question.min !== null && n < question.min) || (question.max !== null && n > question.max)) {
          invalid.push(`${question.label} is outside the accepted range.`);
          if (mark && field) field.classList.add("input-error");
        }
      }
      if (!empty && question.id === "vin" && clean(value).length !== 17) {
        invalid.push("VIN should be 17 characters for a realistic carrier quote.");
        if (mark && field) field.classList.add("input-error");
      }
    });
    return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
  }

  function validateAll() {
    const original = app.stepIndex;
    const errors = [];
    questions[app.product].forEach((_, index) => {
      app.stepIndex = index;
      const result = validateCurrentStep(false);
      if (!result.valid) errors.push({ step: questions[app.product][index].title, ...result });
    });
    app.stepIndex = original;
    return errors;
  }

  function showValidation(result) {
    const box = $("validationBox");
    box.hidden = false;
    if (result.valid) {
      box.className = "validation-box good";
      box.innerHTML = "This section is complete and ready to continue.";
      return;
    }
    box.className = "validation-box";
    const items = [...result.missing.map((item) => `${item} is required.`), ...result.invalid];
    box.innerHTML = `<strong>Please fix the following:</strong><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function isStepComplete(index) {
    const step = questions[app.product][index];
    return step.questions.every((question) => {
      const value = app.answers[app.product][question.id];
      if (!question.required) return true;
      if (Array.isArray(value)) return value.length > 0;
      return clean(value) !== "";
    });
  }

  function updateProgress() {
    const all = questions[app.product].flatMap((step) => step.questions).filter((question) => question.required);
    const done = all.filter((question) => {
      const value = app.answers[app.product][question.id];
      return Array.isArray(value) ? value.length > 0 : clean(value) !== "";
    }).length;
    const pct = all.length ? (done / all.length) * 100 : 0;
    $("progressBar").style.width = `${pct}%`;
    $("progressText").textContent = percent(pct);
  }

  function clearQuote() {
    if (!confirm("Clear all answers for this quote?")) return;
    app.answers[app.product] = {};
    app.lastResults = null;
    app.quoteNumber = uid();
    app.stepIndex = 0;
    $("resultsPanel").hidden = true;
    renderStep();
  }

  function runQuote() {
    const currentValidation = validateCurrentStep(true);
    if (!currentValidation.valid) return showValidation(currentValidation);
    const allErrors = validateAll();
    if (allErrors.length) {
      const box = $("validationBox");
      box.hidden = false;
      box.className = "validation-box";
      box.innerHTML = `<strong>Carrier review cannot run yet. Complete these sections:</strong><ul>${allErrors.map((err) => `<li>${escapeHtml(err.step)}: ${err.missing.length + err.invalid.length} issue(s)</li>`).join("")}</ul>`;
      return;
    }
    app.lastResults = calculateQuote();
    renderResults(app.lastResults);
    $("resultsPanel").hidden = false;
    $("quoteStatusMini").textContent = "Carrier Review Complete";
    setTimeout(() => $("resultsPanel").scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  function calculateQuote() {
    const a = app.answers[app.product];
    const flags = [];
    const credits = [];
    let factor = 1;

    const state = app.product === "auto" ? a.garageState : a.propertyState;
    factor *= stateFactor[state] || 1;

    if (app.product === "auto") {
      const claims = Number(a.priorClaims || 0);
      const accidents = Number(a.atFaultAccidents || 0);
      const violations = Number(a.violations || 0);
      const lapse = Number(a.lapseDays || 0);
      const mileage = Number(a.annualMileage || 0);
      const yearsLicensed = Number(a.yearsLicensed || 0);
      const year = Number(a.vehicleYear || TODAY.getFullYear());

      factor += claims * 0.08 + accidents * 0.13 + violations * 0.07;
      if (lapse > 0) { factor += Math.min(0.22, lapse / 365); flags.push(`Coverage lapse reported: ${lapse} day(s).`); }
      if (a.currentlyInsured === "No") { factor += 0.16; flags.push("No active prior auto insurance."); }
      if (["State Minimum", "25/50", "None"].includes(a.priorBILimits)) { factor += 0.06; flags.push("Prior liability limits are low or unavailable."); }
      if (mileage > 18000) { factor += 0.1; flags.push("Annual mileage is above standard range."); }
      if (yearsLicensed < 3) { factor += 0.12; flags.push("Primary driver has less than 3 years licensed experience."); }
      if (a.vehicleUse === "Business") { factor += 0.12; flags.push("Business vehicle use needs underwriting review."); }
      if (a.vehicleUse === "Delivery / Rideshare" || a.businessUse === "Yes") { factor += 0.32; flags.push("Delivery, livery, courier, or rideshare exposure reported."); }
      if (["Suspended", "Revoked"].includes(a.licenseStatus)) { factor += 0.45; flags.push("Primary driver license is not valid."); }
      if (a.dui === "Yes" || a.sr22 === "Yes") { factor += 0.38; flags.push("Major violation or SR-22/FR-44 filing reported."); }
      if (a.salvage === "Yes" || a.vehicleDamage === "Yes") { factor += 0.18; flags.push("Vehicle condition/title concern reported."); }
      if (a.unlistedOperators === "Yes") { factor += 0.15; flags.push("Unlisted household or regular operator exposure reported."); }
      if (a.fraudConcern === "Yes") { factor += 0.5; flags.push("Material misrepresentation/fraud concern reported."); }
      if (a.finalReview === "No") flags.push("Risk questions were not fully reviewed with customer.");
      if (year < TODAY.getFullYear() - 12 && a.compDeductible !== "None") flags.push("Older vehicle with physical damage selected; confirm value and photos if needed.");
      if (a.ownership !== "Owned" && (a.compDeductible === "None" || a.collisionDeductible === "None")) flags.push("Financed/leased vehicle may require comprehensive and collision.");
      applyCredits(a, credits, (amount) => factor -= amount);
    } else {
      const claims = Number(a.homeClaims || 0);
      const lapse = Number(a.lapseDays || 0);
      const roofAge = Number(a.roofAge || 0);
      const yearBuilt = Number(a.yearBuilt || TODAY.getFullYear());
      const coverageA = Number(a.coverageA || 250000);

      factor += claims * 0.11;
      if (lapse > 0) { factor += Math.min(0.2, lapse / 365); flags.push(`Home insurance lapse reported: ${lapse} day(s).`); }
      if (a.currentlyInsured === "No") { factor += 0.11; flags.push("No active prior homeowners insurance."); }
      if (roofAge > 15) { factor += 0.18; flags.push("Roof age is above preferred range."); }
      if (roofAge > 25) { factor += 0.18; flags.push("Roof may require inspection, ACV settlement, or decline review."); }
      if (yearBuilt < 1970 && ["No", "Unknown"].includes(a.electricalUpdated)) { factor += 0.18; flags.push("Older home without confirmed electrical update."); }
      if (yearBuilt < 1970 && ["No", "Unknown"].includes(a.plumbingUpdated)) { factor += 0.16; flags.push("Older home without confirmed plumbing update."); }
      if (a.occupancy !== "Primary Residence") { factor += 0.2; flags.push(`Occupancy is ${a.occupancy}.`); }
      if (a.construction === "Manufactured / Mobile Home" || a.construction === "Log Home") { factor += 0.18; flags.push("Special construction type may require specialty carrier."); }
      if (a.vacancy === "Yes" || a.unrepairedDamage === "Yes") { factor += 0.4; flags.push("Vacancy, renovation, unrepaired damage, or open claim concern reported."); }
      if (a.shortTermRental === "Yes") { factor += 0.28; flags.push("Short-term rental exposure reported."); }
      if (a.business === "Yes") { factor += 0.14; flags.push("Business or daycare exposure reported."); }
      if (a.animals === "Yes") { factor += 0.12; flags.push("Animal exposure or bite history question answered Yes."); }
      if (a.poolTrampoline === "Yes") { factor += 0.1; flags.push("Pool, diving board, slide, or trampoline exposure reported."); }
      if (["Yes", "Unknown"].includes(a.brushFlood)) { factor += 0.16; flags.push("Brush, wildfire, flood, coastal, or catastrophe concern reported."); }
      if (coverageA > 900000) { factor += 0.08; flags.push("High dwelling limit may need replacement cost review."); }
      if (a.finalReview === "No") flags.push("Risk questions were not fully reviewed with customer.");
      applyCredits(a, credits, (amount) => factor -= amount);
    }

    factor = Math.max(0.72, factor);
    const declined = shouldDecline(flags, a);
    const referral = !declined && shouldRefer(flags, factor);
    const results = carriers.map((carrier, index) => {
      const base = app.product === "auto" ? carrier.autoBase : carrier.homeBase;
      let carrierFactor = factor + (index * 0.035);
      if (carrier.tier === "Preferred" && flags.length > 2) carrierFactor += 0.18;
      if (carrier.tier === "Referral / Specialty" && flags.length > 2) carrierFactor -= 0.08;
      const annual = Math.round(base * carrierFactor);
      let status = "Eligible";
      if (declined && carrier.tier !== "Referral / Specialty") status = "Declined";
      else if (declined && carrier.tier === "Referral / Specialty") status = "Manual Review";
      else if (referral || flags.length > 2) status = carrier.tier === "Preferred" ? "Referral" : "Eligible with Review";
      else if (index === 0 || index === 2) status = "Preferred Quote";
      return {
        ...carrier,
        annual,
        monthly: Math.round(annual / 12),
        down: Math.round(annual * (a.paymentPlan === "Paid in Full" ? 1 : 0.18)),
        status,
        flags: createCarrierFlags(carrier, flags, credits)
      };
    }).sort((x, y) => {
      const xDecline = x.status === "Declined" ? 1 : 0;
      const yDecline = y.status === "Declined" ? 1 : 0;
      return xDecline - yDecline || x.annual - y.annual;
    });

    return {
      id: app.quoteNumber,
      product: app.product,
      date: new Date().toISOString(),
      insured: [a.firstName, a.lastName].filter(Boolean).join(" ") || "Unnamed Insured",
      state: state || "—",
      factor,
      flags,
      credits,
      status: declined ? "Declined / Specialty Review" : referral ? "Referral Review" : "Quote Ready",
      results,
      answers: JSON.parse(JSON.stringify(a))
    };
  }

  function applyCredits(a, credits, apply) {
    const selected = Array.isArray(a.discounts) ? a.discounts : [];
    const creditMap = {
      "Multi-policy": 0.08, "Homeowner": 0.03, "Good driver": 0.06, "Good student": 0.03,
      "Defensive driver": 0.02, "Telematics": 0.04, "Paperless": 0.015, "EFT": 0.015,
      "Paid in full": 0.03, "Anti-theft": 0.02, "Claims-free": 0.07, "New home": 0.04,
      "Roof update": 0.04, "Protective device": 0.03, "Gated community": 0.02, "Smart home": 0.02
    };
    selected.forEach((discount) => {
      const credit = creditMap[discount] || 0;
      if (credit) {
        apply(credit);
        credits.push(`${discount} discount applied.`);
      }
    });
  }

  function shouldDecline(flags, a) {
    const hardNo = [
      a.fraudConcern === "Yes",
      a.licenseStatus === "Revoked",
      a.vehicleUse === "Delivery / Rideshare" && a.sr22 === "Yes",
      a.vacancy === "Yes" && a.unrepairedDamage === "Yes",
      a.occupancy === "Vacant" && a.unrepairedDamage === "Yes"
    ];
    return hardNo.some(Boolean) || flags.length >= 7;
  }

  function shouldRefer(flags, factor) {
    return flags.length >= 3 || factor >= 1.45;
  }

  function createCarrierFlags(carrier, flags, credits) {
    const result = [];
    if (flags.length === 0) result.push("No major underwriting flags detected.");
    result.push(...flags.slice(0, 3));
    if (credits.length) result.push(credits[0]);
    if (carrier.tier === "Referral / Specialty" && flags.length) result.push("Specialty review may accept with documentation.");
    return result.slice(0, 5);
  }

  function renderResults(data) {
    const best = data.results.find((r) => !["Declined"].includes(r.status)) || data.results[0];
    $("quoteSummary").innerHTML = [
      ["Quote #", data.id],
      ["Insured", data.insured],
      ["Product", data.product === "auto" ? "Personal Auto" : "Homeowners"],
      ["Decision", data.status],
      ["Best annual", money(best.annual)],
      ["Best monthly", money(best.monthly)],
      ["State", data.state],
      ["UW flags", data.flags.length]
    ].map(([label, value]) => `<div class="summary-tile"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

    $("resultCards").innerHTML = data.results.map((carrier, index) => {
      const statusClass = carrier.status.includes("Declined") ? "bad" : carrier.status.includes("Review") || carrier.status.includes("Referral") ? "warn" : "good";
      return `<article class="carrier-card ${index === 0 ? "best" : ""}">
        <div class="carrier-name"><h4>${escapeHtml(carrier.name)}</h4><span class="status-pill ${statusClass}">${escapeHtml(carrier.status)}</span></div>
        <div class="premium">${money(carrier.annual)}</div>
        <div class="premium-sub">${money(carrier.monthly)} / month • ${money(carrier.down)} estimated down</div>
        <ul class="flag-list">${carrier.flags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>
      </article>`;
    }).join("");

    const flagNotes = data.flags.length
      ? data.flags.map((flag) => `<div class="note-card warn"><strong>Underwriting flag</strong>${escapeHtml(flag)}</div>`).join("")
      : `<div class="note-card"><strong>No major flags</strong>Risk appears acceptable based on completed training questions.</div>`;
    const creditNotes = data.credits.length
      ? `<div class="note-card"><strong>Credits found</strong>${escapeHtml(data.credits.join(" "))}</div>`
      : `<div class="note-card"><strong>No credits selected</strong>Review if customer qualifies for bundle, paperless, EFT, protective device, or other discounts.</div>`;
    $("underwritingNotes").innerHTML = flagNotes + creditNotes;
  }

  function saveCurrentQuote() {
    if (!app.lastResults) return alert("Run carrier review before saving the quote.");
    const history = getHistory();
    const existingIndex = history.findIndex((item) => item.id === app.lastResults.id);
    if (existingIndex >= 0) history[existingIndex] = app.lastResults;
    else history.unshift(app.lastResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    alert("Quote saved to history.");
    refreshDashboard();
    renderHistory();
  }

  function getHistory() { return safeJson(localStorage.getItem(STORAGE_KEY)) || []; }
  function safeJson(value) { try { return JSON.parse(value); } catch { return null; } }

  function refreshDashboard() {
    const history = getHistory();
    $("statTotal").textContent = history.length;
    $("statAuto").textContent = history.filter((q) => q.product === "auto").length;
    $("statHome").textContent = history.filter((q) => q.product === "home").length;
    const last = history[0];
    $("statPremium").textContent = last ? money(last.results?.[0]?.annual || 0) : "—";
    $("recentQuoteBox").innerHTML = last ? `<div class="summary-tile"><span>${escapeHtml(last.product === "auto" ? "Personal Auto" : "Homeowners")}</span><strong>${escapeHtml(last.insured)}</strong></div><p class="muted">${escapeHtml(last.id)} • ${money(last.results?.[0]?.annual || 0)} • ${escapeHtml(last.status)}</p>` : "No saved quote yet.";
  }

  function renderHistory() {
    const history = getHistory();
    if (!history.length) {
      $("historyTableWrap").innerHTML = `<div class="empty-box">No saved quotes yet. Run carrier review and click Save Quote.</div>`;
      return;
    }
    $("historyTableWrap").innerHTML = `<table class="history-table">
      <thead><tr><th>Quote</th><th>Date</th><th>Product</th><th>Insured</th><th>Decision</th><th>Best Premium</th><th>Action</th></tr></thead>
      <tbody>${history.map((item, index) => `<tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.product === "auto" ? "Personal Auto" : "Homeowners"}</td>
        <td>${escapeHtml(item.insured)}</td>
        <td>${escapeHtml(item.status)}</td>
        <td>${money(item.results?.[0]?.annual || 0)}</td>
        <td><button class="link-btn" type="button" data-load-history="${index}">Open</button></td>
      </tr>`).join("")}</tbody>
    </table>`;
    document.querySelectorAll("[data-load-history]").forEach((button) => {
      button.addEventListener("click", () => openHistory(Number(button.dataset.loadHistory)));
    });
  }

  function openHistory(index) {
    const item = getHistory()[index];
    if (!item) return;
    app.product = item.product;
    app.quoteNumber = item.id;
    app.answers[item.product] = JSON.parse(JSON.stringify(item.answers || {}));
    app.lastResults = item;
    app.stepIndex = questions[app.product].length - 1;
    renderStep();
    renderResults(item);
    $("resultsPanel").hidden = false;
    go("quote");
  }

  function exportCsv() {
    const history = getHistory();
    if (!history.length) return alert("No quote history to export.");
    const rows = [["Quote", "Date", "Product", "Insured", "State", "Decision", "Best Carrier", "Best Annual", "Best Monthly", "Flags"]];
    history.forEach((item) => rows.push([
      item.id,
      item.date,
      item.product,
      item.insured,
      item.state,
      item.status,
      item.results?.[0]?.name || "",
      item.results?.[0]?.annual || "",
      item.results?.[0]?.monthly || "",
      (item.flags || []).join(" | ")
    ]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lava-pl-rater-quote-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearHistory() {
    if (!confirm("Clear all saved quote history?")) return;
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    refreshDashboard();
  }

  function renderAppetite() {
    $("appetiteGrid").innerHTML = carriers.map((carrier) => `<article class="appetite-card">
      <div class="section-head"><h4>${escapeHtml(carrier.name)}</h4><span class="status-pill neutral">${escapeHtml(carrier.tier)}</span></div>
      <p class="muted">${escapeHtml(carrier.appetite)}</p>
      <strong>Good fit:</strong><ul>${carrier.likes.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <strong>Review carefully:</strong><ul>${carrier.caution.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <strong>Likely decline:</strong><ul>${carrier.decline.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </article>`).join("");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  }

  boot();
})();
