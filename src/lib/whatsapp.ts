// lib/whatsapp.ts
interface Sticker {
  code: string
  name: string
  isFoil?: boolean
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

function formatStickerList(stickers: Sticker[]) {
  return stickers.map((sticker) => `- ${sticker.code} (${sticker.name})`).join('\n')
}

export function buildTradeMatchWhatsAppUrl({
  phone,
  partnerName,
  theyCanGiveYou,
  youCanGiveThem,
}: {
  phone: string
  partnerName: string
  theyCanGiveYou: Sticker[]
  youCanGiveThem: Sticker[]
}) {
  const cleanPhone = phone.replace(/\D/g, '')
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const lines = [
    `Oi, ${partnerName}! Vi no Figurinhas da Copa que a nossa troca tem boa chance de encaixar.`,
  ]

  if (theyCanGiveYou.length > 0) {
    lines.push('', 'Eu preciso destas figurinhas suas:', formatStickerList(theyCanGiveYou))
  }

  if (youCanGiveThem.length > 0) {
    lines.push('', 'Eu posso te oferecer estas repetidas:', formatStickerList(youCanGiveThem))
  }

  lines.push('', 'Se fizer sentido para voce, vamos combinar a troca?')

  const message = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${fullPhone}?text=${message}`
}
