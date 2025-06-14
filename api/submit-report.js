import nodemailer from 'nodemailer';

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
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Format email content
    const emailContent = `
MSB QUARTERLY REPORT SUBMISSION

Company: ${company_name}
DBA: ${dba_name || 'None'}
Contact Person: ${contact_person}
Quarter: ${quarter} ${year}
Filing Type: ${filing_type}
Services: ${services}
Submitted: ${submission_date} at ${submission_time}

=== DETAILED REPORT DATA ===
${JSON.stringify(report_data, null, 2)}

---
This report was automatically submitted via the ComplyCheck MSB Quarterly Reporting Tool.
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

