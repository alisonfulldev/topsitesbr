import { getUsers, getClientsForSelect } from './actions'
import { UsersClient } from './_components/UsersClient'

export default async function UsuariosPage() {
  const [users, clients] = await Promise.all([
    getUsers(),
    getClientsForSelect(),
  ])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Usuários</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie os acessos ao painel (admins e clientes)
        </p>
      </div>
      <UsersClient users={users} clients={clients} />
    </div>
  )
}
