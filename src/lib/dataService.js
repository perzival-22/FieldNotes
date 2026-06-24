import { supabase, isSupabaseConfigured } from './supabase'
import * as ls from './localStorage'

async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Jobs ─────────────────────────────────────────────────────────────
export async function getJobs() {
  if (!isSupabaseConfigured) return ls.getJobs()
  try {
    const { data, error } = await supabase.from('jobs').select('*').order('updated_at', { ascending: false })
    if (error) throw error
    ls.saveJobs(data)
    return data
  } catch {
    return ls.getJobs()
  }
}

export async function getJobById(id) {
  if (!isSupabaseConfigured) return ls.getJobById(id)
  try {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch {
    return ls.getJobById(id)
  }
}

export async function createJob(data) {
  const job = ls.createJob(data)
  if (!isSupabaseConfigured) return job
  try {
    const userId = await currentUserId()
    const { data: row, error } = await supabase
      .from('jobs')
      .insert({ ...data, id: job.id, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return row
  } catch {
    return job
  }
}

export async function updateJob(id, updates) {
  const job = ls.updateJob(id, updates)
  if (!isSupabaseConfigured) return job
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch {
    return job
  }
}

export async function deleteJob(id) {
  ls.deleteJob(id)
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('jobs').delete().eq('id', id)
  } catch {}
}

// ── Materials ─────────────────────────────────────────────────────────
export async function getMaterials(jobId) {
  if (!isSupabaseConfigured) return ls.getMaterials(jobId)
  try {
    const { data, error } = await supabase.from('materials').select('*').eq('job_id', jobId)
    if (error) throw error
    return data
  } catch {
    return ls.getMaterials(jobId)
  }
}

export async function addMaterial(jobId, data) {
  const mat = ls.addMaterial(jobId, data)
  if (!isSupabaseConfigured) return mat
  try {
    const { data: row, error } = await supabase
      .from('materials')
      .insert({ ...data, job_id: jobId, id: mat.id })
      .select()
      .single()
    if (error) throw error
    return row
  } catch {
    return mat
  }
}

export async function updateMaterial(id, updates) {
  ls.updateMaterial(id, updates)
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('materials').update(updates).eq('id', id)
  } catch {}
}

export async function deleteMaterial(id) {
  ls.deleteMaterial(id)
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('materials').delete().eq('id', id)
  } catch {}
}

// ── Quotes ─────────────────────────────────────────────────────────────
export async function getQuotes(jobId) {
  if (!isSupabaseConfigured) return ls.getQuotes(jobId)
  try {
    const { data, error } = await supabase.from('quotes').select('*').eq('job_id', jobId)
    if (error) throw error
    return data
  } catch {
    return ls.getQuotes(jobId)
  }
}

export async function createQuote(data) {
  const q = ls.createQuote(data)
  if (!isSupabaseConfigured) return q
  try {
    const userId = await currentUserId()
    const { data: row, error } = await supabase
      .from('quotes')
      .insert({ ...data, id: q.id, reference: q.reference, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return row
  } catch {
    return q
  }
}

export async function updateQuote(id, updates) {
  const q = ls.updateQuote(id, updates)
  if (!isSupabaseConfigured) return q
  try {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch {
    return q
  }
}

export async function deleteQuote(id) {
  ls.deleteQuote(id)
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('quotes').delete().eq('id', id)
  } catch {}
}
