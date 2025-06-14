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

// Format email content with clean tables
    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(num);
    };

    const formatNumber = (num) => {
      return (parseInt(num) || 0).toLocaleString();
    };

    let emailContent = `
FLORIDA MSB QUARTERLY REPORT SUBMISSION
========================================

COMPANY INFORMATION:
-------------------
Legal Name:     ${company_name}
DBA:           ${dba_name}
Contact:       ${contact_person}
Quarter:       ${quarter} ${year} (${report_data.reportDetails.period})
Filing Type:   ${filing_type}
Services:      ${services}
Submitted:     ${submission_date} at ${submission_time}

`;

    // Add Check Cashing table if present
    if (report_data.checkCashingData) {
      const checkData = report_data.checkCashingData;
      
      // Calculate totals
      const totalInstruments = formatNumber(
        (parseInt(checkData.month1.instruments) || 0) + 
        (parseInt(checkData.month2.instruments) || 0) + 
        (parseInt(checkData.month3.instruments) || 0)
      );
      
      const totalFaceAmount = formatCurrency(
        (parseFloat(checkData.month1.faceAmount) || 0) + 
        (parseFloat(checkData.month2.faceAmount) || 0) + 
        (parseFloat(checkData.month3.faceAmount) || 0)
      );
      
      const totalFees = formatCurrency(
        (parseFloat(checkData.month1.fees) || 0) + 
        (parseFloat(checkData.month2.fees) || 0) + 
        (parseFloat(checkData.month3.fees) || 0)
      );
      
      const totalVerifyFees = formatCurrency(
        (parseFloat(checkData.month1.verificationFees) || 0) + 
        (parseFloat(checkData.month2.verificationFees) || 0) + 
        (parseFloat(checkData.month3.verificationFees) || 0)
      );

      emailContent += `
CHECK CASHING ACTIVITY:
======================

| Metric              | Month 1      | Month 2      | Month 3      | Quarter Total |
|---------------------|--------------|--------------|--------------|---------------|
| Instruments Cashed  | ${formatNumber(checkData.month1.instruments).padEnd(12)} | ${formatNumber(checkData.month2.instruments).padEnd(12)} | ${formatNumber(checkData.month3.instruments).padEnd(12)} | ${totalInstruments.padEnd(13)} |
| Face Amount         | ${formatCurrency(checkData.month1.faceAmount).padEnd(12)} | ${formatCurrency(checkData.month2.faceAmount).padEnd(12)} | ${formatCurrency(checkData.month3.faceAmount).padEnd(12)} | ${totalFaceAmount.padEnd(13)} |
| Cashing Fees        | ${formatCurrency(checkData.month1.fees).padEnd(12)} | ${formatCurrency(checkData.month2.fees).padEnd(12)} | ${formatCurrency(checkData.month3.fees).padEnd(12)} | ${totalFees.padEnd(13)} |
| Verification Fees   | ${formatCurrency(checkData.month1.verificationFees).padEnd(12)} | ${formatCurrency(checkData.month2.verificationFees).padEnd(12)} | ${formatCurrency(checkData.month3.verificationFees).padEnd(12)} | ${totalVerifyFees.padEnd(13)} |

`;
    }

    // Add Deferred Presentment table if present
    if (report_data.deferredPresentmentData) {
      const deferredData = report_data.deferredPresentmentData;
      
      // Calculate totals
      const totalTransactions = formatNumber(
        (parseInt(deferredData.month1.transactions) || 0) + 
        (parseInt(deferredData.month2.transactions) || 0) + 
        (parseInt(deferredData.month3.transactions) || 0)
      );
      
      const totalAmount = formatCurrency(
        (parseFloat(deferredData.month1.amount) || 0) + 
        (parseFloat(deferredData.month2.amount) || 0) + 
        (parseFloat(deferredData.month3.amount) || 0)
      );
      
      const totalServiceFees = formatCurrency(
        (parseFloat(deferredData.month1.serviceFees) || 0) + 
        (parseFloat(deferredData.month2.serviceFees) || 0) + 
        (parseFloat(deferredData.month3.serviceFees) || 0)
      );
      
      const totalVerifyFees = formatCurrency(
        (parseFloat(deferredData.month1.verificationFees) || 0) + 
        (parseFloat(deferredData.month2.verificationFees) || 0) + 
        (parseFloat(deferredData.month3.verificationFees) || 0)
      );

      emailContent += `
DEFERRED PRESENTMENT (PAYDAY LOANS) ACTIVITY:
============================================

| Metric              | Month 1      | Month 2      | Month 3      | Quarter Total |
|---------------------|--------------|--------------|--------------|---------------|
| Transactions        | ${formatNumber(deferredData.month1.transactions).padEnd(12)} | ${formatNumber(deferredData.month2.transactions).padEnd(12)} | ${formatNumber(deferredData.month3.transactions).padEnd(12)} | ${totalTransactions.padEnd(13)} |
| Transaction Amount  | ${formatCurrency(deferredData.month1.amount).padEnd(12)} | ${formatCurrency(deferredData.month2.amount).padEnd(12)} | ${formatCurrency(deferredData.month3.amount).padEnd(12)} | ${totalAmount.padEnd(13)} |
| Service Fees        | ${formatCurrency(deferredData.month1.serviceFees).padEnd(12)} | ${formatCurrency(deferredData.month2.serviceFees).padEnd(12)} | ${formatCurrency(deferredData.month3.serviceFees).padEnd(12)} | ${totalServiceFees.padEnd(13)} |
| Verification Fees   | ${formatCurrency(deferredData.month1.verificationFees).padEnd(12)} | ${formatCurrency(deferredData.month2.verificationFees).padEnd(12)} | ${formatCurrency(deferredData.month3.verificationFees).padEnd(12)} | ${totalVerifyFees.padEnd(13)} |

`;
    }

    emailContent += `
SUBMISSION DETAILS:
==================
Submission ID:   ${report_data.submissionTimestamp}
Status:          ${report_data.status}
Amendment:       ${report_data.reportDetails.isAmendment ? 'YES - This is an amended report' : 'NO - Original filing'}

========================================
This report was automatically submitted via the ComplyCheck MSB Quarterly Reporting Tool.
For questions about this submission, contact ${contact_person}.
========================================
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

