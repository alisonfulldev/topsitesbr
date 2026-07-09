'use server'

import { prisma } from '@/lib/prisma'
import { uploadSiteFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'
import { SiteType, SiteStatus, DnsStatus, SslStatus } from '@prisma/client'

export async function createSite(
  formData: FormData
): Promise<{ error?: string; success?: boolean; siteId?: string }> {
  const clientId = formData.get('clientId') as string
  const siteType = formData.get('siteType') as string
  const status = (formData.get('status') as string) || 'pendente_ativacao'
  const siteUrl = (formData.get('siteUrl') as string) || null
  const templateUsed = (formData.get('templateUsed') as string) || null
  const notes = (formData.get('notes') as string) || null
  const file = formData.get('filesZip') as File | null

  if (!clientId || !siteType) {
    return { error: 'Tipo de site é obrigatório.' }
  }

  if (!Object.values(SiteType).includes(siteType as SiteType)) {
    return { error: 'Tipo de site inválido.' }
  }

  let filesZipUrl: string | null = null
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() ?? 'zip'
      const path = `${clientId}/${Date.now()}.${ext}`
      filesZipUrl = await uploadSiteFile(path, buffer, file.type || 'application/zip')
    } catch (err) {
      return { error: 'Erro ao fazer upload do arquivo. Verifique a configuração do Storage.' }
    }
  }

  const site = await prisma.site.create({
    data: {
      clientId,
      siteUrl: siteUrl?.trim() || null,
      siteType: siteType as SiteType,
      templateUsed: templateUsed?.trim() || null,
      status: status as SiteStatus,
      filesZipUrl,
      notes: notes?.trim() || null,
    },
  })

  revalidatePath(`/admin/clientes/${clientId}/sites`)
  revalidatePath(`/admin/clientes/${clientId}`)
  return { success: true, siteId: site.id }
}

export async function updateSite(
  id: string,
  clientId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const siteType = formData.get('siteType') as string
  const status = formData.get('status') as string
  const siteUrl = (formData.get('siteUrl') as string) || null
  const templateUsed = (formData.get('templateUsed') as string) || null
  const notes = (formData.get('notes') as string) || null
  const file = formData.get('filesZip') as File | null

  if (!siteType) return { error: 'Tipo de site é obrigatório.' }

  let filesZipUrl: string | undefined
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() ?? 'zip'
      const path = `${clientId}/${Date.now()}.${ext}`
      filesZipUrl = await uploadSiteFile(path, buffer, file.type || 'application/zip')
    } catch {
      return { error: 'Erro ao fazer upload do arquivo.' }
    }
  }

  await prisma.site.update({
    where: { id },
    data: {
      siteUrl: siteUrl?.trim() || null,
      siteType: siteType as SiteType,
      templateUsed: templateUsed?.trim() || null,
      status: status as SiteStatus,
      notes: notes?.trim() || null,
      publishedAt: status === 'online' ? new Date() : undefined,
      ...(filesZipUrl ? { filesZipUrl } : {}),
    },
  })

  revalidatePath(`/admin/clientes/${clientId}/sites`)
  revalidatePath(`/admin/clientes/${clientId}/sites/${id}`)
  return { success: true }
}

export async function updateSiteStatus(
  id: string,
  clientId: string,
  status: string
): Promise<void> {
  await prisma.site.update({
    where: { id },
    data: {
      status: status as SiteStatus,
      publishedAt: status === 'online' ? new Date() : undefined,
    },
  })
  revalidatePath(`/admin/clientes/${clientId}/sites`)
  revalidatePath(`/admin/clientes/${clientId}/sites/${id}`)
}

export async function createDomain(data: {
  siteId: string
  clientId: string
  domain: string
  dnsStatus: string
  sslStatus: string
}): Promise<{ error?: string; success?: boolean }> {
  if (!data.domain.trim()) return { error: 'Domínio é obrigatório.' }

  await prisma.domain.create({
    data: {
      siteId: data.siteId,
      domain: data.domain.trim().toLowerCase(),
      dnsStatus: data.dnsStatus as DnsStatus,
      sslStatus: data.sslStatus as SslStatus,
    },
  })

  revalidatePath(`/admin/clientes/${data.clientId}/sites/${data.siteId}`)
  return { success: true }
}

export async function updateDomain(
  id: string,
  clientId: string,
  siteId: string,
  data: {
    domain: string
    dnsStatus: string
    sslStatus: string
    verifiedAt?: string | null
  }
): Promise<{ error?: string; success?: boolean }> {
  await prisma.domain.update({
    where: { id },
    data: {
      domain: data.domain.trim().toLowerCase(),
      dnsStatus: data.dnsStatus as DnsStatus,
      sslStatus: data.sslStatus as SslStatus,
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
    },
  })

  revalidatePath(`/admin/clientes/${clientId}/sites/${siteId}`)
  return { success: true }
}

export async function deleteDomain(
  id: string,
  clientId: string,
  siteId: string
): Promise<void> {
  await prisma.domain.delete({ where: { id } })
  revalidatePath(`/admin/clientes/${clientId}/sites/${siteId}`)
}
