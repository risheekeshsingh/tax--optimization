const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────
// SCHEME CODES — Hand-picked, reputable ELSS Direct Growth schemes
// These exist in MFAPI so NAV data is live and reliable.
// ─────────────────────────────────────────────────────────
const ELSS_SCHEME_CODES = [
  { code: 119255, house: 'Axis Mutual Fund' },           // Axis ELSS Tax Saver Direct Growth
  { code: 119060, house: 'HDFC Mutual Fund' },           // HDFC ELSS Tax Saver Direct Growth
  { code: 118803, house: 'Nippon India' },               // Nippon India ELSS Direct Growth
  { code: 118285, house: 'Canara Robeco' },              // Canara Robeco ELSS Direct Growth
  { code: 125354, house: 'Quant Mutual Fund' },          // Quant ELSS Tax Saver Direct Growth
  { code: 111549, house: 'Quantum' },                    // Quantum ELSS Direct Growth
  { code: 118540, house: 'Franklin Templeton' },         // Franklin India ELSS Direct Growth
  { code: 119242, house: 'DSP' },                        // DSP ELSS Tax Saver Direct Growth
];

// ─────────────────────────────────────────────────────────
// STRUCTURED STATIC DATASETS — 80D & NPS
// Realistic, premium-brand structured data fed to Groq
// ─────────────────────────────────────────────────────────
const STATIC_80D = [
  {
    productName: 'HDFC Ergo Optima Secure - Family Floater',
    category: 'Insurance',
    nav: 'N/A',
    premiumPerYear: 18500,
    sumInsured: '₹1 Crore',
    riskLevel: 'Low',
    provider: 'HDFC ERGO',
    features: 'Zero co-pay, no room-rent limit, 10,000+ hospitals, no pre-policy checkup under 45',
    claimRatio: '98.5%',
  },
  {
    productName: 'Star Health Comprehensive - Family',
    category: 'Insurance',
    nav: 'N/A',
    premiumPerYear: 14200,
    sumInsured: '₹50 Lakhs',
    riskLevel: 'Low',
    provider: 'Star Health',
    features: 'OPD cover, maternity benefit, 14,000+ hospitals, unlimited automatic recharge',
    claimRatio: '99.1%',
  },
  {
    productName: 'Care Supreme - Senior Citizen Add-On',
    category: 'Insurance',
    nav: 'N/A',
    premiumPerYear: 12000,
    sumInsured: '₹50 Lakhs',
    riskLevel: 'Low',
    provider: 'Care Health Insurance',
    features: 'Unlimited restoration, no co-pay, 24x7 telemedicine, Air Ambulance',
    claimRatio: '95.2%',
  },
];

const STATIC_NPS = [
  {
    productName: 'NPS Tier-1 Equity Fund - HDFC Pension',
    category: 'NPS',
    nav: 'N/A',
    riskLevel: 'High',
    provider: 'HDFC Pension Fund Management',
    aum: '₹42,000 Cr',
    expectedCagr: '~16.5%',
    features: '75% Equity Exposure (max), deduction under 80CCD(1B), extra ₹50,000 over 80C',
  },
  {
    productName: 'NPS Tier-1 Auto Choice - SBI Pension',
    category: 'NPS',
    nav: 'N/A',
    riskLevel: 'Medium',
    provider: 'SBI Pension Fund',
    aum: '₹55,000 Cr',
    expectedCagr: '~11.2%',
    features: 'Auto-rebalancing based on age, lifecycle fund allocation, safe compounding',
  },
  {
    productName: 'NPS Tier-1 Corporate Bond Fund - LIC',
    category: 'NPS',
    nav: 'N/A',
    riskLevel: 'Low',
    provider: 'LIC Pension Fund',
    aum: '₹18,000 Cr',
    expectedCagr: '~9.0%',
    features: 'Heavy government/corporate bonds, minimal volatility, capital protection focus',
  },
];

