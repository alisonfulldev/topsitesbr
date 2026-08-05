import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjetosClient } from './_components/ProjetosClient'

export default async function ProjetosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
  })

  return <ProjetosClient projects={projects} />
}
