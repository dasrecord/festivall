import { promises as fs } from 'fs';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Function to extract routes from router.ts
async function getRoutes() {
    try {
        const routerPath = 'src/router/index.ts';
        const exists = await fs.access(routerPath)
            .then(() => true)
            .catch(() => false);
        
        if (!exists) {
            console.error(`Router file not found at: ${routerPath}`);
            return [];
        }

        const routerContent = await fs.readFile(routerPath, 'utf8');
        console.log('Router file content:', routerContent); // Debug log

        const routes = [];
        const pathPattern = /path:\s*['"]([^'"]+)['"]/g;
        let match;

        while ((match = pathPattern.exec(routerContent))) {
            routes.push(match[1]);
        }

        console.log('Found routes:', routes); // Debug log
        return routes;
    } catch (error) {
        console.error('Error reading router file:', error);
        return [];
    }
}

// Function to generate QR code for a URL
async function generateQR(url, outputPath) {
    try {
        await QRCode.toFile(outputPath, url);
        console.log(`Generated QR code for ${url}`);
    } catch (error) {
        console.error(`Error generating QR code for ${url}:`, error);
    }
}

// Main function
async function generateAllQRCodes() {
    const baseUrl = 'https://festivall.ca';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputDir = path.resolve(__dirname, '../public/qr_codes');

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    const routes = await getRoutes();
    
    for (const route of routes) {
        const fullUrl = `${baseUrl}${route}`;
        const fileName = `${route.replace(/\//g, '-').slice(1) || 'home'}.png`;
        await generateQR(fullUrl, path.join(outputDir, fileName));
    }
}

// Run the script
generateAllQRCodes().catch(console.error);