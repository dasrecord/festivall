import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load images as base64
const festivalEmblem = fs.readFileSync(path.resolve(__dirname, '../src/assets/images/festivall_emblem_black.png'), 'base64')
const dasRecordLogo = fs.readFileSync(path.resolve(__dirname, '../src/assets/images/das_record_logo_white.png'), 'base64')

// Sample invoice data
const invoiceData = {
  date: '2025-03-08',
  time: '04:00 PM',
  location: '924 Spadina Crescent East,',
  servicesProvided: 'Event Management, Sound Tech',
  invoiceNumber: '001',
  clientName: "Finn's Pub",
  totalAmount: '240.00'
}

const generateInvoice = (invoiceData) => {
  const {
    date,
    time,
    location,
    servicesProvided,
    invoiceNumber,
    clientName,
    totalAmount
  } = invoiceData

  const doc = new jsPDF()

  // Original dimensions
  const originalWidth = 402
  const originalHeight = 269

  // Desired width for the PDF
  const desiredWidth = 50

  // Calculate the height to maintain aspect ratio
  const aspectRatio = originalHeight / originalWidth
  const desiredHeight = desiredWidth * aspectRatio

  // Add festival emblem with correct aspect ratio
  doc.addImage(`data:image/png;base64,${festivalEmblem}`, 'PNG', 10, 10, desiredWidth, desiredHeight)

  // Add das record logo with correct aspect ratio
  doc.addImage(`data:image/png;base64,${dasRecordLogo}`, 'PNG', 150, 10, desiredWidth, desiredHeight)

  // Add invoice title
  doc.setFontSize(20)
  doc.text('Invoice', 105, 40, { align: 'center' })

  // Add invoice details
  doc.setFontSize(12)
  doc.text(`Invoice Number: ${invoiceNumber}`, 10, 60)
  doc.text(`Date: ${date}`, 10, 70)
  doc.text(`Time: ${time}`, 10, 80)
  doc.text(`Location: ${location}`, 10, 90)

  // Add client details
  doc.text(`Client Name: ${clientName}`, 10, 110)

  // Add services provided
  doc.text('Services Provided:', 10, 160)
  doc.text(servicesProvided, 10, 170)

  // Add total amount
  doc.setFontSize(16)
  doc.text(`Total Amount: $${totalAmount}`, 10, 190)

  // Save the PDF
  doc.save(`invoice_${invoiceNumber}.pdf`)
}

// Generate the invoice
generateInvoice(invoiceData)