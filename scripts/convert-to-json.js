import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Define the input and output file paths
const file = "impact_leads";

const csvFilePath = path.join(process.cwd(), `public/data/applicants/${file}_raw.csv`);
const jsonFilePath = path.join(process.cwd(), `public/data/applicants/${file}_raw.json`);

const results = [];

// Read the CSV file and convert to JSON
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Write the JSON data to a file
    fs.writeFile(jsonFilePath, JSON.stringify(results, null, 4), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log(`CSV data has been successfully converted to JSON and saved to ${jsonFilePath}`);
      }
    });
  });