(() => {
  "use strict";

  const STORAGE = {
    user: "lava_carrier_portal_user",
    theme: "lava_carrier_portal_theme",
    quotes: "lava_carrier_portal_quotes"
  };

  const CARRIERS = [
    {
      id: "travelers",
      name: "Travelers",
      code: "TRV",
      color: "#e11d48",
      autoBase: 1340,
      homeBase: 1475,
      appetite: {
        auto: "Preferred for clean driving history, prior insurance, and mid-to-high liability limits.",
        home: "Strong for newer homes, good roof condition, and protective devices."
      },
      strengths: ["Clean driver", "Home/auto bundle", "High liability limits"],
      cautions: ["Young drivers", "Multiple claims", "Older roof"]
    },
    {
      id: "safeco",
      name: "Safeco",
      code: "SAF",
      color: "#2563eb",
      autoBase: 1265,
      homeBase: 1365,
      appetite: {
        auto: "Competitive for standard auto risks with good prior insurance and multi-policy discount.",
        home: "Good fit for standard homes with normal occupancy and reasonable claim history."
      },
      strengths: ["Standard risks", "Bundle discount", "Paperless profile"],
      cautions: ["Lapse in coverage", "Business use", "Frequent water losses"]
    },
    {
      id: "progressive",
      name: "Progressive",
      code: "PRG",
      color: "#0891b2",
      autoBase: 1195,
      homeBase: 1295,
      appetite: {
        auto: "Often competitive for broad auto profiles and telematics participation.",
        home: "Often used for package opportunities where auto is the lead line."
      },
      strengths: ["Telematics", "Broad auto profile", "Digital documents"],
      cautions: ["Severe violations", "No valid license", "Vacant property"]
    },
    {
      id: "mercury",
      name: "Mercury",
      code: "MRC",
      color: "#b91c1c",
      autoBase: 1240,
      homeBase: 1325,
      appetite: {
        auto: "Competitive for preferred and standard drivers in active Mercury states.",
        home: "Good for maintained homes with standard roofs and low hazard exposure."
      },
      strengths: ["Mature drivers", "Low mileage", "Protective devices"],
      cautions: ["High annual mileage", "Old roof", "Pool without fence"]
    },
    {
      id: "bamboo",
      name: "Bamboo",
      code: "BAM",
      color: "#059669",
      autoBase: 1315,
      homeBase: 1180,
      appetite: {
        auto: "Training placeholder only for auto comparison.",
        home: "Strong for many homeowners risks when property data is complete and roof is acceptable."
      },
      strengths: ["Home-focused", "Newer roof", "Replacement cost"],
      cautions: ["Brush/fire exposure", "Older plumbing", "Multiple claims"]
    },
    {
      id: "erie",
      name: "Erie",
      code: "ERI",
      color: "#1d4ed8",
      autoBase: 1275,
      homeBase: 1415,
      appetite: {
        auto: "Preferred for stable households, clean records, and well-rounded coverage.",
        home: "Preferred when the home has strong maintenance history and no claim frequency."
      },
      strengths: ["Stable household", "Clean record", "Claims-free"],
      cautions: ["State availability", "Youthful operator", "Roof age"]
    },
    {
      id: "national-general",
      name: "National General",
      code: "NG",
      color: "#475569",
      autoBase: 1375,
      homeBase: 1260,
      appetite: {
        auto: "Useful training option for non-standard profiles and referral reviews.",
        home: "Useful comparison option for risks needing additional review."
      },
      strengths: ["Referral option", "Flexible profile", "Higher-risk comparison"],
      cautions: ["Premium may be higher", "Underwriting review", "Documentation required"]
    }
  ];

  const STATE_FACTORS = {
    CA: 1.18, FL: 1.28, TX: 1.09, NY: 1.22, NJ: 1.18, LA: 1.23, MI: 1.2,
    WA: 1.03, OR: 1.02, VA: 0.98, NC: 0.96, OH: 0.94, PA: 1.01, AZ: 1.07,
    CO: 1.08, GA: 1.11, IL: 1.02, MD: 1.08, MA: 1.05, NV: 1.15
  };

  const app = {
    route: "dashboard",
    product: "auto",
    stepIndex: 0,
    answers: { auto: {}, home: {} },
    lastResults: null,
    viewingQuote: null
  };

  const steps = {
    auto: [
      {
        id: "applicant",
        title: "Applicant",
        short: "Named insured and quote setup",
        helper: "Carrier portals start with identity, date of birth, effective date, and contact information because these drive rating, eligibility, and document delivery.",
        questions: [
          q("effectiveDate", "Requested policy effective date", "date", { required: true, help: "Use the date the customer wants coverage to start. Avoid backdating unless approved." }),
          q("fullName", "Named insured full legal name", "text", { required: true, placeholder: "Example: Maria Santos", help: "Use the exact legal name that should appear on the policy." }),
          q("dateOfBirth", "Named insured date of birth", "date", { required: true, help: "DOB affects age factor and underwriting eligibility." }),
          q("maritalStatus", "Marital status", "select", { required: true, options: ["Single", "Married", "Domestic Partner", "Widowed", "Divorced"], help: "Some carriers include household stability in rating." }),
          q("email", "Customer email address", "email", { required: true, placeholder: "customer@email.com", help: "Used for quote delivery and electronic documents." }),
          q("phone", "Best contact number", "tel", { required: true, placeholder: "555-555-1212", help: "Needed for follow-up or underwriting clarification." })
        ]
      },
      {
        id: "address",
        title: "Garaging Address",
        short: "Where the vehicle is kept",
        helper: "The garaging ZIP is one of the most important rating fields. It must match where the vehicle is primarily parked overnight.",
        questions: [
          q("street", "Garaging street address", "text", { required: true, placeholder: "123 Main St", help: "Do not use mailing address if the vehicle is kept somewhere else." }),
          q("city", "Garaging city", "text", { required: true, placeholder: "Los Angeles", help: "Used with ZIP to rate territory." }),
          q("state", "Garaging state", "select", { required: true, options: states(), help: "State determines available carriers, forms, and rating rules." }),
          q("zip", "Garaging ZIP code", "text", { required: true, placeholder: "90210", pattern: "zip", help: "Use the ZIP where the vehicle is parked most nights." }),
          q("mailingDifferent", "Is the mailing address different from garaging?", "select", { required: true, options: ["No", "Yes"], help: "Carrier must know where to send policy documents." }),
          q("residenceType", "Customer residence type", "select", { required: true, options: ["Own home", "Rent", "Condo", "Live with family", "Other"], help: "Used for account rounding and potential bundle opportunities." })
        ]
      },
      {
        id: "prior",
        title: "Prior Insurance",
        short: "Current carrier and lapse details",
        helper: "Prior insurance helps determine eligibility, rating tier, and whether proof of prior coverage is needed.",
        questions: [
          q("currentlyInsured", "Does the customer currently have auto insurance?", "select", { required: true, options: ["Yes", "No"], help: "No current insurance may create a surcharge or referral." }),
          q("priorCarrier", "Current or prior carrier name", "text", { required: false, placeholder: "Example: State Farm", help: "Enter carrier name if known. Leave blank only if truly unknown." }),
          q("priorBILimits", "Current bodily injury liability limits", "select", { required: true, options: ["None", "State Minimum", "25/50", "50/100", "100/300", "250/500", "500 CSL"], help: "Higher prior limits may qualify for better rating tiers." }),
          q("lapseDays", "Coverage lapse in the last 12 months", "number", { required: true, min: 0, placeholder: "0", help: "Enter total days without coverage. Use 0 if no lapse." }),
          q("continuousMonths", "Months of continuous auto insurance", "number", { required: true, min: 0, placeholder: "36", help: "Continuous coverage improves the risk profile." }),
          q("priorClaims", "Prior auto claims in last 5 years", "number", { required: true, min: 0, placeholder: "0", help: "Include comprehensive, collision, and liability claims." })
        ]
      },
      {
        id: "vehicle",
        title: "Vehicle",
        short: "VIN, usage, and ownership",
        helper: "Vehicle details affect symbol rating, physical damage premium, discounts, and eligibility for certain coverages.",
        questions: [
          q("vin", "Vehicle identification number (VIN)", "text", { required: true, placeholder: "17 characters", help: "VIN should be 17 characters. The simulator uses sample VIN recognition for training." }),
          q("year", "Vehicle year", "number", { required: true, min: 1981, placeholder: "2021", help: "Year affects vehicle age and physical damage rating." }),
          q("make", "Vehicle make", "text", { required: true, placeholder: "Honda", help: "Use the exact make from the registration or VIN decoder." }),
          q("model", "Vehicle model", "text", { required: true, placeholder: "Accord", help: "Use the exact model and trim if available." }),
          q("ownership", "Vehicle ownership", "select", { required: true, options: ["Owned", "Financed", "Leased"], help: "Leased/financed vehicles often require comp and collision." }),
          q("vehicleUse", "Primary vehicle use", "select", { required: true, options: ["Pleasure", "Commute", "Business", "Delivery/Rideshare"], help: "Business or delivery use can trigger underwriting review." }),
          q("annualMileage", "Estimated annual mileage", "number", { required: true, min: 0, placeholder: "12000", help: "Higher mileage usually increases exposure." }),
          q("antiTheft", "Does the vehicle have anti-theft or tracking device?", "select", { required: true, options: ["No", "Yes"], help: "May qualify for a protective device discount." })
        ]
      },
      {
        id: "drivers",
        title: "Drivers",
        short: "License and driving history",
        helper: "Every licensed household member and regular operator should be reviewed to avoid missed exposure.",
        questions: [
          q("driversCount", "Total household drivers to list", "number", { required: true, min: 1, placeholder: "1", help: "Include spouse, household members, and regular operators." }),
          q("licenseStatus", "Primary driver license status", "select", { required: true, options: ["Valid", "Permit", "Suspended", "Revoked", "Foreign License"], help: "Suspended/revoked licenses usually cannot be bound without review." }),
          q("yearsLicensed", "Years licensed in the U.S.", "number", { required: true, min: 0, placeholder: "8", help: "Newly licensed drivers carry higher rating factors." }),
          q("atFaultAccidents", "At-fault accidents in last 5 years", "number", { required: true, min: 0, placeholder: "0", help: "Include chargeable accidents." }),
          q("violations", "Moving violations/tickets in last 5 years", "number", { required: true, min: 0, placeholder: "0", help: "Speeding, reckless driving, and similar violations affect eligibility." }),
          q("dui", "Any DUI/DWI/reckless driving in last 5 years?", "select", { required: true, options: ["No", "Yes"], help: "Severe violations require underwriting review and may decline." })
        ]
      },
      {
        id: "coverage",
        title: "Coverage",
        short: "Limits, deductibles, and discounts",
        helper: "Coverage choices determine premium and whether the quote matches the customer’s requested protection.",
        questions: [
          q("liabilityLimit", "Bodily injury liability limit", "select", { required: true, options: ["25/50", "50/100", "100/300", "250/500", "500 CSL"], help: "Higher limits increase premium but improve protection." }),
          q("propertyDamage", "Property damage liability limit", "select", { required: true, options: ["25,000", "50,000", "100,000", "250,000"], help: "Limit applies to property damage caused to others." }),
          q("compDeductible", "Comprehensive deductible", "select", { required: true, options: ["None", "250", "500", "1000", "2000"], help: "Higher deductible usually lowers premium." }),
          q("collisionDeductible", "Collision deductible", "select", { required: true, options: ["None", "250", "500", "1000", "2000"], help: "Required when vehicle is leased/financed in many cases." }),
          q("uninsuredMotorist", "Uninsured/underinsured motorist coverage", "select", { required: true, options: ["Reject", "Match BI", "Lower than BI"], help: "Confirm customer selection and state rules." }),
          q("rental", "Rental reimbursement", "select", { required: true, options: ["No", "30/900", "40/1200", "50/1500"], help: "Adds rental coverage after a covered claim." }),
          q("roadside", "Roadside assistance", "select", { required: true, options: ["No", "Yes"], help: "Optional towing/roadside benefit." }),
          q("discounts", "Applicable discounts", "checkbox-group", { options: ["Multi-policy", "Good driver", "Good student", "Telematics", "Paperless", "Paid in full"], help: "Select only discounts supported by the customer’s facts." })
        ]
      },
      {
        id: "underwriting",
        title: "Underwriting",
        short: "Eligibility and referral questions",
        helper: "These questions prevent inaccurate quotes and identify risks that need carrier referral before binding.",
        questions: [
          q("commercialExposure", "Will the vehicle be used for delivery, rideshare, or commercial operations?", "select", { required: true, options: ["No", "Yes"], help: "Personal auto may not cover delivery or commercial use." }),
          q("customEquipment", "Any custom equipment or modifications over $1,000?", "select", { required: true, options: ["No", "Yes"], help: "Modifications may require stated amount or referral." }),
          q("salvageTitle", "Does the vehicle have salvage/rebuilt title?", "select", { required: true, options: ["No", "Yes"], help: "Some carriers restrict physical damage on salvage vehicles." }),
          q("excludedDriver", "Any household member to exclude from coverage?", "select", { required: true, options: ["No", "Yes"], help: "Driver exclusions must follow state and carrier rules." }),
          q("notes", "Producer/VA notes for carrier review", "textarea", { required: false, placeholder: "Add details that explain any referral item.", help: "Document anything unusual for the trainer or producer." })
        ]
      }
    ],
    home: [
      {
        id: "applicant",
        title: "Applicant",
        short: "Named insured and policy setup",
        helper: "The named insured, effective date, and occupancy must be correct because they determine insurable interest and policy form.",
        questions: [
          q("effectiveDate", "Requested policy effective date", "date", { required: true, help: "Use the date the customer wants property coverage to start." }),
          q("fullName", "Named insured full legal name", "text", { required: true, placeholder: "Example: Ana Lopez", help: "Use the exact name for the policy documents." }),
          q("dateOfBirth", "Named insured date of birth", "date", { required: true, help: "Some carriers use age or insurance score tiers in rating." }),
          q("email", "Customer email address", "email", { required: true, placeholder: "customer@email.com", help: "Used for quote delivery and electronic documents." }),
          q("phone", "Best contact number", "tel", { required: true, placeholder: "555-555-1212", help: "Needed for follow-up and underwriting documentation." }),
          q("policyForm", "Requested policy form", "select", { required: true, options: ["HO3 Homeowners", "HO4 Renters", "HO6 Condo", "DP3 Dwelling Fire"], help: "Policy form must match ownership and occupancy." })
        ]
      },
      {
        id: "location",
        title: "Property Location",
        short: "Risk address and occupancy",
        helper: "Property location affects territory, weather exposure, carrier availability, and replacement cost assumptions.",
        questions: [
          q("street", "Property street address", "text", { required: true, placeholder: "456 Oak Dr", help: "Use the physical risk address, not a mailing address." }),
          q("city", "Property city", "text", { required: true, placeholder: "Fairfax", help: "City supports territory and fire protection rating." }),
          q("state", "Property state", "select", { required: true, options: states(), help: "State determines available carriers and forms." }),
          q("zip", "Property ZIP code", "text", { required: true, placeholder: "22030", pattern: "zip", help: "ZIP affects weather, catastrophe, and territory factors." }),
          q("occupancy", "Occupancy", "select", { required: true, options: ["Primary", "Secondary", "Seasonal", "Tenant occupied", "Vacant"], help: "Vacant or tenant-occupied properties may need different forms." }),
          q("purchaseClosing", "Is this for a purchase/closing?", "select", { required: true, options: ["No", "Yes"], help: "Closing quotes may require mortgagee and replacement cost accuracy." })
        ]
      },
      {
        id: "property",
        title: "Property Details",
        short: "Construction, roof, and protection",
        helper: "Construction and roof data heavily influence eligibility and premium, especially in catastrophe-prone states.",
        questions: [
          q("yearBuilt", "Year built", "number", { required: true, min: 1800, placeholder: "2018", help: "Older homes may need updates documented." }),
          q("squareFeet", "Finished living area square feet", "number", { required: true, min: 1, placeholder: "2100", help: "Helps estimate replacement cost." }),
          q("construction", "Construction type", "select", { required: true, options: ["Frame", "Masonry", "Brick veneer", "Stucco", "Superior/Fire resistive"], help: "Construction affects fire and catastrophe rating." }),
          q("roofType", "Roof type", "select", { required: true, options: ["Architectural shingle", "Asphalt shingle", "Tile", "Metal", "Flat", "Wood shake"], help: "Roof material affects weather eligibility." }),
          q("roofAge", "Roof age in years", "number", { required: true, min: 0, placeholder: "5", help: "Older roofs may trigger ACV roof settlement or decline." }),
          q("updates", "Major system updates completed", "checkbox-group", { options: ["Roof", "Plumbing", "Electrical", "HVAC", "Water heater"], help: "Updates improve eligibility for older homes." })
        ]
      },
      {
        id: "coverage",
        title: "Coverage",
        short: "Dwelling, liability, endorsements",
        helper: "Coverage must match replacement cost and customer needs. Incorrect limits can create underinsurance.",
        questions: [
          q("dwelling", "Coverage A dwelling limit", "number", { required: true, min: 10000, placeholder: "350000", help: "Use replacement cost estimate, not market value." }),
          q("otherStructures", "Coverage B other structures percentage", "select", { required: true, options: ["0", "2", "5", "10", "20"], help: "Detached garage, shed, fence, etc." }),
          q("personalProperty", "Coverage C personal property percentage", "select", { required: true, options: ["25", "40", "50", "70", "75"], help: "Personal property limit as a percentage of dwelling." }),
          q("lossOfUse", "Coverage D loss of use percentage", "select", { required: true, options: ["10", "20", "30", "40"], help: "Temporary living expense after covered loss." }),
          q("liability", "Personal liability limit", "select", { required: true, options: ["100000", "300000", "500000", "1000000"], help: "Higher limits are recommended for asset protection." }),
          q("deductible", "All other perils deductible", "select", { required: true, options: ["500", "1000", "2500", "5000"], help: "Higher deductible lowers premium." }),
          q("windHailDeductible", "Wind/hail deductible", "select", { required: true, options: ["Same as AOP", "1%", "2%", "5%"], help: "Common in storm-prone areas." }),
          q("endorsements", "Optional endorsements", "checkbox-group", { options: ["Replacement cost contents", "Water backup", "Service line", "Equipment breakdown", "Scheduled jewelry", "Identity theft"], help: "Add only when customer requests or qualifies." })
        ]
      },
      {
        id: "prior",
        title: "Prior Insurance and Claims",
        short: "Current carrier and loss history",
        helper: "Loss history and prior coverage help the carrier evaluate frequency and underwriting concerns.",
        questions: [
          q("currentlyInsured", "Is the property currently insured?", "select", { required: true, options: ["Yes", "No"], help: "No prior insurance may require explanation." }),
          q("priorCarrier", "Current or prior property carrier", "text", { required: false, placeholder: "Example: Travelers", help: "Enter carrier name if known." }),
          q("claims", "Property claims in last 5 years", "number", { required: true, min: 0, placeholder: "0", help: "Include wind, water, fire, theft, liability, and weather claims." }),
          q("waterClaims", "Water losses in last 5 years", "number", { required: true, min: 0, placeholder: "0", help: "Water frequency is a major underwriting concern." }),
          q("mortgage", "Mortgagee/lender required?", "select", { required: true, options: ["No", "Yes"], help: "Required for escrow and closing documentation." }),
          q("inspectionAvailable", "Can the customer provide photos or inspection access?", "select", { required: true, options: ["Yes", "No"], help: "Some carriers require exterior or interior inspection." })
        ]
      },
      {
        id: "hazards",
        title: "Risk Hazards",
        short: "Pool, animals, vacancy, and exposure",
        helper: "Hazard questions are precise because one missed answer can change eligibility, exclusions, or required documentation.",
        questions: [
          q("pool", "Swimming pool on premises?", "select", { required: true, options: ["No", "Yes - fenced", "Yes - not fenced"], help: "Unfenced pools often trigger decline or referral." }),
          q("trampoline", "Trampoline on premises?", "select", { required: true, options: ["No", "Yes - with net/fence", "Yes - no net/fence"], help: "Some carriers prohibit trampolines." }),
          q("animals", "Dogs or exotic animals on premises?", "select", { required: true, options: ["No", "Yes - dog only", "Yes - restricted breed/exotic"], help: "Animal liability may require breed details or exclusion." }),
          q("business", "Any business conducted from the home?", "select", { required: true, options: ["No", "Office only", "Customer visits", "Inventory/equipment stored"], help: "Business exposure may require endorsement or commercial policy." }),
          q("brush", "Brush/wildfire exposure near the home?", "select", { required: true, options: ["No", "Low", "Moderate", "High"], help: "Brush exposure can affect eligibility and premium." }),
          q("vacantDays", "Expected vacancy/unoccupied days", "number", { required: true, min: 0, placeholder: "0", help: "Extended vacancy may need a different policy form." }),
          q("notes", "Producer/VA notes for carrier review", "textarea", { required: false, placeholder: "Add details for any hazard or referral item.", help: "Document any unusual risk condition." })
        ]
      }
    ]
  };

  const scenarios = {
    auto: {
      easy: {
        effectiveDate: todayPlus(7), fullName: "Maria Santos", dateOfBirth: "1992-06-15", maritalStatus: "Married", email: "maria@example.com", phone: "555-222-1010",
        street: "123 Valley View Rd", city: "Los Angeles", state: "CA", zip: "90210", mailingDifferent: "No", residenceType: "Own home",
        currentlyInsured: "Yes", priorCarrier: "State Farm", priorBILimits: "100/300", lapseDays: "0", continuousMonths: "72", priorClaims: "0",
        vin: "1HGCM82633A004352", year: "2021", make: "Honda", model: "Accord", ownership: "Financed", vehicleUse: "Commute", annualMileage: "9500", antiTheft: "Yes",
        driversCount: "1", licenseStatus: "Valid", yearsLicensed: "10", atFaultAccidents: "0", violations: "0", dui: "No",
        liabilityLimit: "100/300", propertyDamage: "100,000", compDeductible: "500", collisionDeductible: "500", uninsuredMotorist: "Match BI", rental: "40/1200", roadside: "No", discounts: ["Multi-policy", "Good driver", "Paperless"],
        commercialExposure: "No", customEquipment: "No", salvageTitle: "No", excludedDriver: "No", notes: "Clean preferred auto risk."
      },
      normal: {
        effectiveDate: todayPlus(10), fullName: "Daniel Rivera", dateOfBirth: "1985-02-20", maritalStatus: "Single", email: "daniel@example.com", phone: "555-333-2020",
        street: "88 Lone Star Ave", city: "Dallas", state: "TX", zip: "75001", mailingDifferent: "No", residenceType: "Rent",
        currentlyInsured: "Yes", priorCarrier: "GEICO", priorBILimits: "50/100", lapseDays: "0", continuousMonths: "28", priorClaims: "1",
        vin: "5YJ3E1EA7KF317000", year: "2019", make: "Tesla", model: "Model 3", ownership: "Owned", vehicleUse: "Commute", annualMileage: "13500", antiTheft: "Yes",
        driversCount: "2", licenseStatus: "Valid", yearsLicensed: "6", atFaultAccidents: "1", violations: "0", dui: "No",
        liabilityLimit: "100/300", propertyDamage: "100,000", compDeductible: "1000", collisionDeductible: "1000", uninsuredMotorist: "Match BI", rental: "30/900", roadside: "Yes", discounts: ["Telematics", "Paperless"],
        commercialExposure: "No", customEquipment: "No", salvageTitle: "No", excludedDriver: "No", notes: "One prior at-fault accident."
      },
      hard: {
        effectiveDate: todayPlus(3), fullName: "Chris Morgan", dateOfBirth: "2003-11-08", maritalStatus: "Single", email: "chris@example.com", phone: "555-444-3030",
        street: "42 Ocean Drive", city: "Miami", state: "FL", zip: "33101", mailingDifferent: "Yes", residenceType: "Live with family",
        currentlyInsured: "No", priorCarrier: "", priorBILimits: "None", lapseDays: "45", continuousMonths: "0", priorClaims: "2",
        vin: "3FA6P0H75ER208976", year: "2014", make: "Ford", model: "Fusion", ownership: "Owned", vehicleUse: "Business", annualMileage: "21000", antiTheft: "No",
        driversCount: "1", licenseStatus: "Valid", yearsLicensed: "2", atFaultAccidents: "2", violations: "2", dui: "No",
        liabilityLimit: "250/500", propertyDamage: "100,000", compDeductible: "250", collisionDeductible: "250", uninsuredMotorist: "Match BI", rental: "50/1500", roadside: "Yes", discounts: [],
        commercialExposure: "Yes", customEquipment: "Yes", salvageTitle: "No", excludedDriver: "No", notes: "Business use and young driver with activity."
      }
    },
    home: {
      easy: {
        effectiveDate: todayPlus(14), fullName: "Ana Lopez", dateOfBirth: "1988-05-12", email: "ana@example.com", phone: "555-555-1111", policyForm: "HO3 Homeowners",
        street: "456 Oak Drive", city: "Fairfax", state: "VA", zip: "22030", occupancy: "Primary", purchaseClosing: "No",
        yearBuilt: "2018", squareFeet: "2100", construction: "Masonry", roofType: "Metal", roofAge: "4", updates: ["Roof", "Plumbing", "Electrical", "HVAC"],
        dwelling: "350000", otherStructures: "10", personalProperty: "50", lossOfUse: "20", liability: "300000", deductible: "1000", windHailDeductible: "Same as AOP", endorsements: ["Replacement cost contents", "Water backup"],
        currentlyInsured: "Yes", priorCarrier: "Safeco", claims: "0", waterClaims: "0", mortgage: "Yes", inspectionAvailable: "Yes",
        pool: "No", trampoline: "No", animals: "No", business: "No", brush: "No", vacantDays: "0", notes: "Clean newer primary home."
      },
      normal: {
        effectiveDate: todayPlus(9), fullName: "Jordan Miller", dateOfBirth: "1979-09-03", email: "jordan@example.com", phone: "555-555-2222", policyForm: "HO6 Condo",
        street: "778 Capitol Way", city: "Sacramento", state: "CA", zip: "95814", occupancy: "Primary", purchaseClosing: "Yes",
        yearBuilt: "1998", squareFeet: "1450", construction: "Frame", roofType: "Tile", roofAge: "12", updates: ["HVAC", "Water heater"],
        dwelling: "180000", otherStructures: "0", personalProperty: "40", lossOfUse: "20", liability: "300000", deductible: "1000", windHailDeductible: "Same as AOP", endorsements: ["Replacement cost contents", "Water backup", "Service line"],
        currentlyInsured: "Yes", priorCarrier: "Farmers", claims: "1", waterClaims: "1", mortgage: "Yes", inspectionAvailable: "Yes",
        pool: "No", trampoline: "No", animals: "Yes - dog only", business: "Office only", brush: "Low", vacantDays: "0", notes: "One prior water claim, condo form."
      },
      hard: {
        effectiveDate: todayPlus(5), fullName: "Taylor Bennett", dateOfBirth: "1967-12-21", email: "taylor@example.com", phone: "555-555-3333", policyForm: "HO3 Homeowners",
        street: "19 Palm Court", city: "Miami", state: "FL", zip: "33139", occupancy: "Secondary", purchaseClosing: "No",
        yearBuilt: "1958", squareFeet: "3100", construction: "Frame", roofType: "Asphalt shingle", roofAge: "24", updates: ["HVAC"],
        dwelling: "625000", otherStructures: "10", personalProperty: "70", lossOfUse: "30", liability: "500000", deductible: "500", windHailDeductible: "1%", endorsements: ["Replacement cost contents", "Water backup", "Scheduled jewelry"],
        currentlyInsured: "No", priorCarrier: "", claims: "3", waterClaims: "2", mortgage: "No", inspectionAvailable: "No",
        pool: "Yes - not fenced", trampoline: "Yes - no net/fence", animals: "Yes - restricted breed/exotic", business: "Customer visits", brush: "Moderate", vacantDays: "45", notes: "Older roof, multiple claims, hazards present."
      }
    }
  };

  const el = {
    loginScreen: byId("loginScreen"),
    portalScreen: byId("portalScreen"),
    loginForm: byId("loginForm"),
    loginError: byId("loginError"),
    userName: byId("userName"),
    userEmail: byId("userEmail"),
    userRole: byId("userRole"),
    miniUserName: byId("miniUserName"),
    miniUserRole: byId("miniUserRole"),
    logoutBtn: byId("logoutBtn"),
    themeBtn: byId("themeBtn"),
    pageTitle: byId("pageTitle"),
    portalDate: byId("portalDate"),
    stepList: byId("stepList"),
    questionContainer: byId("questionContainer"),
    validationBox: byId("validationBox"),
    stepTitle: byId("stepTitle"),
    stepEyebrow: byId("stepEyebrow"),
    helperContent: byId("helperContent"),
    snapshotList: byId("snapshotList"),
    progressBar: byId("progressBar"),
    progressText: byId("progressText"),
    prevStepBtn: byId("prevStepBtn"),
    nextStepBtn: byId("nextStepBtn"),
    rateQuoteBtn: byId("rateQuoteBtn"),
    clearQuoteBtn: byId("clearQuoteBtn"),
    quoteHeaderTitle: byId("quoteHeaderTitle"),
    quoteHeaderCopy: byId("quoteHeaderCopy"),
    autoProductBtn: byId("autoProductBtn"),
    homeProductBtn: byId("homeProductBtn"),
    resultsTitle: byId("resultsTitle"),
    resultsSubtext: byId("resultsSubtext"),
    quoteSummary: byId("quoteSummary"),
    carrierResults: byId("carrierResults"),
    backToQuoteBtn: byId("backToQuoteBtn"),
    saveQuoteBtn: byId("saveQuoteBtn"),
    printQuoteBtn: byId("printQuoteBtn"),
    appetiteGrid: byId("appetiteGrid"),
    historyBody: byId("historyBody"),
    exportCsvBtn: byId("exportCsvBtn"),
    clearHistoryBtn: byId("clearHistoryBtn"),
    guideContent: byId("guideContent"),
    recentQuoteBox: byId("recentQuoteBox"),
    toast: byId("toast"),
    statTotal: byId("statTotal"),
    statAuto: byId("statAuto"),
    statHome: byId("statHome"),
    statPremium: byId("statPremium")
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    applyTheme();
    el.portalDate.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    bindEvents();
    renderAppetite();
    renderGuide();
    const user = getJson(STORAGE.user, null);
    if (user) enterPortal(user);
    else showLogin();
  }

  function bindEvents() {
    el.loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const name = el.userName.value.trim();
      const email = el.userEmail.value.trim();
      const role = el.userRole.value;
      if (!name || !email) {
        el.loginError.textContent = "Please enter your full name and email.";
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        el.loginError.textContent = "Please enter a valid email address.";
        return;
      }
      enterPortal({ name, email, role, loginAt: new Date().toISOString() });
    });

    document.body.addEventListener("click", event => {
      const routeBtn = event.target.closest("[data-route]");
      if (routeBtn) {
        setRoute(routeBtn.dataset.route);
        return;
      }
      const startBtn = event.target.closest("[data-start-product]");
      if (startBtn) {
        setProduct(startBtn.dataset.startProduct);
        setRoute("quote");
        return;
      }
      const productBtn = event.target.closest("[data-product]");
      if (productBtn) {
        setProduct(productBtn.dataset.product);
        return;
      }
      const scenarioBtn = event.target.closest("[data-scenario]");
      if (scenarioBtn) {
        loadScenario(scenarioBtn.dataset.scenario);
        return;
      }
      const stepBtn = event.target.closest("[data-step-index]");
      if (stepBtn) {
        saveCurrentStepAnswers();
        app.stepIndex = Number(stepBtn.dataset.stepIndex);
        renderQuoteStep();
        return;
      }
      const viewBtn = event.target.closest("[data-view-quote]");
      if (viewBtn) {
        viewSavedQuote(viewBtn.dataset.viewQuote);
        return;
      }
      const deleteBtn = event.target.closest("[data-delete-quote]");
      if (deleteBtn) {
        deleteQuote(deleteBtn.dataset.deleteQuote);
      }
    });

    el.questionContainer.addEventListener("input", handleQuestionChange);
    el.questionContainer.addEventListener("change", handleQuestionChange);

    el.prevStepBtn.addEventListener("click", () => {
      saveCurrentStepAnswers();
      if (app.stepIndex > 0) app.stepIndex -= 1;
      renderQuoteStep();
    });

    el.nextStepBtn.addEventListener("click", () => {
      if (!validateCurrentStep()) return;
      saveCurrentStepAnswers();
      if (app.stepIndex < getCurrentSteps().length - 1) app.stepIndex += 1;
      renderQuoteStep();
    });

    el.rateQuoteBtn.addEventListener("click", () => {
      saveCurrentStepAnswers();
      const errors = validateAllSteps();
      if (errors.length) {
        app.stepIndex = errors[0].stepIndex;
        renderQuoteStep();
        showValidation(errors.map(e => e.message));
        toast("Please complete the required quote questions first.");
        return;
      }
      rateQuote();
    });

    el.clearQuoteBtn.addEventListener("click", () => {
      const ok = confirm(`Clear current ${app.product === "auto" ? "Auto" : "Home"} quote answers?`);
      if (!ok) return;
      app.answers[app.product] = {};
      app.stepIndex = 0;
      app.lastResults = null;
      renderQuoteStep();
      toast("Current quote cleared.");
    });

    el.backToQuoteBtn.addEventListener("click", () => setRoute("quote"));
    el.saveQuoteBtn.addEventListener("click", saveQuote);
    el.printQuoteBtn.addEventListener("click", () => window.print());
    el.logoutBtn.addEventListener("click", logout);
    el.themeBtn.addEventListener("click", toggleTheme);
    el.exportCsvBtn.addEventListener("click", exportCsv);
    el.clearHistoryBtn.addEventListener("click", clearHistory);
  }

  function showLogin() {
    el.loginScreen.classList.add("active");
    el.portalScreen.classList.remove("active");
  }

  function enterPortal(user) {
    setJson(STORAGE.user, user);
    el.miniUserName.textContent = user.name;
    el.miniUserRole.textContent = user.role;
    el.loginScreen.classList.remove("active");
    el.portalScreen.classList.add("active");
    setRoute("dashboard");
    renderDashboard();
    renderHistory();
    renderQuoteStep();
  }

  function logout() {
    localStorage.removeItem(STORAGE.user);
    showLogin();
    toast("You have logged out.");
  }

  function setRoute(route) {
    app.route = route;
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    const view = byId(`${route}View`);
    if (view) view.classList.add("active");
    document.querySelectorAll(".side-nav [data-route]").forEach(btn => btn.classList.toggle("active", btn.dataset.route === route));
    const titles = { dashboard: "Dashboard", quote: "New Quote", results: "Quote Results", appetite: "Carrier Appetite", history: "Quote History", guide: "Training Guide" };
    el.pageTitle.textContent = titles[route] || "Carrier Portal";
    if (route === "dashboard") renderDashboard();
    if (route === "history") renderHistory();
    if (route === "quote") renderQuoteStep();
  }

  function setProduct(product) {
    saveCurrentStepAnswers();
    app.product = product;
    app.stepIndex = 0;
    app.lastResults = null;
    el.autoProductBtn.classList.toggle("active", product === "auto");
    el.homeProductBtn.classList.toggle("active", product === "home");
    el.quoteHeaderTitle.textContent = product === "auto" ? "Auto Quote Intake" : "Home Quote Intake";
    el.quoteHeaderCopy.textContent = product === "auto"
      ? "Collect driver, vehicle, prior insurance, coverage, and underwriting answers."
      : "Collect property, coverage, loss history, and hazard answers.";
    renderQuoteStep();
  }

  function renderQuoteStep() {
    const currentSteps = getCurrentSteps();
    const step = currentSteps[app.stepIndex];
    if (!step) return;

    el.stepList.innerHTML = currentSteps.map((item, index) => {
      const complete = isStepComplete(item);
      return `
        <button class="step-button ${index === app.stepIndex ? "active" : ""} ${complete ? "done" : ""}" type="button" data-step-index="${index}">
          <span class="step-index">${complete ? "✓" : index + 1}</span>
          <span class="step-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.short)}</small></span>
        </button>
      `;
    }).join("");

    el.stepEyebrow.textContent = `Step ${app.stepIndex + 1} of ${currentSteps.length}`;
    el.stepTitle.textContent = step.title;
    el.questionContainer.innerHTML = step.questions.map(renderQuestion).join("");
    el.helperContent.innerHTML = renderHelper(step);
    hideValidation();
    el.prevStepBtn.disabled = app.stepIndex === 0;
    el.nextStepBtn.style.display = app.stepIndex === currentSteps.length - 1 ? "none" : "inline-flex";
    el.rateQuoteBtn.style.display = app.stepIndex === currentSteps.length - 1 ? "inline-flex" : "none";
    updateProgress();
    updateSnapshot();
    hydrateFormValues();
  }

  function renderQuestion(question) {
    const value = getAnswer(question.name);
    const required = question.required ? `<span class="required">*</span>` : "";
    const full = question.type === "textarea" || question.type === "checkbox-group" ? " full" : "";
    const help = question.help ? `<div class="question-help">${escapeHtml(question.help)}</div>` : "";

    if (question.type === "checkbox-group") {
      const selected = Array.isArray(value) ? value : [];
      return `
        <div class="question${full}" data-question-name="${question.name}">
          <label><span>${escapeHtml(question.label)} ${required}</span></label>
          <div class="checkbox-group">
            ${(question.options || []).map(option => `
              <label class="check-question">
                <input type="checkbox" name="${question.name}" value="${escapeHtml(option)}" ${selected.includes(option) ? "checked" : ""} />
                <span><strong>${escapeHtml(option)}</strong></span>
              </label>
            `).join("")}
          </div>
          ${help}
        </div>
      `;
    }

    if (question.type === "textarea") {
      return `
        <div class="question${full}" data-question-name="${question.name}">
          <label>
            <span>${escapeHtml(question.label)} ${required}</span>
            <textarea name="${question.name}" placeholder="${escapeHtml(question.placeholder || "")}">${escapeHtml(value || "")}</textarea>
          </label>
          ${help}
        </div>
      `;
    }

    if (question.type === "select") {
      return `
        <div class="question${full}" data-question-name="${question.name}">
          <label>
            <span>${escapeHtml(question.label)} ${required}</span>
            <select name="${question.name}">
              <option value="">Select an answer</option>
              ${(question.options || []).map(option => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
            </select>
          </label>
          ${help}
        </div>
      `;
    }

    return `
      <div class="question${full}" data-question-name="${question.name}">
        <label>
          <span>${escapeHtml(question.label)} ${required}</span>
          <input name="${question.name}" type="${question.type}" value="${escapeHtml(value || "")}" placeholder="${escapeHtml(question.placeholder || "")}" ${question.min !== undefined ? `min="${question.min}"` : ""} />
        </label>
        ${help}
      </div>
    `;
  }

  function renderHelper(step) {
    const examples = step.questions.slice(0, 4).map(question => `
      <div class="helper-item">
        <strong>${escapeHtml(question.label)}</strong>
        <p>${escapeHtml(question.help || "This answer supports rating and underwriting accuracy.")}</p>
      </div>
    `).join("");
    return `<p>${escapeHtml(step.helper)}</p>${examples}`;
  }

  function hydrateFormValues() {
    const step = getCurrentSteps()[app.stepIndex];
    if (!step) return;
    step.questions.forEach(question => {
      const value = getAnswer(question.name);
      if (question.type === "checkbox-group") return;
      const field = el.questionContainer.querySelector(`[name="${cssEscape(question.name)}"]`);
      if (field && value !== undefined) field.value = value;
    });
  }

  function handleQuestionChange(event) {
    const target = event.target;
    if (!target.name) return;
    saveCurrentStepAnswers();
    if (target.name === "vin") autoFillVin(target.value);
    updateProgress();
    updateSnapshot();
  }

  function saveCurrentStepAnswers() {
    const step = getCurrentSteps()[app.stepIndex];
    if (!step) return;
    const productAnswers = app.answers[app.product];
    step.questions.forEach(question => {
      if (question.type === "checkbox-group") {
        const values = Array.from(el.questionContainer.querySelectorAll(`input[name="${cssEscape(question.name)}"]:checked`)).map(input => input.value);
        productAnswers[question.name] = values;
        return;
      }
      const field = el.questionContainer.querySelector(`[name="${cssEscape(question.name)}"]`);
      if (!field) return;
      productAnswers[question.name] = field.value.trim ? field.value.trim() : field.value;
    });
  }

  function autoFillVin(vin) {
    if (app.product !== "auto") return;
    const cleaned = String(vin || "").toUpperCase().trim();
    const samples = {
      "1HGCM82633A004352": { year: "2021", make: "Honda", model: "Accord" },
      "5YJ3E1EA7KF317000": { year: "2019", make: "Tesla", model: "Model 3" },
      "3FA6P0H75ER208976": { year: "2014", make: "Ford", model: "Fusion" },
      "2T1BURHE0JC034567": { year: "2018", make: "Toyota", model: "Corolla" }
    };
    if (cleaned.length === 17 && samples[cleaned]) {
      Object.assign(app.answers.auto, samples[cleaned]);
      hydrateFormValues();
      toast("Sample VIN recognized. Vehicle fields were filled for training.");
    }
  }

  function validateCurrentStep() {
    saveCurrentStepAnswers();
    const step = getCurrentSteps()[app.stepIndex];
    const errors = validateStep(step, app.stepIndex);
    if (errors.length) {
      showValidation(errors.map(e => e.message));
      return false;
    }
    hideValidation();
    return true;
  }

  function validateAllSteps() {
    return getCurrentSteps().flatMap((step, index) => validateStep(step, index));
  }

  function validateStep(step, stepIndex) {
    const answers = app.answers[app.product];
    const errors = [];
    step.questions.forEach(question => {
      const value = answers[question.name];
      const empty = Array.isArray(value) ? value.length === 0 : value === undefined || value === null || String(value).trim() === "";
      if (question.required && empty) {
        errors.push({ stepIndex, message: `${step.title}: ${question.label} is required.` });
        return;
      }
      if (empty) return;
      if (question.pattern === "zip" && !/^\d{5}(-\d{4})?$/.test(String(value))) {
        errors.push({ stepIndex, message: `${step.title}: ${question.label} must be a valid ZIP code.` });
      }
      if (question.type === "email" && !/^\S+@\S+\.\S+$/.test(String(value))) {
        errors.push({ stepIndex, message: `${step.title}: ${question.label} must be a valid email.` });
      }
      if (question.name === "vin" && String(value).replace(/\s/g, "").length !== 17) {
        errors.push({ stepIndex, message: `${step.title}: VIN should be exactly 17 characters for carrier quoting.` });
      }
      if (question.type === "number" && question.min !== undefined && num(value) < question.min) {
        errors.push({ stepIndex, message: `${step.title}: ${question.label} must be ${question.min} or higher.` });
      }
    });
    return errors;
  }

  function showValidation(messages) {
    el.validationBox.hidden = false;
    el.validationBox.innerHTML = `<strong>Please fix these items:</strong><ul>${messages.map(message => `<li>${escapeHtml(message)}</li>`).join("")}</ul>`;
  }

  function hideValidation() {
    el.validationBox.hidden = true;
    el.validationBox.innerHTML = "";
  }

  function updateProgress() {
    const currentSteps = getCurrentSteps();
    const complete = currentSteps.filter(isStepComplete).length;
    const percent = Math.round((complete / currentSteps.length) * 100);
    el.progressBar.style.width = `${percent}%`;
    el.progressText.textContent = `${percent}%`;
  }

  function isStepComplete(step) {
    const answers = app.answers[app.product];
    return step.questions.filter(question => question.required).every(question => {
      const value = answers[question.name];
      return Array.isArray(value) ? value.length > 0 : value !== undefined && String(value).trim() !== "";
    });
  }

  function updateSnapshot() {
    const a = app.answers[app.product];
    const rows = app.product === "auto" ? [
      ["Insured", a.fullName || "—"],
      ["State", a.state || "—"],
      ["Vehicle", [a.year, a.make, a.model].filter(Boolean).join(" ") || "—"],
      ["Prior BI", a.priorBILimits || "—"],
      ["Liability", a.liabilityLimit || "—"],
      ["Record", `${a.atFaultAccidents || 0} accident(s), ${a.violations || 0} violation(s)`]
    ] : [
      ["Insured", a.fullName || "—"],
      ["State", a.state || "—"],
      ["Form", a.policyForm || "—"],
      ["Dwelling", a.dwelling ? money(a.dwelling) : "—"],
      ["Roof age", a.roofAge ? `${a.roofAge} years` : "—"],
      ["Claims", a.claims || "0"]
    ];
    el.snapshotList.innerHTML = rows.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd></div>`).join("");
  }

  function loadScenario(level) {
    const data = scenarios[app.product][level];
    if (!data) return;
    app.answers[app.product] = structuredCloneSafe(data);
    app.stepIndex = 0;
    renderQuoteStep();
    toast(`${capitalize(level)} ${app.product === "auto" ? "Auto" : "Home"} scenario loaded.`);
  }

  function rateQuote() {
    const answers = app.answers[app.product];
    const results = app.product === "auto" ? rateAuto(answers) : rateHome(answers);
    const eligible = results.filter(item => item.status !== "Declined").sort((a, b) => a.annual - b.annual);
    const best = eligible[0] || results[0];
    app.lastResults = {
      id: makeQuoteId(),
      product: app.product,
      answers: structuredCloneSafe(answers),
      carriers: results,
      best,
      createdAt: new Date().toISOString(),
      user: getJson(STORAGE.user, null)
    };
    renderResults(app.lastResults);
    setRoute("results");
    toast("Quote rated successfully. Review carrier results.");
  }

  function rateAuto(a) {
    const stateFactor = STATE_FACTORS[a.state] || 1;
    const ageFactor = ageFactorFromDob(a.dateOfBirth);
    const vehicleFactor = vehicleAgeFactor(a.year);
    const mileage = num(a.annualMileage);
    const mileageFactor = mileage > 20000 ? 1.18 : mileage > 15000 ? 1.09 : mileage < 8000 ? 0.92 : 1;
    const recordFactor = 1 + (num(a.atFaultAccidents) * 0.22) + (num(a.violations) * 0.12) + (a.dui === "Yes" ? 0.55 : 0);
    const priorFactor = a.currentlyInsured === "No" ? 1.18 : Math.max(0.9, 1 - Math.min(num(a.continuousMonths), 60) * 0.002);
    const lapseFactor = num(a.lapseDays) > 30 ? 1.18 : num(a.lapseDays) > 0 ? 1.08 : 1;
    const useFactor = a.vehicleUse === "Business" ? 1.18 : a.vehicleUse === "Delivery/Rideshare" ? 1.5 : a.vehicleUse === "Commute" ? 1.04 : 0.98;
    const coverageFactor = liabilityFactor(a.liabilityLimit) * deductibleFactor(a.compDeductible) * deductibleFactor(a.collisionDeductible);
    const discountFactor = discountFactorFrom(a.discounts, {
      "Multi-policy": 0.08,
      "Good driver": 0.1,
      "Good student": 0.04,
      "Telematics": 0.06,
      "Paperless": 0.02,
      "Paid in full": 0.05
    });
    const addOn = (a.rental !== "No" ? 42 : 0) + (a.roadside === "Yes" ? 28 : 0) + (a.uninsuredMotorist === "Match BI" ? 55 : 0);

    return CARRIERS.map((carrier, index) => {
      let annual = carrier.autoBase * stateFactor * ageFactor * vehicleFactor * mileageFactor * recordFactor * priorFactor * lapseFactor * useFactor * coverageFactor * discountFactor + addOn;
      annual *= carrierModifier(carrier.id, a.zip, index);
      const flags = autoFlags(a);
      const status = carrierStatus(flags, annual, "auto", carrier.id);
      const reasons = autoReasons(a, flags);
      return resultObject(carrier, annual, status, reasons, flags);
    }).sort(statusThenPremium);
  }

  function rateHome(a) {
    const stateFactor = STATE_FACTORS[a.state] || 1;
    const dwellingFactor = Math.max(0.65, num(a.dwelling) / 300000);
    const homeAge = new Date().getFullYear() - num(a.yearBuilt, 2000);
    const homeAgeFactor = homeAge > 80 ? 1.32 : homeAge > 50 ? 1.18 : homeAge > 25 ? 1.08 : homeAge < 8 ? 0.94 : 1;
    const roof = num(a.roofAge);
    const roofFactor = roof > 25 ? 1.35 : roof > 20 ? 1.22 : roof > 15 ? 1.12 : roof < 7 ? 0.94 : 1;
    const claimFactor = 1 + (num(a.claims) * 0.18) + (num(a.waterClaims) * 0.12);
    const constructionFactor = a.construction === "Frame" ? 1.08 : a.construction === "Masonry" ? 0.96 : a.construction === "Superior/Fire resistive" ? 0.92 : 1;
    const occupancyFactor = a.occupancy === "Vacant" ? 1.6 : a.occupancy === "Secondary" ? 1.18 : a.occupancy === "Tenant occupied" ? 1.25 : 1;
    const hazardFactor = homeHazardFactor(a);
    const deductible = deductibleFactor(a.deductible);
    const endorsementAdd = Array.isArray(a.endorsements) ? a.endorsements.length * 28 : 0;
    const discount = discountFactorFrom(a.updates, { Roof: 0.04, Plumbing: 0.025, Electrical: 0.025, HVAC: 0.02, "Water heater": 0.015 });

    return CARRIERS.map((carrier, index) => {
      let annual = carrier.homeBase * stateFactor * dwellingFactor * homeAgeFactor * roofFactor * claimFactor * constructionFactor * occupancyFactor * hazardFactor * deductible * discount + endorsementAdd;
      annual *= carrierModifier(carrier.id, a.zip, index);
      const flags = homeFlags(a);
      const status = carrierStatus(flags, annual, "home", carrier.id);
      const reasons = homeReasons(a, flags);
      return resultObject(carrier, annual, status, reasons, flags);
    }).sort(statusThenPremium);
  }

  function autoFlags(a) {
    const flags = [];
    if (["Suspended", "Revoked"].includes(a.licenseStatus)) flags.push("License status requires referral or decline.");
    if (a.dui === "Yes") flags.push("Severe violation requires underwriting review.");
    if (a.commercialExposure === "Yes" || a.vehicleUse === "Delivery/Rideshare") flags.push("Commercial or delivery exposure may not qualify for personal auto.");
    if (num(a.atFaultAccidents) >= 2 || num(a.violations) >= 2) flags.push("Driving activity is elevated.");
    if (a.currentlyInsured === "No" || num(a.lapseDays) > 30) flags.push("Prior insurance lapse/no prior insurance." );
    if (a.salvageTitle === "Yes") flags.push("Salvage/rebuilt title needs physical damage review.");
    return flags;
  }

  function homeFlags(a) {
    const flags = [];
    if (num(a.roofAge) > 20) flags.push("Roof age is over 20 years.");
    if (num(a.claims) >= 3) flags.push("Claim frequency requires underwriting review.");
    if (num(a.waterClaims) >= 2) flags.push("Multiple water losses require review.");
    if (a.pool === "Yes - not fenced") flags.push("Unfenced pool creates liability concern.");
    if (a.trampoline === "Yes - no net/fence") flags.push("Trampoline without protection creates liability concern.");
    if (a.animals === "Yes - restricted breed/exotic") flags.push("Restricted animal exposure requires review.");
    if (a.occupancy === "Vacant" || num(a.vacantDays) > 30) flags.push("Vacancy/unoccupancy may require a different form.");
    if (a.brush === "High") flags.push("High brush/wildfire exposure.");
    return flags;
  }

  function carrierStatus(flags, annual, product, carrierId) {
    const severe = flags.some(flag => /revoked|suspended|commercial|delivery|Vacancy|High brush|restricted|Claim frequency|Severe/i.test(flag));
    if (severe && ["travelers", "erie", "mercury"].includes(carrierId)) return "Declined";
    if (flags.length >= 3) return carrierId === "national-general" ? "Referral" : "Declined";
    if (flags.length >= 1) return "Referral";
    if (annual < (product === "auto" ? 1500 : 1600)) return "Preferred";
    return "Standard";
  }

  function resultObject(carrier, annual, status, reasons, flags) {
    const rounded = Math.max(350, Math.round(annual));
    return {
      carrierId: carrier.id,
      carrierName: carrier.name,
      code: carrier.code,
      color: carrier.color,
      status,
      annual: rounded,
      monthly: Math.round((rounded / 12) + 5),
      downPayment: Math.round(rounded * 0.18),
      amBest: carrier.id === "bamboo" ? "Training" : "A or better",
      reasons,
      flags
    };
  }

  function autoReasons(a, flags) {
    const reasons = [];
    reasons.push(`${a.liabilityLimit || "Selected"} liability limit with ${a.compDeductible || "selected"}/${a.collisionDeductible || "selected"} deductibles.`);
    if (Array.isArray(a.discounts) && a.discounts.length) reasons.push(`Discounts applied: ${a.discounts.join(", ")}.`);
    if (num(a.lapseDays) === 0 && a.currentlyInsured === "Yes") reasons.push("Continuous prior insurance improves rating tier.");
    if (flags.length) reasons.push(...flags);
    return reasons;
  }

  function homeReasons(a, flags) {
    const reasons = [];
    reasons.push(`${money(a.dwelling)} dwelling limit with ${a.deductible || "selected"} AOP deductible.`);
    if (Array.isArray(a.endorsements) && a.endorsements.length) reasons.push(`Endorsements selected: ${a.endorsements.join(", ")}.`);
    if (Array.isArray(a.updates) && a.updates.length) reasons.push(`Updates documented: ${a.updates.join(", ")}.`);
    if (flags.length) reasons.push(...flags);
    return reasons;
  }

  function renderResults(quote) {
    if (!quote) return;
    const a = quote.answers;
    const best = quote.best;
    el.resultsTitle.textContent = `${quote.product === "auto" ? "Auto" : "Home"} Quote Results for ${a.fullName}`;
    el.resultsSubtext.textContent = `Quote ${quote.id} • ${formatDate(quote.createdAt)} • Best available premium: ${best && best.status !== "Declined" ? money(best.annual) : "No eligible carrier"}`;
    el.quoteSummary.innerHTML = renderQuoteSummary(quote);
    el.carrierResults.innerHTML = quote.carriers.map(renderCarrierCard).join("");
  }

  function renderQuoteSummary(quote) {
    const a = quote.answers;
    const rows = quote.product === "auto" ? [
      ["Quote #", quote.id],
      ["Product", "Personal Auto"],
      ["Named Insured", a.fullName || "—"],
      ["State/ZIP", `${a.state || "—"} ${a.zip || ""}`],
      ["Vehicle", [a.year, a.make, a.model].filter(Boolean).join(" ") || "—"],
      ["Use/Mileage", `${a.vehicleUse || "—"} / ${a.annualMileage || "—"}`],
      ["Driving Record", `${a.atFaultAccidents || 0} accident(s), ${a.violations || 0} violation(s)`],
      ["Coverage", `${a.liabilityLimit || "—"} BI / ${a.propertyDamage || "—"} PD`]
    ] : [
      ["Quote #", quote.id],
      ["Product", a.policyForm || "Home"],
      ["Named Insured", a.fullName || "—"],
      ["State/ZIP", `${a.state || "—"} ${a.zip || ""}`],
      ["Year/Roof", `${a.yearBuilt || "—"} / ${a.roofAge || "—"} yrs`],
      ["Dwelling", money(a.dwelling)],
      ["Claims", `${a.claims || 0} total / ${a.waterClaims || 0} water`],
      ["Deductible", `${a.deductible || "—"} AOP / ${a.windHailDeductible || "—"} wind`]
    ];
    return `<div class="summary-grid">${rows.map(([label, value]) => `<div class="summary-cell"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("")}</div>`;
  }

  function renderCarrierCard(item) {
    const cls = item.status === "Declined" ? "bad" : item.status === "Referral" ? "warn" : "good";
    const premium = item.status === "Declined" ? "Not eligible" : money(item.annual);
    const monthly = item.status === "Declined" ? "Carrier declined based on training rules" : `${money(item.monthly)}/mo est. • ${money(item.downPayment)} down est.`;
    return `
      <article class="carrier-card card elevated">
        <div class="carrier-top">
          <div class="carrier-brand">
            <span class="carrier-icon" style="background:${item.color}">${escapeHtml(item.code)}</span>
            <div><h3>${escapeHtml(item.carrierName)}</h3><span class="tag-pill">AM Best: ${escapeHtml(item.amBest)}</span></div>
          </div>
          <span class="status-pill ${cls}">${escapeHtml(item.status)}</span>
        </div>
        <h2 class="premium">${premium}</h2>
        <div class="monthly">${monthly}</div>
        <ul class="reason-list">${item.reasons.slice(0, 5).map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>
        <div class="carrier-footer">
          ${(item.flags.length ? item.flags : ["No major referral flags."]).slice(0, 3).map(flag => `<span class="tag-pill">${escapeHtml(flag)}</span>`).join("")}
        </div>
      </article>
    `;
  }

  function saveQuote() {
    const quote = app.viewingQuote || app.lastResults;
    if (!quote) {
      toast("No quote available to save yet.");
      return;
    }
    const quotes = getQuotes();
    const exists = quotes.some(item => item.id === quote.id);
    if (!exists) quotes.unshift(quote);
    setJson(STORAGE.quotes, quotes);
    renderDashboard();
    renderHistory();
    toast(`Quote ${quote.id} saved to history.`);
  }

  function viewSavedQuote(id) {
    const quote = getQuotes().find(item => item.id === id);
    if (!quote) return;
    app.viewingQuote = quote;
    app.lastResults = quote;
    renderResults(quote);
    setRoute("results");
  }

  function deleteQuote(id) {
    const ok = confirm(`Delete quote ${id}?`);
    if (!ok) return;
    setJson(STORAGE.quotes, getQuotes().filter(item => item.id !== id));
    renderDashboard();
    renderHistory();
    toast("Quote deleted.");
  }

  function renderHistory() {
    const quotes = getQuotes();
    if (!quotes.length) {
      el.historyBody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No saved quotes yet. Rate and save a quote first.</div></td></tr>`;
      return;
    }
    el.historyBody.innerHTML = quotes.map(quote => {
      const best = quote.best || {};
      const status = best.status || "—";
      return `
        <tr>
          <td><strong>${escapeHtml(quote.id)}</strong></td>
          <td>${escapeHtml(formatDate(quote.createdAt))}</td>
          <td>${quote.product === "auto" ? "Auto" : "Home"}</td>
          <td>${escapeHtml(quote.answers.fullName || "—")}</td>
          <td>${escapeHtml(best.carrierName || "—")}</td>
          <td>${best.annual ? money(best.annual) : "—"}</td>
          <td><span class="status-pill ${status === "Declined" ? "bad" : status === "Referral" ? "warn" : "good"}">${escapeHtml(status)}</span></td>
          <td>
            <button class="btn tiny" type="button" data-view-quote="${escapeHtml(quote.id)}">View</button>
            <button class="btn tiny danger" type="button" data-delete-quote="${escapeHtml(quote.id)}">Delete</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderDashboard() {
    const quotes = getQuotes();
    el.statTotal.textContent = quotes.length;
    el.statAuto.textContent = quotes.filter(qt => qt.product === "auto").length;
    el.statHome.textContent = quotes.filter(qt => qt.product === "home").length;
    el.statPremium.textContent = quotes[0]?.best?.annual ? money(quotes[0].best.annual) : "—";
    if (!quotes.length) {
      el.recentQuoteBox.className = "empty-state compact";
      el.recentQuoteBox.innerHTML = "No saved quotes yet.";
      return;
    }
    const latest = quotes[0];
    el.recentQuoteBox.className = "recent-quote";
    el.recentQuoteBox.innerHTML = `
      <span class="tag-pill">${latest.product === "auto" ? "Auto" : "Home"} • ${escapeHtml(latest.id)}</span>
      <strong>${escapeHtml(latest.answers.fullName || "—")}</strong>
      <p>${escapeHtml(latest.best.carrierName)} quoted ${money(latest.best.annual)} annual with ${escapeHtml(latest.best.status)} status.</p>
      <button class="btn secondary small" type="button" data-view-quote="${escapeHtml(latest.id)}">Open Last Quote</button>
    `;
  }

  function renderAppetite() {
    el.appetiteGrid.innerHTML = CARRIERS.map(carrier => `
      <article class="appetite-card card elevated">
        <h3><span class="carrier-icon" style="background:${carrier.color}">${escapeHtml(carrier.code)}</span>${escapeHtml(carrier.name)}</h3>
        <div class="appetite-table">
          <div class="appetite-row"><span>Auto appetite</span><strong>${escapeHtml(carrier.appetite.auto)}</strong></div>
          <div class="appetite-row"><span>Home appetite</span><strong>${escapeHtml(carrier.appetite.home)}</strong></div>
          <div class="appetite-row"><span>Strengths</span><strong>${escapeHtml(carrier.strengths.join(", "))}</strong></div>
          <div class="appetite-row"><span>Watch items</span><strong>${escapeHtml(carrier.cautions.join(", "))}</strong></div>
        </div>
      </article>
    `).join("");
  }

  function renderGuide() {
    const guideCards = [
      guideCard("Auto Applicant", steps.auto[0]),
      guideCard("Auto Vehicle/Drivers", { questions: [...steps.auto[3].questions, ...steps.auto[4].questions] }),
      guideCard("Auto Coverage/Underwriting", { questions: [...steps.auto[5].questions, ...steps.auto[6].questions] }),
      guideCard("Home Applicant/Location", { questions: [...steps.home[0].questions, ...steps.home[1].questions] }),
      guideCard("Home Property/Coverage", { questions: [...steps.home[2].questions, ...steps.home[3].questions] }),
      guideCard("Home Claims/Hazards", { questions: [...steps.home[4].questions, ...steps.home[5].questions] })
    ];
    el.guideContent.innerHTML = guideCards.join("");
  }

  function guideCard(title, group) {
    return `
      <article class="guide-card card elevated">
        <span class="eyebrow">Question Set</span>
        <h3>${escapeHtml(title)}</h3>
        <ul>
          ${group.questions.map(question => `<li><strong>${escapeHtml(question.label)}</strong> — ${escapeHtml(question.help || "Used for rating and underwriting accuracy.")}</li>`).join("")}
        </ul>
      </article>
    `;
  }

  function exportCsv() {
    const quotes = getQuotes();
    if (!quotes.length) {
      toast("No quotes to export.");
      return;
    }
    const headers = ["Quote ID", "Date", "Product", "Named Insured", "State", "ZIP", "Best Carrier", "Status", "Annual Premium", "Monthly Estimate"];
    const rows = quotes.map(quote => [
      quote.id,
      formatDate(quote.createdAt),
      quote.product,
      quote.answers.fullName || "",
      quote.answers.state || "",
      quote.answers.zip || "",
      quote.best?.carrierName || "",
      quote.best?.status || "",
      quote.best?.annual || "",
      quote.best?.monthly || ""
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(csv, `lava-pl-rater-quotes-${new Date().toISOString().slice(0,10)}.csv`, "text/csv");
    toast("CSV exported.");
  }

  function clearHistory() {
    const ok = confirm("Clear all saved quote history from this browser?");
    if (!ok) return;
    setJson(STORAGE.quotes, []);
    renderDashboard();
    renderHistory();
    toast("Quote history cleared.");
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = current;
    localStorage.setItem(STORAGE.theme, current);
  }

  function applyTheme() {
    const theme = localStorage.getItem(STORAGE.theme) || "dark";
    document.documentElement.dataset.theme = theme;
  }

  function getCurrentSteps() { return steps[app.product]; }
  function getAnswer(name) { return app.answers[app.product][name]; }
  function getQuotes() { return getJson(STORAGE.quotes, []); }

  function q(name, label, type, options = {}) {
    return { name, label, type, ...options };
  }

  function states() {
    return ["AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"];
  }

  function byId(id) { return document.getElementById(id); }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }


  function getJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("Storage read failed", error);
      return fallback;
    }
  }

  function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function todayPlus(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function num(value, fallback = 0) {
    const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function money(value) {
    return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function makeQuoteId() {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
    return `LAVA-${app.product.toUpperCase()}-${stamp}`;
  }

  function capitalize(text) { return String(text).charAt(0).toUpperCase() + String(text).slice(1); }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
  }

  function ageFactorFromDob(dob) {
    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) return 1;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const m = now.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age -= 1;
    if (age < 21) return 1.65;
    if (age < 25) return 1.38;
    if (age < 30) return 1.14;
    if (age > 75) return 1.28;
    if (age > 65) return 1.12;
    return 1;
  }

  function vehicleAgeFactor(year) {
    const age = new Date().getFullYear() - num(year, new Date().getFullYear());
    if (age <= 2) return 1.18;
    if (age <= 5) return 1.08;
    if (age <= 10) return 1;
    if (age <= 15) return 0.94;
    return 0.88;
  }

  function liabilityFactor(limit) {
    return { "25/50": 0.88, "50/100": 0.95, "100/300": 1, "250/500": 1.12, "500 CSL": 1.22 }[limit] || 1;
  }

  function deductibleFactor(value) {
    return { "None": 0.78, "250": 1.1, "500": 1, "1000": 0.92, "2000": 0.84, "2500": 0.88, "5000": 0.78 }[String(value)] || 1;
  }

  function discountFactorFrom(selected, map) {
    if (!Array.isArray(selected)) return 1;
    const discount = selected.reduce((sum, item) => sum + (map[item] || 0), 0);
    return Math.max(0.72, 1 - discount);
  }

  function homeHazardFactor(a) {
    let factor = 1;
    if (a.pool === "Yes - fenced") factor += 0.04;
    if (a.pool === "Yes - not fenced") factor += 0.18;
    if (a.trampoline === "Yes - with net/fence") factor += 0.04;
    if (a.trampoline === "Yes - no net/fence") factor += 0.16;
    if (a.animals === "Yes - dog only") factor += 0.04;
    if (a.animals === "Yes - restricted breed/exotic") factor += 0.2;
    if (a.business === "Customer visits") factor += 0.16;
    if (a.business === "Inventory/equipment stored") factor += 0.12;
    if (a.brush === "Moderate") factor += 0.12;
    if (a.brush === "High") factor += 0.32;
    return factor;
  }

  function carrierModifier(carrierId, zip, index) {
    const seed = String(zip || "00000").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) + index * 17;
    const drift = ((seed % 15) - 7) / 100;
    const base = { travelers: 1.02, safeco: 0.99, progressive: 0.96, mercury: 1.01, bamboo: 0.98, erie: 1.03, "national-general": 1.08 }[carrierId] || 1;
    return base + drift;
  }

  function statusThenPremium(a, b) {
    const rank = { Preferred: 1, Standard: 2, Referral: 3, Declined: 4 };
    return (rank[a.status] - rank[b.status]) || (a.annual - b.annual);
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
})();
