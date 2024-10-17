# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.message import EmailMessage
import ssl
import base64
paths = ssl.get_default_verify_paths()

app = Flask(__name__)
CORS(app)

def send_email(sender_email, sender_password, email_data):
    msg = EmailMessage()
    msg['From'] = sender_email
    msg['To'] = email_data['receiverEmail']
    msg['Subject'] = email_data['emailSubject']

    # Prepare the plain text signature
    plain_text_signature = f"""
{email_data['senderName']}
{email_data['senderDepartment']}
{email_data['senderInstitution']}
"""

    # Optionally include social links in plain text
    if any([email_data['linkedinProfile'], email_data['githubProfile'], email_data['facebookProfile']]):
        plain_text_signature += "Social Profiles:\n"
        if email_data['linkedinProfile']:
            plain_text_signature += f"LinkedIn: {email_data['linkedinProfile']}\n"
        if email_data['githubProfile']:
            plain_text_signature += f"GitHub: {email_data['githubProfile']}\n"
        if email_data['facebookProfile']:
            plain_text_signature += f"Facebook: {email_data['facebookProfile']}\n"

    # Prepare the plain text body
    plain_text_body = f"{email_data['emailBody']}\n\n-- \n{plain_text_signature}"

    # Prepare the HTML email body
    formatted_email_body = email_data['emailBody'].replace('\n', '<br>')

    # Prepare the signature HTML
    signature_html = f"""
    <!-- Signature Section -->
    <table style="width: auto; border: none;">
        <tr>
            <td style="vertical-align: top; text-align: right; padding-right: 15px;">
                <img src="cid:logo_image" alt="{email_data['senderInstitution']} Logo" style="width: 85px;">
            </td>
            <td style="vertical-align: top; text-align: left;">
                <strong>{email_data['senderName']}</strong><br>
                {email_data['senderDepartment']}<br>
                {email_data['senderInstitution']}<br>
    """

    # Add social links if provided
    if any([email_data['linkedinProfile'], email_data['githubProfile'], email_data['facebookProfile']]):
        signature_html += '<div>'
        if email_data['linkedinProfile']:
            signature_html += f"""
                <a href="{email_data['linkedinProfile']}">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 20px; margin-right: 7px;">
                </a>
            """
        if email_data['githubProfile']:
            signature_html += f"""
                <a href="{email_data['githubProfile']}">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub" style="width: 20px; margin-right: 7px;">
                </a>
            """
        if email_data['facebookProfile']:
            signature_html += f"""
                <a href="{email_data['facebookProfile']}">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 20px;">
                </a>
            """
        signature_html += '</div>'

    signature_html += """
            </td>
        </tr>
    </table>
    """

    html_body = f"""
    <html>
    <body>
        {formatted_email_body}
        <br><br>
        -- <br>
        {signature_html}
    </body>
    </html>
    """

    # Set the email content
    msg.set_content(plain_text_body)
    msg.add_alternative(html_body, subtype='html')

    # Access the HTML part directly
    html_part = msg.get_payload()[1]  # The second part is the HTML alternative

    # Handle logo image
    if 'logoImage' in email_data and email_data['logoImage']:
        # Extract base64 data
        base64_data = email_data['logoImage'].split(';base64,')[1]
        image_data = base64.b64decode(base64_data)
        # Attach image to email
        html_part.add_related(image_data, maintype='image', subtype='png', cid='logo_image')
    else:
        # Use default image
        default_logo_url = 'https://via.placeholder.com/85'  # Default image URL
        # Replace 'cid:logo_image' with default image URL in the HTML content
        updated_html_body = html_body.replace('cid:logo_image', default_logo_url)
        # Update the HTML part's content
        html_part.set_content(updated_html_body, subtype='html')

    context = ssl._create_unverified_context()

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        print(f"Email sent successfully to {email_data['receiverName']} at {email_data['receiverEmail']}!")
        return True
    except Exception as e:
        print(f"Error sending email to {email_data['receiverName']}: {e}")
        return False


@app.route('/send-email', methods=['POST'])
def handle_send_email():
    data = request.get_json()
    sender_email = data['senderEmail']
    sender_password = data['senderPassword']

    email_data = {
        'receiverName': data.get('receiverName', ''),
        'receiverEmail': data['receiverEmail'],
        'emailSubject': data['emailSubject'],
        'emailBody': data['emailBody'],
        'senderName': data['senderName'],
        'senderDepartment': data['senderDepartment'],
        'senderInstitution': data['senderInstitution'],
        'linkedinProfile': data.get('linkedinProfile', ''),
        'githubProfile': data.get('githubProfile', ''),
        'facebookProfile': data.get('facebookProfile', ''),
        'logoImage': data.get('logoImage', ''),
    }

    success = send_email(sender_email, sender_password, email_data)

    if success:
        return jsonify({'message': 'Email sent successfully!'})
    else:
        return jsonify({'message': 'Failed to send email'}), 500

if __name__ == '__main__':
    app.run(debug=True)
