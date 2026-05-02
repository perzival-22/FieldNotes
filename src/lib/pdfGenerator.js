import jsPDF from 'jspdf'

export function generateQuotePDF(quote, job, settings, materials = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 20
  let y = margin

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(settings.companyName || 'FieldNotes', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  if (settings.traderName) { doc.text(settings.traderName, margin, y); y += 5 }
  if (settings.phone) { doc.text(settings.phone, margin, y); y += 5 }
  if (settings.email) { doc.text(settings.email, margin, y); y += 5 }
  doc.setTextColor(0)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`QUOTE ${quote.reference}`, pageW - margin, margin, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('en-GB')}`, pageW - margin, margin + 7, { align: 'right' })
  if (quote.valid_until) {
    doc.text(`Valid until: ${new Date(quote.valid_until).toLocaleDateString('en-GB')}`, pageW - margin, margin + 12, { align: 'right' })
  }

  y += 10
  doc.setDrawColor(200)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(job.client_name || '', margin, y); y += 5
  if (job.address) { doc.text(job.address, margin, y); y += 5 }
  if (job.phone) { doc.text(job.phone, margin, y); y += 5 }
  y += 5

  if (job.description) {
    doc.setFont('helvetica', 'bold')
    doc.text('Scope of Work:', margin, y); y += 5
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(job.description, pageW - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * 5 + 5
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Description', margin, y)
  doc.text('Qty', 120, y, { align: 'right' })
  doc.text('Rate', 150, y, { align: 'right' })
  doc.text('Amount', pageW - margin, y, { align: 'right' })
  y += 3
  doc.line(margin, y, pageW - margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')

  ;(quote.labour_items || []).forEach(item => {
    const amount = (item.hours * item.rate).toFixed(2)
    doc.text(item.description || 'Labour', margin, y)
    doc.text(String(item.hours), 120, y, { align: 'right' })
    doc.text(`£${Number(item.rate).toFixed(2)}/hr`, 150, y, { align: 'right' })
    doc.text(`£${amount}`, pageW - margin, y, { align: 'right' })
    y += 6
  })

  materials.forEach(mat => {
    const amount = (mat.quantity * mat.cost).toFixed(2)
    doc.text(mat.name || 'Material', margin, y)
    doc.text(String(mat.quantity), 120, y, { align: 'right' })
    doc.text(`£${Number(mat.cost).toFixed(2)}`, 150, y, { align: 'right' })
    doc.text(`£${amount}`, pageW - margin, y, { align: 'right' })
    y += 6
  })

  y += 3
  doc.line(margin, y, pageW - margin, y)
  y += 5

  const subtotalLine = (label, value) => {
    doc.text(label, 150, y, { align: 'right' })
    doc.text(`£${Number(value).toFixed(2)}`, pageW - margin, y, { align: 'right' })
    y += 6
  }
  subtotalLine('Subtotal:', quote.subtotal)
  if (quote.vat_rate > 0) subtotalLine(`VAT (${quote.vat_rate}%):`, quote.vat_amount)
  doc.setFont('helvetica', 'bold')
  subtotalLine('TOTAL:', quote.total)

  if (quote.notes) {
    y += 6
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(100)
    const noteLines = doc.splitTextToSize(`Notes: ${quote.notes}`, pageW - margin * 2)
    doc.text(noteLines, margin, y)
  }

  return doc
}
