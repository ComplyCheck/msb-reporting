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

// Format email content - clean and simple
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
=====================================

COMPANY INFORMATION:
Legal Name:     ${company_name}
DBA:           ${dba_name}
Contact:       ${contact_person}
Quarter:       ${quarter} ${year} (${report_data.reportDetails.period})
Filing Type:   ${filing_type}
Services:      ${services}
Submitted:     ${submission_date} at ${submission_time}

`;

    // Add Check Cashing data if present
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

INSTRUMENTS CASHED:
  Month 1: ${formatNumber(checkData.month1.instruments)}
  Month 2: ${formatNumber(checkData.month2.instruments)}
  Month 3: ${formatNumber(checkData.month3.instruments)}
  QUARTER TOTAL: ${totalInstruments}

FACE AMOUNT OF INSTRUMENTS:
  Month 1: ${formatCurrency(checkData.month1.faceAmount)}
  Month 2: ${formatCurrency(checkData.month2.faceAmount)}
  Month 3: ${formatCurrency(checkData.month3.faceAmount)}
  QUARTER TOTAL: ${totalFaceAmount}

CHECK CASHING FEES COLLECTED:
  Month 1: ${formatCurrency(checkData.month1.fees)}
  Month 2: ${formatCurrency(checkData.month2.fees)}
  Month 3: ${formatCurrency(checkData.month3.fees)}
  QUARTER TOTAL: ${totalFees}

VERIFICATION FEES COLLECTED:
  Month 1: ${formatCurrency(checkData.month1.verificationFees)}
  Month 2: ${formatCurrency(checkData.month2.verificationFees)}
  Month 3: ${formatCurrency(checkData.month3.verificationFees)}
  QUARTER TOTAL: ${totalVerifyFees}

`;
    }

    // Add Deferred Presentment data if present
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

NUMBER OF TRANSACTIONS:
  Month 1: ${formatNumber(deferredData.month1.transactions)}
  Month 2: ${formatNumber(deferredData.month2.transactions)}
  Month 3: ${formatNumber(deferredData.month3.transactions)}
  QUARTER TOTAL: ${totalTransactions}

DOLLAR AMOUNT OF TRANSACTIONS:
  Month 1: ${formatCurrency(deferredData.month1.amount)}
  Month 2: ${formatCurrency(deferredData.month2.amount)}
  Month 3: ${formatCurrency(deferredData.month3.amount)}
  QUARTER TOTAL: ${totalAmount}

SERVICE FEES COLLECTED:
  Month 1: ${formatCurrency(deferredData.month1.serviceFees)}
  Month 2: ${formatCurrency(deferredData.month2.serviceFees)}
  Month 3: ${formatCurrency(deferredData.month3.serviceFees)}
  QUARTER TOTAL: ${totalServiceFees}

VERIFICATION FEES COLLECTED:
  Month 1: ${formatCurrency(deferredData.month1.verificationFees)}
  Month 2: ${formatCurrency(deferredData.month2.verificationFees)}
  Month 3: ${formatCurrency(deferredData.month3.verificationFees)}
  QUARTER TOTAL: ${totalVerifyFees}

`;
    }

    emailContent += `
SUBMISSION DETAILS:
==================
Submission ID:   ${report_data.submissionTimestamp}
Status:          ${report_data.status}
Amendment:       ${report_data.reportDetails.isAmendment ? 'YES - This is an amended report' : 'NO - Original filing'}

=====================================
This report was automatically submitted via the ComplyCheck MSB Quarterly Reporting Tool.
For questions about this submission, contact ${contact_person}.
=====================================
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

