import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, FileText, Building, CheckCircle } from 'lucide-react';

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const firstInputRef = useRef(null);
  const [formData, setFormData] = useState({
    legalName: '', dba: '', contactPerson: '', quarter: '', year: null, isAmendment: false, services: [],
    checkCashingData: { month1: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month2: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month3: {instruments:'',faceAmount:'',fees:'',verificationFees:''} },
    deferredPresentmentData: { month1: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month2: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month3: {transactions:'',amount:'',serviceFees:'',verificationFees:''} }
  });

  const quarterMonths = { 'Q1': 'January through March', 'Q2': 'April through June', 'Q3': 'July through September', 'Q4': 'October through December' };
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleNestedInputChange = (section, month, field, value) => setFormData(prev => ({ ...prev, [section]: { ...prev[section], [month]: { ...prev[section][month], [field]: value } } }));
  const getServicesDisplayText = () => formData.services.map(s => s === 'checkCashing' ? 'Check Cashing' : 'Deferred Presentment (Payday Loans)').join(', ');
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 15));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Auto-focus first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Simple form rendering function
  const renderField = (label, value, onChange, type = "text", placeholder = "", isFirst = false) => (
    <div><label className="block text-sm font-medium text-gray-700 mb-2">{label}</label><input ref={isFirst ? firstInputRef : null} type={type} value={value} onChange={onChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={placeholder} step={type === "number" ? "0.01" : undefined} min={type === "number" ? "0" : undefined} /></div>
  );

  const renderButtons = (disabled = false) => (
    <div className="flex space-x-4">
      <button onClick={prevStep} className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300">Back</button>
      <button onClick={nextStep} disabled={disabled} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center">Continue <ChevronRight className="w-5 h-5 ml-2" /></button>
    </div>
  );

  // Data entry month renderer
  const renderDataMonth = (type, monthNum) => {
    const isCheckCashing = type === 'check';
    const section = isCheckCashing ? 'checkCashingData' : 'deferredPresentmentData';
    const monthKey = `month${monthNum}`;
    const data = formData[section][monthKey];
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">{isCheckCashing ? 'Check Cashing' : 'Deferred Presentment'} Data - Month {monthNum}</h2>
        <p className="text-gray-600">Enter data for month {monthNum} of {quarterMonths[formData.quarter]}.</p>
        <div className="space-y-4">
          {isCheckCashing ? (
            <>
              {renderField("Number of Instruments Cashed", data.instruments, (e) => handleNestedInputChange(section, monthKey, 'instruments', e.target.value), "number", "0", true)}
              {renderField("Face Amount of Instruments ($)", data.faceAmount, (e) => handleNestedInputChange(section, monthKey, 'faceAmount', e.target.value), "number", "0.00")}
              {renderField("Check Cashing Fees Collected ($)", data.fees, (e) => handleNestedInputChange(section, monthKey, 'fees', e.target.value), "number", "0.00")}
              {renderField("Verification Fees Collected ($)", data.verificationFees, (e) => handleNestedInputChange(section, monthKey, 'verificationFees', e.target.value), "number", "0.00")}
            </>
          ) : (
            <>
              {renderField("Number of Transactions", data.transactions, (e) => handleNestedInputChange(section, monthKey, 'transactions', e.target.value), "number", "0", true)}
              {renderField("Dollar Amount of Transactions ($)", data.amount, (e) => handleNestedInputChange(section, monthKey, 'amount', e.target.value), "number", "0.00")}
              {renderField("Service Fees Collected ($)", data.serviceFees, (e) => handleNestedInputChange(section, monthKey, 'serviceFees', e.target.value), "number", "0.00")}
              {renderField("Verification Fees Collected ($)", data.verificationFees, (e) => handleNestedInputChange(section, monthKey, 'verificationFees', e.target.value), "number", "0.00")}
            </>
          )}
        </div>
        {renderButtons()}
      </div>
    );
  };

  const renderStep = () => {
    // Step 1: Welcome
    if (currentStep === 1) return (
      <div className="space-y-6">
        <div className="text-center">
          <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Florida MSB Quarterly Reporting</h2>
          <p className="text-gray-600">Let's collect your quarterly report information step by step.</p>
        </div>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center">Get Started <ChevronRight className="w-5 h-5 ml-2" /></button>
      </div>
    );

    // Step 2: Company Info
    if (currentStep === 2) return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
        <div className="space-y-4">
          {renderField("Legal Company Name", formData.legalName, (e) => handleInputChange('legalName', e.target.value), "text", "Enter your company's legal name", true)}
          {renderField("DBA (Doing Business As)", formData.dba, (e) => handleInputChange('dba', e.target.value), "text", "Enter DBA name (optional)")}
        </div>
        {renderButtons(!formData.legalName)}
      </div>
    );

    // Step 3: Contact Person
    if (currentStep === 3) return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Contact Person</h2>
        <div className="space-y-4">
          {renderField("Contact Person Name", formData.contactPerson, (e) => handleInputChange('contactPerson', e.target.value), "text", "Enter contact person name", true)}
        </div>
        {renderButtons(!formData.contactPerson)}
      </div>
    );

    // Step 4: Quarter Selection
    if (currentStep === 4) {
      const today = new Date(), currentYear = today.getFullYear(), availableYears = [];
      for (let year = currentYear; year >= currentYear - 3; year--) availableYears.push(year);
      
      const getQuarterStatus = (quarter, year) => {
        if (!quarter || !year) return 'none';
        const quarterEndDates = { 'Q1': new Date(year, 2, 31), 'Q2': new Date(year, 5, 30), 'Q3': new Date(year, 8, 30), 'Q4': new Date(year, 11, 31) };
        const quarterEnd = quarterEndDates[quarter], deadlineDate = new Date(quarterEnd.getTime() + (45 * 24 * 60 * 60 * 1000));
        return today < quarterEnd ? 'future' : today <= deadlineDate ? 'current' : 'late';
      };

      const getStatusMessage = (quarter, year) => {
        const status = getQuarterStatus(quarter, year);
        return status === 'future' ? 'This quarter is not complete yet - cannot file' : status === 'late' || year < currentYear ? 'This is a late filing - fines may apply' : status === 'current' ? 'Ready to file on time' : '';
      };

      const canProceed = formData.quarter && formData.year && getQuarterStatus(formData.quarter, formData.year) !== 'future';

      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Which Quarter Are You Reporting?</h2>
          <p className="text-gray-600">Select the quarter and year you need to report.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
              <select ref={firstInputRef} value={formData.quarter} onChange={(e) => handleInputChange('quarter', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Quarter</option>
                <option value="Q1">Q1 (January - March)</option>
                <option value="Q2">Q2 (April - June)</option>
                <option value="Q3">Q3 (July - September)</option>
                <option value="Q4">Q4 (October - December)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select value={formData.year || ''} onChange={(e) => handleInputChange('year', parseInt(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select Year</option>
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          {formData.quarter && formData.year && (
            <div className={`p-4 rounded-lg border ${getQuarterStatus(formData.quarter, formData.year) === 'future' ? 'bg-red-50 border-red-200' : getQuarterStatus(formData.quarter, formData.year) === 'late' || formData.year < currentYear ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className="font-semibold mb-2">Selection: {formData.quarter} {formData.year}</h3>
              <p className="text-sm mb-2">This covers: <strong>{quarterMonths[formData.quarter]}, {formData.year}</strong></p>
              <p className={`text-sm font-medium ${getQuarterStatus(formData.quarter, formData.year) === 'future' ? 'text-red-700' : getQuarterStatus(formData.quarter, formData.year) === 'late' || formData.year < currentYear ? 'text-yellow-700' : 'text-green-700'}`}>{getStatusMessage(formData.quarter, formData.year)}</p>
            </div>
          )}
          {canProceed && (
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={formData.isAmendment} onChange={(e) => handleInputChange('isAmendment', e.target.checked)} className="w-4 h-4 text-blue-600 mr-3" />
                <div><div className="font-medium">This is an amendment</div><div className="text-sm text-gray-600">Check this box if you're correcting a previously filed report</div></div>
              </label>
            </div>
          )}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Filing Information:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Reports must be filed within 45 days after the quarter ends</li>
              <li>• Late reports may result in fines but must still be filed</li>
              <li>• Amendments can be filed anytime to correct previous reports</li>
              <li>• You need complete 3-month data to file accurately</li>
            </ul>
          </div>
          <div className="flex space-x-4">
            <button onClick={prevStep} className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300">Back</button>
            <button onClick={nextStep} disabled={!canProceed} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center">Continue <ChevronRight className="w-5 h-5 ml-2" /></button>
          </div>
        </div>
      );
    }

    // Step 5: Services
    if (currentStep === 5) return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Services Offered</h2>
        <p className="text-gray-600">What MSB activities did you engage in this quarter?</p>
        <div className="space-y-4">
          {[{id: 'checkCashing', label: 'Check Cashing'}, {id: 'deferredPresentment', label: 'Deferred Presentment (Payday Loans)'}].map(service => (
            <label key={service.id} className="flex items-center p-4 border-2 rounded-lg cursor-pointer">
              <input type="checkbox" checked={formData.services.includes(service.id)} onChange={(e) => handleInputChange('services', e.target.checked ? [...formData.services, service.id] : formData.services.filter(s => s !== service.id))} className="w-5 h-5 text-blue-600" />
              <span className="ml-3 font-medium">{service.label}</span>
            </label>
          ))}
        </div>
        {renderButtons(formData.services.length === 0)}
      </div>
    );

    // Steps 6-11: Data Entry (Check Cashing months 1-3, Deferred Presentment months 1-3)
    if (currentStep >= 6 && currentStep <= 8 && formData.services.includes('checkCashing')) return renderDataMonth('check', currentStep - 5);
    if (currentStep >= 6 && currentStep <= 8 && !formData.services.includes('checkCashing')) { nextStep(); return null; }
    if (currentStep >= 9 && currentStep <= 11 && formData.services.includes('deferredPresentment')) return renderDataMonth('deferred', currentStep - 8);
    if (currentStep >= 9 && currentStep <= 11 && !formData.services.includes('deferredPresentment')) { nextStep(); return null; }

    // Step 12: Final Summary with Submission
    if (currentStep === 12) {
      const handleSubmission = async () => {
        const report = {
          companyInfo: { legalName: formData.legalName, dba: formData.dba, contactPerson: formData.contactPerson },
          reportDetails: { quarter: formData.quarter, year: formData.year, period: quarterMonths[formData.quarter], isAmendment: formData.isAmendment, filingType: formData.isAmendment ? 'Amendment' : 'Original Filing' },
          services: formData.services,
          checkCashingData: formData.services.includes('checkCashing') ? formData.checkCashingData : null,
          deferredPresentmentData: formData.services.includes('deferredPresentment') ? formData.deferredPresentmentData : null,
          submissionTimestamp: new Date().toISOString(),
          status: 'Submitted - Awaiting ComplyCheck Processing'
        };

        // Show loading state
        setSubmissionComplete('loading');

        try {
          console.log('Submitting to serverless function...');
          
          // Send to our API endpoint - CORRECTED PATH
          const response = await fetch('/api2/submit-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              company_name: formData.legalName,
              dba_name: formData.dba || 'None',
              contact_person: formData.contactPerson,
              quarter: formData.quarter,
              year: formData.year,
              filing_type: formData.isAmendment ? 'Amendment' : 'Original Filing',
              services: getServicesDisplayText(),
              submission_date: new Date().toLocaleDateString(),
              submission_time: new Date().toLocaleTimeString(),
              email_subject: `MSB Quarterly Report - ${formData.legalName} - ${formData.quarter} ${formData.year}${formData.isAmendment ? ' (AMENDMENT)' : ''}`,
              report_data: report
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Submission successful:', result);
            setSubmissionComplete('success');
          } else {
            throw new Error(`Server error: ${response.status}`);
          }

        } catch (error) {
          console.error('Submission error:', error);
          setSubmissionComplete('error');
        }
        
        // Always download backup copy
        console.log('Downloading backup file...');
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MSB_Report_${formData.quarter}_${formData.year}_${formData.legalName.replace(/\s+/g, '_')}${formData.isAmendment ? '_AMENDMENT' : ''}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Backup file downloaded');
      };

      // Calculate totals for review
      const calculateTotals = (data, fields) => {
        return fields.reduce((acc, field) => {
          acc[field] = Object.values(data).reduce((sum, month) => {
            const value = parseFloat(month[field]) || 0;
            return sum + value;
          }, 0);
          return acc;
        }, {});
      };

      const checkCashingTotals = formData.services.includes('checkCashing') 
        ? calculateTotals(formData.checkCashingData, ['instruments', 'faceAmount', 'fees', 'verificationFees'])
        : null;

      const deferredTotals = formData.services.includes('deferredPresentment')
        ? calculateTotals(formData.deferredPresentmentData, ['transactions', 'amount', 'serviceFees', 'verificationFees'])
        : null;

      if (submissionComplete === 'loading') {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Submitting Your Report...</h2>
              <p className="text-gray-600">Please wait while we process your submission to ComplyCheck.</p>
            </div>
          </div>
        );
      }

      if (submissionComplete === 'success') {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Successful!</h2>
              <p className="text-gray-600">Your report has been submitted to ComplyCheck and a backup copy downloaded.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ What Just Happened:</h3>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• Your report was automatically sent to ComplyCheck</li>
                <li>• ComplyCheck has been notified via email</li>
                <li>• Your data has been processed successfully</li>
                <li>• A backup copy was downloaded to your device</li>
                <li>• Processing will begin within 1 business day</li>
              </ul>
            </div>
            <button onClick={() => { setCurrentStep(1); setSubmissionComplete(false); setFormData({legalName: '', dba: '', contactPerson: '', quarter: '', year: null, isAmendment: false, services: [], checkCashingData: { month1: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month2: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month3: {instruments:'',faceAmount:'',fees:'',verificationFees:''} }, deferredPresentmentData: { month1: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month2: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month3: {transactions:'',amount:'',serviceFees:'',verificationFees:''} }}); }} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">Start New Report</button>
          </div>
        );
      }

      if (submissionComplete === 'error') {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Issue</h2>
              <p className="text-gray-600">There was an issue with automatic submission, but your backup file was downloaded.</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">📧 Manual Process Required:</h3>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Your report file was downloaded to your device</li>
                <li>• Please email the file to: <strong>phil@complycheck.co, luis@complycheck.co</strong></li>
                <li>• Include "MSB Quarterly Report" in the subject line</li>
                <li>• ComplyCheck will process your report manually</li>
              </ul>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => setSubmissionComplete(false)} className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600">Try Again</button>
              <button onClick={() => { setCurrentStep(1); setSubmissionComplete(false); setFormData({legalName: '', dba: '', contactPerson: '', quarter: '', year: null, isAmendment: false, services: [], checkCashingData: { month1: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month2: {instruments:'',faceAmount:'',fees:'',verificationFees:''}, month3: {instruments:'',faceAmount:'',fees:'',verificationFees:''} }, deferredPresentmentData: { month1: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month2: {transactions:'',amount:'',serviceFees:'',verificationFees:''}, month3: {transactions:'',amount:'',serviceFees:'',verificationFees:''} }}); }} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">Start New Report</button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Report</h2>
            <p className="text-gray-600">Please review all information before submitting to ComplyCheck.</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-4">Company Information:</h3>
            <div className="text-sm space-y-1">
              <div><strong>Company:</strong> {formData.legalName}</div>
              {formData.dba && <div><strong>DBA:</strong> {formData.dba}</div>}
              <div><strong>Contact:</strong> {formData.contactPerson}</div>
              <div><strong>Quarter:</strong> {formData.quarter} {formData.year} {formData.isAmendment ? '(AMENDMENT)' : ''}</div>
              <div><strong>Reporting Period:</strong> {quarterMonths[formData.quarter]}, {formData.year}</div>
              <div><strong>Services:</strong> {getServicesDisplayText()}</div>
            </div>
          </div>

          {/* Check Cashing Data Review */}
          {formData.services.includes('checkCashing') && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-4">Check Cashing Data ({formData.quarter} {formData.year}):</h3>
              <div className="space-y-4">
                {['month1', 'month2', 'month3'].map((month, index) => {
                  const data = formData.checkCashingData[month];
                  const hasData = data.instruments || data.faceAmount || data.fees || data.verificationFees;
                  
                  return (
                    <div key={month} className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-blue-700 mb-2">Month {index + 1}:</h4>
                      {hasData ? (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><strong>Instruments Cashed:</strong> {data.instruments || '0'}</div>
                          <div><strong>Face Amount:</strong> ${parseFloat(data.faceAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                          <div><strong>Cashing Fees:</strong> ${parseFloat(data.fees || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                          <div><strong>Verification Fees:</strong> ${parseFloat(data.verificationFees || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No data entered for this month</div>
                      )}
                    </div>
                  );
                })}
                
                {checkCashingTotals && (
                  <div className="bg-blue-100 p-4 rounded border-2 border-blue-300">
                    <h4 className="font-semibold text-blue-800 mb-2">Quarter Totals:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Total Instruments:</strong> {checkCashingTotals.instruments.toLocaleString()}</div>
                      <div><strong>Total Face Amount:</strong> ${checkCashingTotals.faceAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      <div><strong>Total Cashing Fees:</strong> ${checkCashingTotals.fees.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      <div><strong>Total Verification Fees:</strong> ${checkCashingTotals.verificationFees.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deferred Presentment Data Review */}
          {formData.services.includes('deferredPresentment') && (
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-4">Deferred Presentment Data ({formData.quarter} {formData.year}):</h3>
              <div className="space-y-4">
                {['month1', 'month2', 'month3'].map((month, index) => {
                  const data = formData.deferredPresentmentData[month];
                  const hasData = data.transactions || data.amount || data.serviceFees || data.verificationFees;
                  
                  return (
                    <div key={month} className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-purple-700 mb-2">Month {index + 1}:</h4>
                      {hasData ? (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><strong>Transactions:</strong> {data.transactions || '0'}</div>
                          <div><strong>Transaction Amount:</strong> ${parseFloat(data.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                          <div><strong>Service Fees:</strong> ${parseFloat(data.serviceFees || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                          <div><strong>Verification Fees:</strong> ${parseFloat(data.verificationFees || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No data entered for this month</div>
                      )}
                    </div>
                  );
                })}
                
                {deferredTotals && (
                  <div className="bg-purple-100 p-4 rounded border-2 border-purple-300">
                    <h4 className="font-semibold text-purple-800 mb-2">Quarter Totals:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Total Transactions:</strong> {deferredTotals.transactions.toLocaleString()}</div>
                      <div><strong>Total Amount:</strong> ${deferredTotals.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      <div><strong>Total Service Fees:</strong> ${deferredTotals.serviceFees.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      <div><strong>Total Verification Fees:</strong> ${deferredTotals.verificationFees.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Before You Submit:</h4>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Verify all data is accurate for the entire quarter</li>
              <li>• Ensure you have supporting documentation</li>
              <li>• Remember that false information may result in penalties</li>
              <li>• A copy of your report will be downloaded for your records</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button onClick={() => setCurrentStep(2)} className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600">Make Changes</button>
            <button onClick={handleSubmission} className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center">
              <FileText className="w-5 h-5 mr-2" />Submit to ComplyCheck
            </button>
          </div>
        </div>
      );
    }

    return <div>Step {currentStep} not found</div>;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Florida MSB Quarterly Reporting</h1>
          <div className="text-sm text-gray-500">Step {currentStep} of 12</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 12) * 100}%` }}></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8">{renderStep()}</div>
    </div>
  );
};

export default App;