// ─────────────────────────────────────────────────────────
// STEP 1: FETCH LIVE ELSS FUND DATA FROM MFAPI
// ─────────────────────────────────────────────────────────
async function fetchLiveElssFunds() {
  const results = [];

  const fetchPromises = ELSS_SCHEME_CODES.map(async ({ code, house }) => {
    try {
      const res = await fetch(`https://api.mfapi.in/mf/${code}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = await res.json();

      const meta = data.meta;
      const latestNav = data.data?.[0];
      if (!meta || !latestNav) return null;

      return {
        schemeCode: code,
        productName: meta.scheme_name,
        fundHouse: meta.fund_house || house,
        category: 'ELSS',
        nav: `₹${parseFloat(latestNav.nav).toFixed(2)}`,
        navDate: latestNav.date,
        riskLevel: 'High',
      };
    } catch (err) {
      console.warn(`[MarketplaceService] MFAPI fetch failed for code ${code}: ${err.message}`);
      return null;
    }
  });

  const resolved = await Promise.all(fetchPromises);
  resolved.forEach(r => { if (r) results.push(r); });

  if (results.length === 0) {
    throw new Error('MFAPI returned no valid ELSS data. Cannot proceed without live fund data.');
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// STEP 2: DERIVE USER RISK PROFILE FROM taxData
// ─────────────────────────────────────────────────────────
function deriveRiskProfile(taxData) {
  const age = parseInt(taxData.age) || 30;
  const income = parseInt(taxData.annualIncome) || 500000;

  if (age < 35 && income > 800000) return 'High';
  if (age >= 35 && age < 50) return 'Medium';
  if (age >= 50) return 'Low';
  return 'Medium';
}

// ─────────────────────────────────────────────────────────
// STEP 3: BUILD GROQ PROMPT WITH STRICT JSON ENFORCEMENT
// ─────────────────────────────────────────────────────────
function buildGroqPrompt(taxData, elssData, gap80C, gap80D, gapNPS) {
  const riskProfile = taxData.riskProfile || deriveRiskProfile(taxData);
  const age = parseInt(taxData.age) || 30;
  const regime = taxData.regime || 'old';

  // Build a clean, reduced dataset snapshot for the prompt
  const elssSample = elssData.slice(0, 8).map(f => ({
    name: f.productName,
    nav: f.nav,
    risk: f.riskLevel,
    category: 'ELSS',
  }));

  const ins80DSample = STATIC_80D.map(f => ({
    name: f.productName,
    premium: `₹${f.premiumPerYear.toLocaleString('en-IN')}/yr`,
    category: 'Insurance',
    risk: f.riskLevel,
  }));

  const npsSample = STATIC_NPS.map(f => ({
    name: f.productName,
    category: 'NPS',
    risk: f.riskLevel,
  }));

  const allProducts = [...elssSample, ...ins80DSample, ...npsSample];

  return `
You are a strict, deterministic financial ranking engine for Indian tax optimization. 
Your ONLY job is to rank the products from the provided list based on user profile.

## USER FINANCIAL PROFILE (from Tax Optimizer)
- Annual Income: ₹${parseInt(taxData.annualIncome || 0).toLocaleString('en-IN')}
- Age: ${age} years
- Tax Regime: ${regime} regime
- Risk Appetite: ${riskProfile}
- 80C Gap (unused deduction): ₹${gap80C.toLocaleString('en-IN')}
- 80D Gap (unused deduction): ₹${gap80D.toLocaleString('en-IN')}
- NPS Gap (unused deduction): ₹${gapNPS.toLocaleString('en-IN')}

## AVAILABLE PRODUCTS (you must ONLY rank FROM this list, do NOT invent new products)
${JSON.stringify(allProducts, null, 2)}

## STRICT RANKING LOGIC
1. If 80C Gap > 0 → include relevant ELSS funds (prioritize based on risk profile)
2. If 80D Gap > 0 → include relevant Insurance products
3. If NPS Gap > 0 → include relevant NPS products
4. Young users (age < 35) → prefer High risk/growth products
5. Middle-aged (35-50) → prefer Medium risk
6. Older (50+) → prefer Low risk / stable
7. Output EXACTLY 3 to 5 recommendations total across all categories combined
8. Assign a confidence score (0-100) based on fit to profile

## ABSOLUTE RULES
- Return ONLY a valid JSON array. No extra text, no markdown, no explanations outside the JSON.
- Use ONLY product names from the provided list above (exact match).
- Do NOT hallucinate or invent new products.

## MANDATORY OUTPUT FORMAT (each object must have all these fields)
[
  {
    "productName": "<exact name from list>",
    "category": "ELSS | Insurance | NPS",
    "nav": "<NAV if ELSS, or 'N/A'>",
    "riskLevel": "Low | Medium | High",
    "confidenceScore": <integer 0-100>,
    "reasoning": "<2-3 sentences: why this specifically fits this user's profile and gap>",
    "expectedBenefit": "<specific calculated or estimated tax saving / growth projection>"
  }
]
`.trim();
}

// ─────────────────────────────────────────────────────────
// STEP 4: CALL GROQ AI RANKING ENGINE
// ─────────────────────────────────────────────────────────
async function rankWithGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,  // Low temp = deterministic, not creative
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content: 'You are a strict financial ranking engine. Output only valid JSON arrays. No extra text.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const rawText = completion.choices[0]?.message?.content?.trim();
  if (!rawText) throw new Error('Groq returned empty response.');

  // Extract JSON even if there's stray text
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Groq response was not valid JSON. Raw: ${rawText.substring(0, 300)}`);

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Groq returned an empty JSON array.');
  }

  // Validate each recommendation has required fields
  const required = ['productName', 'category', 'nav', 'riskLevel', 'confidenceScore', 'reasoning', 'expectedBenefit'];
  parsed.forEach((item, idx) => {
    required.forEach(field => {
      if (item[field] === undefined || item[field] === null) {
        throw new Error(`Groq recommendation #${idx} is missing field: "${field}"`);
      }
    });
  });

  return parsed;
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT — Orchestrate everything
// ─────────────────────────────────────────────────────────
async function getMarketplaceRecommendations(taxData) {
  // Compute gaps
  const gap80C = Math.max(0, 150000 - (parseInt(taxData.investments80C) || 0));
  const gap80D = Math.max(0, 25000 - (parseInt(taxData.healthInsurance80D) || 0));
  const gapNPS = Math.max(0, 50000 - (parseInt(taxData.nps80CCD) || 0));

  // Fetch live ELSS data from MFAPI
  console.log('[MarketplaceService] Fetching live ELSS data from MFAPI...');
  const elssData = await fetchLiveElssFunds();
  console.log(`[MarketplaceService] Fetched ${elssData.length} live ELSS funds.`);

  // Build prompt
  const prompt = buildGroqPrompt(taxData, elssData, gap80C, gap80D, gapNPS);

  // Call Groq
  console.log('[MarketplaceService] Sending request to Groq ranking engine...');
  const recommendations = await rankWithGroq(prompt);
  console.log(`[MarketplaceService] Groq returned ${recommendations.length} ranked recommendations.`);

  // Enrich recommendations with full static data details
  const enriched = recommendations.map(rec => {
    // Try to find the matching live ELSS fund to inject full metadata
    const liveMatch = elssData.find(f => f.productName === rec.productName);
    const ins80DMatch = STATIC_80D.find(f => f.productName === rec.productName);
    const npsMatch = STATIC_NPS.find(f => f.productName === rec.productName);

    if (liveMatch) {
      return { ...rec, fundHouse: liveMatch.fundHouse, navDate: liveMatch.navDate };
    }
    if (ins80DMatch) {
      return { ...rec, premiumPerYear: ins80DMatch.premiumPerYear, features: ins80DMatch.features, claimRatio: ins80DMatch.claimRatio };
    }
    if (npsMatch) {
      return { ...rec, features: npsMatch.features, expectedCagr: npsMatch.expectedCagr, aum: npsMatch.aum };
    }
    return rec;
  });

  return {
    recommendations: enriched,
    meta: {
      gap80C,
      gap80D,
      gapNPS,
      riskProfile: taxData.riskProfile || deriveRiskProfile(taxData),
      totalELSSFetched: elssData.length,
    },
  };
}

module.exports = { getMarketplaceRecommendations };
