// CSVReaderWithForm.js
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import EmailPreviewer from './EmailPreviewer';

const CSVReaderWithForm = () => {
  const [formData, setFormData] = useState({
    emailSubject: '',
    emailBody: '',
    senderName: '',
    senderDepartment: '',
    senderInstitution: '',
    linkedinProfile: '',
    githubProfile: '',
    facebookProfile: '',
    imageUrl: '',
    csvFile: null, // To store the CSV file
    logoImage: null, // To store the logo image
  });

  const [columns, setColumns] = useState([]);
  const [firstRow, setFirstRow] = useState([]);
  const emailBodyRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Parse the CSV file
      Papa.parse(file, {
        complete: (results) => {
          const [header, ...rows] = results.data;
          setColumns(header);
          setFirstRow(rows[0]);
        },
        header: false,
        skipEmptyLines: true,
      });

      // Store the CSV file in formData
      setFormData((prevState) => ({
        ...prevState,
        csvFile: file, // Store the file itself
      }));
    }
  };

  const handleColumnClick = (column) => {
    const block = document.createElement('span');
    block.contentEditable = 'false';
    block.innerHTML = `{${column}}`;
    block.style.cssText = `
      color: blue;
      display: inline-block;
      padding: 2px 4px;
      margin: 0 2px;
      background-color: #e0f0ff;
      border-radius: 4px;
      cursor: pointer;
    `;
    block.classList.add('block-element');
    emailBodyRef.current.appendChild(block);
    emailBodyRef.current.appendChild(document.createTextNode(' '));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const node = range.startContainer.parentNode;

      if (node.classList.contains('block-element')) {
        event.preventDefault();
        node.remove();
      }
    }
  };

  // Function to update formData with the email body content
  const handleEmailBodyChange = () => {
    const emailBodyContent = emailBodyRef.current.innerHTML;
    setFormData((prevState) => ({
      ...prevState,
      emailBody: emailBodyContent,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Read the file as Data URL (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({
          ...prevState,
          logoImage: reader.result, // base64 encoded string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass form data and CSV file to the next component via state
    navigate('/csvsend', { state: { emailDesign: formData } });
  };

  // Function to replace placeholders with actual first row data
  const replacePlaceholdersWithValues = (emailBody, columns, firstRow) => {
    let updatedEmailBody = emailBody;
    columns.forEach((column, index) => {
      const regex = new RegExp(`{${column}}`, 'g');
      updatedEmailBody = updatedEmailBody.replace(regex, firstRow[index]);
    });
    return updatedEmailBody;
  };

  // Generate the email body for preview by replacing placeholders
  const emailBodyForPreview = replacePlaceholdersWithValues(
    formData.emailBody,
    columns,
    firstRow
  );

  return (
    <div className="email-form-container">
      <h2 className="form-title">Upload CSV and Design Your Email</h2>

      <form className="email-form" onSubmit={handleSubmit}>
        {/* CSV Upload Section */}
        <div className="form-section">
          <h3>Upload CSV</h3>
          <div className="form-group">
            <label htmlFor="csvFile">Choose CSV File</label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>

        {columns.length > 0 && (
          <div className="form-section">
            <h3>Columns:</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {columns.map((column, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColumnClick(column)}
                  className="btn primary-btn"
                  style={{ cursor: 'pointer' }}
                >
                  {column}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Standard Email Form */}
        <div className="form-section">
          <h3>Subject & Body</h3>
          <div className="form-group">
            <label htmlFor="emailSubject">Email Subject</label>
            <input
              id="emailSubject"
              name="emailSubject"
              type="text"
              required
              value={formData.emailSubject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="emailBody">Email Body</label>
            <div
              ref={emailBodyRef}
              contentEditable
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                minHeight: '100px',
                width: '100%',
                maxWidth: '600px',
                borderRadius: '4px',
                outline: 'none',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                cursor: 'text',
              }}
              onInput={handleEmailBodyChange} // Update formData when typing
              onKeyDown={handleKeyDown}
              placeholder="Write your email here..."
            ></div>
          </div>
        </div>

        {/* Signature Details */}
        <div className="form-section">
          <h3>Signature Details</h3>
          <div className="form-group">
            <label htmlFor="senderName">Your Name</label>
            <input
              id="senderName"
              name="senderName"
              type="text"
              required
              value={formData.senderName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="senderDepartment">Your Department</label>
            <input
              id="senderDepartment"
              name="senderDepartment"
              type="text"
              required
              value={formData.senderDepartment}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="senderInstitution">Your Institution</label>
            <input
              id="senderInstitution"
              name="senderInstitution"
              type="text"
              required
              value={formData.senderInstitution}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logoImage">Upload Logo (Optional)</label>
            <input
              id="logoImage"
              name="logoImage"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Social Profiles */}
        <div className="form-section">
          <h3>Social Profiles</h3>
          <div className="form-group social-links">
            <input
              id="linkedinProfile"
              name="linkedinProfile"
              type="url"
              placeholder="LinkedIn URL"
              value={formData.linkedinProfile}
              onChange={handleChange}
            />
            <input
              id="githubProfile"
              name="githubProfile"
              type="url"
              placeholder="GitHub URL"
              value={formData.githubProfile}
              onChange={handleChange}
            />
            <input
              id="facebookProfile"
              name="facebookProfile"
              type="url"
              placeholder="Facebook URL"
              value={formData.facebookProfile}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn primary-btn" style={{ marginTop: '20px' }}>
          Save & Continue
        </button>
      </form>

      {/* Email Preview */}
      <EmailPreviewer formData={formData} emailBody={emailBodyForPreview} />
    </div>
  );
};

export default CSVReaderWithForm;
