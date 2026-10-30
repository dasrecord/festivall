declare module 'qrcode' {
  interface QRCodeDataUrlOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    margin?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  const QRCode: {
    toDataURL(text: string, options?: QRCodeDataUrlOptions): Promise<string>
  }

  export default QRCode
}
