// lib/whatsapp.ts
interface Sticker {
  code: string
  name: string
}

export function buildWhatsAppUrl(phone: string, sticker: Sticker): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const message = encodeURIComponent(
    `Oi! Vi que você tem a figurinha ${sticker.code} (${sticker.name}) repetida no Figurinhas da Copa. Quer trocar?`,
  )
  // Prepend Brazil country code if not already present (assumes Brazilian numbers)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  return `https://wa.me/${fullPhone}?text=${message}`
}
