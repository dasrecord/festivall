import axios from 'axios';

export const sendSMS = async (phone, message) => {
  if (!phone || !message) {
    alert('Phone number and message are required.');
    return;
  }

  const payload = {
    value1: phone,
    value2: message,
    value3: '********************\nPowered by Festivall\n********************'
  };

  console.log('Sending payload:', JSON.stringify(payload)); // Add logging for debugging

  try {
    const response = await fetch('https://relayproxy.vercel.app/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    alert(`SMS sent  to ${phone} successfully!`);

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

export const sendEmail = async (email, subject, message) => {
  if (!email || !subject || !message) {
    alert('Email, subject, and message are required.');
    return;
  }

  const payload = {
    value1: email,
    value2: subject,
    value3: message
  };

  console.log('Sending payload:', JSON.stringify(payload)); // Add logging for debugging

  try {
    const response = await fetch('https://relayproxy.vercel.app/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    alert(`Email sent to ${email} successfully!`);

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

export const sendReunionFrontGate = async (message) => {
  if (!message) {
    alert('Message is required.');
    return;
  }

  const payload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  console.log('Sending payload:', JSON.stringify(payload)); // Add logging for debugging

  try {
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_frontgate',
      payload,
      { headers }
    );

    alert('Sent to Slack successfully!');

    console.log('Response data:', response.data); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
  }
};

export const sendReunionApplications = async (message) => {
  if (!message) {
    alert('Message is required.');
    return;
  }

  const payload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  console.log('Sending payload:', JSON.stringify(payload)); // Add logging for debugging

  try {
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_applications',
      payload,
      { headers }
    );

    alert('Sent to Slack successfully!');

    console.log('Response data:', response.data); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
  }
}