// EmailPreviewer.js
import React from 'react';

const EmailPreviewer = ({ formData, emailBody }) => {
  return (
    <div className="email-preview">
      <h3>Email Preview</h3>
      <div className="email-content">
        <p style={{ whiteSpace: 'pre-line' }}>
          {/* Render the email body with HTML content */}
          <div
            dangerouslySetInnerHTML={{
              __html:
                emailBody ||
                formData.emailBody ||
                `Dear ${formData.receiverName || 'Receiver'},\nThis is the body of the email.`,
            }}
          />
        </p>

        <table className="signature-table" style={{ width: 'auto' }}>
          <tbody>
            <tr>
              <td className="signature-logo">
                <img
                  src={
                    formData.logoImage ||
                    formData.imageUrl ||
                    'https://via.placeholder.com/85' // Default image URL
                  }
                  alt={`${formData.senderInstitution || 'Your'} Logo`}
                  style={{ width: '85px' }}
                />
              </td>
              <td className="signature-details">
                <strong>{formData.senderName || 'Your Name'}</strong>
                <br />
                {formData.senderDepartment || 'Your Department'}
                <br />
                {formData.senderInstitution || 'Your Institution'}
                <br />
                <div className="social-icons">
                  {formData.linkedinProfile && (
                    <a href={formData.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                        alt="LinkedIn"
                        className="social-icon"
                        style={{ width: '20px', marginRight: '7px' }}
                      />
                    </a>
                  )}
                  {formData.githubProfile && (
                    <a href={formData.githubProfile} target="_blank" rel="noopener noreferrer">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                        alt="GitHub"
                        className="social-icon"
                        style={{ width: '20px', marginRight: '7px' }}
                      />
                    </a>
                  )}
                  {formData.facebookProfile && (
                    <a href={formData.facebookProfile} target="_blank" rel="noopener noreferrer">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                        alt="Facebook"
                        className="social-icon"
                        style={{ width: '20px' }}
                      />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailPreviewer;
