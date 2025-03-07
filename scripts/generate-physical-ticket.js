import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the configuration file
const configPath = path.join(__dirname, 'ticket-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const generateTicket = async (id_code) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Replace with the URL of your TicketPageView component
  const url = `http://localhost:5173/reunionticket/${id_code}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });


    // Generate PDF
    const pdfPath = path.join(__dirname, `ticket_${id_code}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: '432px',
      height: '932px',
      printBackground: false,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    console.log(`Ticket generated: ${pdfPath}`);
  } catch (error) {
    console.error(`Failed to generate ticket: ${error.message}`);
  } finally {
    await browser.close();
  }
};

// Get the ID code from the configuration file
const id_code = config.id_code;
if (!id_code) {
  console.error('Please provide an ID code.');
  process.exit(1);
}

generateTicket(id_code);