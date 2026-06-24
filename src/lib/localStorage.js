function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

// Jobs
export function getJobs() { return load('fn_jobs') }
export function saveJobs(jobs) { save('fn_jobs', jobs) }
export function getJobById(id) { return getJobs().find(j => j.id === id) ?? null }
export function createJob(data) {
  const job = { id: uuid(), ...data, status: data.status ?? 'quote', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  saveJobs([job, ...getJobs()])
  return job
}
export function updateJob(id, updates) {
  const jobs = getJobs().map(j => j.id === id ? { ...j, ...updates, updated_at: new Date().toISOString() } : j)
  saveJobs(jobs)
  return jobs.find(j => j.id === id) ?? null
}
export function deleteJob(id) { saveJobs(getJobs().filter(j => j.id !== id)) }

// Materials
export function getMaterials(jobId) { return load('fn_materials').filter(m => m.job_id === jobId) }
export function saveMaterials(all) { save('fn_materials', all) }
export function addMaterial(jobId, data) {
  const m = { id: uuid(), job_id: jobId, ...data }
  save('fn_materials', [m, ...load('fn_materials')])
  return m
}
export function updateMaterial(id, updates) {
  const all = load('fn_materials').map(m => m.id === id ? { ...m, ...updates } : m)
  save('fn_materials', all)
}
export function deleteMaterial(id) { save('fn_materials', load('fn_materials').filter(m => m.id !== id)) }

// Quotes
export function getQuotes(jobId) { return load('fn_quotes').filter(q => q.job_id === jobId) }
export function getAllQuotes() { return load('fn_quotes') }
export function saveQuotes(quotes) { save('fn_quotes', quotes) }
export function getNextQuoteRef() {
  const all = load('fn_quotes')
  return `FN-${String(all.length + 1).padStart(3, '0')}`
}
export function createQuote(data) {
  const q = { id: uuid(), ...data, reference: data.reference ?? getNextQuoteRef(), created_at: new Date().toISOString() }
  save('fn_quotes', [q, ...load('fn_quotes')])
  return q
}
export function updateQuote(id, updates) {
  const all = load('fn_quotes').map(q => q.id === id ? { ...q, ...updates } : q)
  save('fn_quotes', all)
  return all.find(q => q.id === id) ?? null
}
export function deleteQuote(id) { save('fn_quotes', load('fn_quotes').filter(q => q.id !== id)) }

// Settings
export function getSettings() { return load('fn_settings', {}) }
export function saveSettings(s) { save('fn_settings', s) }

// Currency helper
export function getCurrencySymbol(currency) {
  return { USD: '$', GBP: '£', EUR: '€' }[currency] || '$'
}
