import axios from 'axios';

export const sendSMS = async (phone, message) => {
  if (!phone || !message) {
    console.error('Phone number and message are required.');
    throw new Error('Phone number and message are required.');
  }

  const payload = {
    value1: phone,
    value2: message,
    value3: '********************\nPowered by Festivall\n********************'
  };

  console.log('Sending SMS payload:', JSON.stringify(payload));

  try {
    const response = await fetch('https://relayproxy.vercel.app/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SMS API responded with status: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('SMS sent successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error; // Re-throw to let caller handle it
  }
};

export const sendEmail = async (email, subject, message) => {
  if (!email || !subject || !message) {
    console.error('Email, subject, and message are required.');
    throw new Error('Email, subject, and message are required.');
  }

  const payload = {
    value1: email,
    value2: subject,
    value3: message
  };

  console.log('Sending Email payload:', JSON.stringify(payload));

  try {
    const response = await fetch('https://relayproxy.vercel.app/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Email API responded with status: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Email sent successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // Re-throw to let caller handle it
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
    console.log('Response data:', response.data); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
  }
}

export const sendReunionSales = async (message) => {
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
      'https://relayproxy.vercel.app/reunion_sales',
      payload,
      { headers }
    );
    console.log('Response data:', response.data); // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the axios operation:', error);
  }
}