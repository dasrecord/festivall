<template>
  <div class="dashboard-panel">
    <div class="applicants">
      <div v-for="(applicant, index) in applicants" :key="index" class="applicant-card">
        <h3>{{ applicant[0] }}</h3>
        <p>{{ applicant[1] }}</p>
        <p>{{ applicant[2] }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse'
import csvContent from '@/data/applicants/artist_leads.csv'

export default {
  name: 'DashboardPanel',
  data() {
    return {
      applicants: []
    }
  },
  mounted() {
    console.log('CSV Content:', csvContent) // Debugging log
    this.parseCSV(csvContent)
  },
  methods: {
    parseCSV(text) {
      console.log('Parsing CSV with PapaParse...') // Debugging log
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Parsed Data:', results.data) // Debugging log
          if (results.data.length === 0) {
            console.warn('Parsed data is empty. Check the CSV format.')
          }
          this.applicants = results.data
        },
        error: (error) => {
          console.error('Error parsing CSV:', error)
        }
      })
    }
  }
}
</script>

<style scoped>
.dashboard-panel {
  padding: 20px;
}

.applicants {
  display: flex;
  flex-direction: column;
}

.applicant-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
}
</style>
