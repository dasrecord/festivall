<template>
  <div class="basic">
    <HelloWorld msg="Coding & Web Development" />
    <p>
      Welcome to our Coding & Web Development services page. We offer a wide range of services to
      meet your needs.
    </p>
    <h2>We Provide:</h2>
    <ul class="services">
      <li>Web Development</li>
      <li>Mobile App Development</li>
      <li>Software Development</li>
      <li>Database Design & Management</li>
      <li>Custom Programming</li>
      <li>API Integration</li>
      <li>Content Management Systems</li>
      <li>E-commerce Solutions</li>
      <li>SEO & Digital Marketing</li>
      <li>Web Hosting & Domain Registration</li>
      <li>Technical Support & Maintenance</li>
    </ul>
    <br />
    <h2>We Serve:</h2>
    <ul class="industry">
      <li>Individuals</li>
      <li>Small Businesses</li>
      <li>Startups</li>
      <li>Non-profits</li>
      <li>Corporations</li>
      <li>Government Agencies</li>
      <li>Academic Institutions</li>
      <li>Healthcare Providers</li>
      <li>Entertainment Industry</li>
      <li>Real Estate Professionals</li>
      <li>Legal Firms</li>
      <li>Financial Institutions</li>
      <li>Manufacturing Companies</li>
      <li>Transportation & Logistics</li>
      <li>Travel & Hospitality</li>
      <li>Retail & E-commerce</li>
      <li>Food & Beverage</li>
      <li>Media & Publishing</li>
      <li>Technology & Telecom</li>
      <li>Energy & Utilities</li>
      <li>Construction & Engineering</li>
      <li>Education & Training</li>
      <li>Government & Public Sector</li>
      <li>Healthcare & Life Sciences</li>
      <li>Professional Services</li>
      <li>Financial Services & Insurance</li>
      <li>Energy & Natural Resources</li>
      <li>Technology & Telecommunications</li>
      <li>Media & Entertainment</li>
      <li>Healthcare & Pharmaceuticals</li>
      <li>Consumer & Retail</li>
      <li>Travel & Hospitality</li>
      <li>Education & Research</li>
      <li>Government & Public Services</li>
      <li>Professional Services</li>
      <li>Non-profit Organizations</li>
      <li>Other Industries</li>
    </ul>
    <br />
    <h2>We Also Do:</h2>
    <ul class="additional">
      <li>Web Scraping</li>
      <li>Web Automation</li>
      <li>API Automation</li>
      <li>Task Automation</li>
      <li>Process Automation</li>
      <li>Workflow Automation</li>
      <li>Automated Notifications</li>
      <li>Automated Emails & SMS</li>
    </ul>
    <div class="contact-form">
      <h2>Contact Us</h2>
      Let's talk about your project.<br />Fill out the form below and we'll get back to you as soon
      as possible.<br /><br />
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <!-- <div>
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="form.phone" />
        </div> -->
        <div>
          <label for="client">I am/represent a(n):</label>
          <select id="client" v-model="form.client" required>
            <option value="individual">individual</option>
            <option value="small business">small business</option>
            <option value="startup">startup</option>
            <option value="non-profit">non-profit</option>
            <option value="corporation">corporation</option>
            <option value="government agency">government agency</option>
            <option value="academic institution">academic institution</option>
            <option value="healthcare provider">healthcare provider</option>
            <option value="entertainment industry">entertainment industry</option>
            <option value="real estate professional">real estate professional</option>
            <option value="legal firm">legal firm</option>
            <option value="financial institution">financial institution</option>
            <option value="manufacturing company">manufacturing company</option>
            <option value="transportation & logistics">transportation & logistics</option>
            <option value="travel & hospitality">travel & hospitality</option>
            <option value="retail & e-commerce">retail & e-commerce</option>
            <option value="food & beverage">food & beverage</option>
            <option value="media & publishing">media & publishing</option>
            <option value="technology & telecom">technology & telecom</option>
            <option value="energy & utilities">energy & utilities</option>
            <option value="construction & engineering">construction & engineering</option>
            <option value="education & training">education & training</option>
            <option value="government & public sector">government & public sector</option>
            <option value="healthcare & life sciences">healthcare & life sciences</option>
            <option value="professional services">professional services</option>
            <option value="consumer goods & services">consumer goods & services</option>
            <option value="automotive & aerospace">automotive & aerospace</option>
            <option value="industrial & manufacturing">industrial & manufacturing</option>
            <option value="financial services & insurance">financial services & insurance</option>
            <option value="energy & natural resources">energy & natural resources</option>
            <option value="technology & telecommunications">technology & telecommunications</option>
            <option value="media & entertainment">media & entertainment</option>
            <option value="healthcare & pharmaceuticals">healthcare & pharmaceuticals</option>
            <option value="consumer & retail">consumer & retail</option>
            <option value="travel & hospitality">travel & hospitality</option>
            <option value="education & research">education & research</option>
            <option value="government & public services">government & public services</option>
            <option value="professional services">professional services</option>
            <option value="non-profit organizations">non-profit organizations</option>
            <option value="other industries">other industries</option>
          </select>
        </div>
        <div>
          <label for="needs">I am looking for:</label>
          <select id="needs" v-model="form.needs" required>
            <option value="web development">Web Development</option>
            <option value="mobile app development">Mobile App Development</option>
            <option value="software development">Software Development</option>
            <option value="database design & management">Database Design & Management</option>
            <option value="custom programming">Custom Programming</option>
            <option value="API integration">API Integration</option>
            <option value="content management systems">Content Management Systems</option>
            <option value="e-commerce solutions">E-commerce Solutions</option>
            <option value="SEO & digital marketing">SEO & Digital Marketing</option>
            <option value="web hosting & domain registration">
              Web Hosting & Domain Registration
            </option>
            <option value="technical support & maintenance">Technical Support & Maintenance</option>
            <option value="web scraping">Web Scraping</option>
            <option value="web automation">Web Automation</option>
            <option value="API automation">API Automation</option>
            <option value="task automation">Task Automation</option>
            <option value="process automation">Process Automation</option>
            <option value="workflow automation">Workflow Automation</option>
            <option value="automated notifications">Automated Notifications</option>
            <option value="automated emails & SMS">Automated Emails & SMS</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'coding&webdev',
  components: {
    HelloWorld
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        client: '',
        needs: '',
        message: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/reunion_slack',
          {
            text: `Name: ${this.form.name}\nEmail: ${this.form.email}\nClient: ${this.form.client}\nNeeds: ${this.form.needs}\nMessage: ${this.form.message}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (response.status === 200) {
          alert('Form submitted successfully!')
          this.form.name = ''
          this.form.email = ''
          this.form.client = ''
          this.form.needs = ''
          this.form.message = ''
        } else {
          alert('Failed to submit the form.')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting the form.')
      }
    }
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}

.industry,
.services,
.additional {
  padding: 0;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  list-style-type: none;
}
li {
  /* font-weight: bold; */
  padding: 5px;
  margin: 3px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
form,
label,
input,
textarea,
select {
  font-family: Oswald, Helvetica, sans-serif;
  width: 500px;
  max-width: 80vw;
  display: block;
  margin-bottom: 10px;
}
button {
  background-color: white;
  width: 100%;
  max-width: 80vw;
  display: block;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: #0080ff;
  color: white;
}
</style>
