import React, { createContext, useContext, useState, useCallback } from 'react';

const TaxContext = createContext();

export const useTax = () => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};

export const TaxProvider = ({ children }) => {
  const [inputData, setInputData] = useState({
    income: 1200000,
    investments: 0,
    insurance: 0,
    nps: 0,
    hra: 0,
    homeLoan: 0,
    isSenior: false,
    activeRegime: 'NEW',
    profTax: 0,
    cityCategory: 'metro'
  });

  const updateInputs = useCallback((newData) => {
    setInputData((prev) => ({ ...prev, ...newData }));
  }, []);

  const applyExtractedData = useCallback((extracted) => {
    if (!extracted) return;
    
    // Map AI extraction keys to the centralized tax state
    const mappedData = {
      income:      extracted.grossSalary || 0,
      investments: (extracted.investments80C || 0) + (extracted.employeePF || 0),
      insurance:   extracted.healthInsurance80D || 0,
      nps:         extracted.nps80CCD || 0,
      hra:         extracted.hra || 0,
      homeLoan:    extracted.homeLoanInterest || 0,
      profTax:     extracted.professionalTax || 0,
      cityCategory: extracted.cityCategory || 'metro'
    };

    setInputData((prev) => ({
      ...prev,
      ...mappedData
    }));
    
    console.log('Automated Data Sync: Extracted values populated into Tax Optimiser.');
  }, []);

  return (
    <TaxContext.Provider value={{ inputData, setInputData, updateInputs, applyExtractedData }}>
      {children}
    </TaxContext.Provider>
  );
};
