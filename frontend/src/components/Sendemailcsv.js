// Sendemailcsv.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import EmailPreviewer from './EmailPreviewer';
import Papa from 'papaparse';

const Sendemailcsv = () => {
  const [formData, setFormData] = useState({
    senderEmail: '',
    senderPassword: '',
  });

  const location = useLocation();
  const emailDesign = location.state?.emailDesign || {};
  const csvFile = emailDesign.csvFile;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse the CSV file to get email addresses and replace placeholders
    Papa.parse(csvFile, {
      complete: async (results) => {
        const rows = results.data;

        // Ensure each row has an email column
        rows.forEach(async (row) => {
          const receiverEmail = row.email || row.Email; // Look for 'email' or 'Email' keys

          if (receiverEmail) {
            // Function to replace placeholders and remove styles for replaced text
            const replacePlaceholders = (body, rowData) => {
              // Create a temporary container to manipulate the email body HTML
              const tempContainer = document.createElement('div');
              tempContainer.innerHTML = body;

              // Replace placeholders and remove styles
              Array.from(tempContainer.querySelectorAll('span.block-element')).forEach((block) => {
                const columnName = block.textContent.replace(/\{|\}/g, ''); // Extract the column name from {columnName}
                const replacementValue = rowData[columnName] || `{${columnName}}`;

                // Create a plain text node to replace the block
                const textNode = document.createTextNode(replacementValue);

                // Replace the block with the plain text
                block.replaceWith(textNode);
              });

              // Return the modified email body without inline styles
              return tempContainer.innerHTML;
            };

            // Replace placeholders in the email body
            const formattedEmailBody = replacePlaceholders(emailDesign.emailBody, row);

            const emailData = {
              ...formData,
              ...emailDesign,
              emailBody: formattedEmailBody, // Send the formatted email body
              receiverEmail,
              receiverName: row.name || row.Name, // Add receiverName from CSV
            };

            try {
              const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
              });

              const data = await response.json();
              console.log(`Email sent to ${receiverEmail}:`, data.message);
            } catch (error) {
              console.error(`Failed to send email to ${receiverEmail}:`, error);
            }
          } else {
            console.error('Email column missing in CSV data for some rows.');
          }
        });

        alert('Emails sent successfully!');
      },
      header: true, // This ensures the first row is treated as headers
      skipEmptyLines: true,
    });
  };

  return (
    <div className="email-form-container">
      <h2 className="form-title">Send Your Email</h2>
      <form className="email-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Sender Details</h3>
          <div className="form-group">
            <label htmlFor="senderEmail">Sender's Email</label>
            <input
              id="senderEmail"
              name="senderEmail"
              type="email"
              required
              value={formData.senderEmail}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="senderPassword">Sender's Password</label>
            <input
              id="senderPassword"
              name="senderPassword"
              type="password"
              required
              value={formData.senderPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn primary-btn">
          Send Emails
        </button>
      </form>

      <EmailPreviewer formData={emailDesign} />
    </div>
  );
};

export default Sendemailcsv;
