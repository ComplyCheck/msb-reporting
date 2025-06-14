import nodemailer from 'nodemailer';
// MSB Report Email Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      company_name,
      dba_name,
      contact_person,
      quarter,
      year,
      filing_type,
      services,
      submission_date,
      submission_time,
      email_subject,
      report_data
    } = req.body;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

// Format email content with better structure
    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(num);
    };

    const formatNumber = (num) => {
      return parseInt(num) || 0;
    };

    let emailContent = `
═══════════════════════════════════════════════════════════
              FLORIDA MSB QUARTERLY REPORT SUBMISSION
═══════════════════════════════════════════════════════════

📋 COMPANY INFORMATION
────────────────────────────────────────────────────────────
Legal Name:     ${company_name}
DBA:           ${dba_name}
Contact:       ${contact_person}
Quarter:       ${quarter} ${year} (${report_data.reportDetails.period})
Filing Type:   ${filing_type}
Services:      ${services}
Submitted:     ${submission_date} at ${submission_time}

═══════════════════════════════════════════════════════════
                      QUARTERLY DATA SUMMARY
═══════════════════════════════════════════════════════════
`;

    // Add Check Cashing data if present
    if (report_data.checkCashingData) {
      const checkData = report_data.checkCashingData;
      
      emailContent += `
💰 CHECK CASHING ACTIVITY
────────────────────────────────────────────────────────────
                    Month 1    Month 2    Month 3    TOTAL
────────────────────────────────────────────────────────────
Instruments:    ${formatNumber(checkData.month1.instruments).toString().padStart(8)} ${formatNumber(checkData.month2.instruments).toString().padStart(10)} ${formatNumber(checkData.month3.instruments).toString().padStart(10)} ${(formatNumber(checkData.month1.instruments) + formatNumber(checkData.month2.instruments) + formatNumber(checkData.month3.instruments)).toString().padStart(8)}

Face Amount:    ${formatCurrency(checkData.month1.faceAmount).padStart(8)} ${formatCurrency(checkData.month2.faceAmount).padStart(10)} ${formatCurrency(checkData.month3.faceAmount).padStart(10)} ${formatCurrency(parseFloat(checkData.month1.faceAmount || 0) + parseFloat(checkData.month2.faceAmount || 0) + parseFloat(checkData.month3.faceAmount || 0)).padStart(8)}

Cashing Fees:   ${formatCurrency(checkData.month1.fees).padStart(8)} ${formatCurrency(checkData.month2.fees).padStart(10)} ${formatCurrency(checkData.month3.fees).padStart(10)} ${formatCurrency(parseFloat(checkData.month1.fees || 0) + parseFloat(checkData.month2.fees || 0) + parseFloat(checkData.month3.fees || 0)).padStart(8)}

Verify Fees:    ${formatCurrency(checkData.month1.verificationFees).padStart(8)} ${formatCurrency(checkData.month2.verificationFees).padStart(10)} ${formatCurrency(checkData.month3.verificationFees).padStart(10)} ${formatCurrency(parseFloat(checkData.month1.verificationFees || 0) + parseFloat(checkData.month2.verificationFees || 0) + parseFloat(checkData.month3.verificationFees || 0)).padStart(8)}
────────────────────────────────────────────────────────────
`;
    }

    // Add Deferred Presentment data if present
    if (report_data.deferredPresentmentData) {
      const deferredData = report_data.deferredPresentmentData;
      
      emailContent += `
💳 DEFERRED PRESENTMENT (PAYDAY LOANS) ACTIVITY
────────────────────────────────────────────────────────────
                    Month 1    Month 2    Month 3    TOTAL
────────────────────────────────────────────────────────────
Transactions:   ${formatNumber(deferredData.month1.transactions).toString().padStart(8)} ${formatNumber(deferredData.month2.transactions).toString().padStart(10)} ${formatNumber(deferredData.month3.transactions).toString().padStart(10)} ${(formatNumber(deferredData.month1.transactions) + formatNumber(deferredData.month2.transactions) + formatNumber(deferredData.month3.transactions)).toString().padStart(8)}

Transaction $:  ${formatCurrency(deferredData.month1.amount).padStart(8)} ${formatCurrency(deferredData.month2.amount).padStart(10)} ${formatCurrency(deferredData.month3.amount).padStart(10)} ${formatCurrency(parseFloat(deferredData.month1.amount || 0) + parseFloat(deferredData.month2.amount || 0) + parseFloat(deferredData.month3.amount || 0)).padStart(8)}

Service Fees:   ${formatCurrency(deferredData.month1.serviceFees).padStart(8)} ${formatCurrency(deferredData.month2.serviceFees).padStart(10)} ${formatCurrency(deferredData.month3.serviceFees).padStart(10)} ${formatCurrency(parseFloat(deferredData.month1.serviceFees || 0) + parseFloat(deferredData.month2.serviceFees || 0) + parseFloat(deferredData.month3.serviceFees || 0)).padStart(8)}

Verify Fees:    ${formatCurrency(deferredData.month1.verificationFees).padStart(8)} ${formatCurrency(deferredData.month2.verificationFees).padStart(10)} ${formatCurrency(deferredData.month3.verificationFees).padStart(10)} ${formatCurrency(parseFloat(deferredData.month1.verificationFees || 0) + parseFloat(deferredData.month2.verificationFees || 0) + parseFloat(deferredData.month3.verificationFees || 0)).padStart(8)}
────────────────────────────────────────────────────────────
`;
    }

    emailContent += `
═══════════════════════════════════════════════════════════
                        SUBMISSION DETAILS
═══════════════════════════════════════════════════════════
Submission ID:   ${report_data.submissionTimestamp}
Status:          ${report_data.status}
Amendment:       ${report_data.reportDetails.isAmendment ? 'YES - This is an amended report' : 'NO - Original filing'}

═══════════════════════════════════════════════════════════
This report was automatically submitted via the ComplyCheck 
MSB Quarterly Reporting Tool at ${submission_date} ${submission_time}.

For questions about this submission, contact ${contact_person}.
═══════════════════════════════════════════════════════════
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'phil@complycheck.co,luis@complycheck.co',
      subject: email_subject,
      text: emailContent
    });

    res.status(200).json({ 
      success: true, 
      message: 'Report submitted successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email' 
    });
  }
}

