"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, UserPlus, ShieldCheck, ShieldX, UserX, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { getRoleName, getRoleColor, getStatusName, getStatusColor } from "@/lib/auth-utils"

interface User {
  id: string
  name: string
  email: string
  role: "superadmin" | "operator" | "user"
  status: "pending" | "active" | "inactive"
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, pagination.limit])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/users?page=${pagination.page}&limit=${pagination.limit}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()

      setUsers(data.data || [])
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
      }))
    } catch (error) {
      toast.error("Gagal mengambil data pengguna")
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to approve user")

      toast.success(`Pengguna ${userName} berhasil disetujui`)
      fetchUsers()
    } catch (error) {
      toast.error("Gagal menyetujui pengguna")
      console.error("Error approving user:", error)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete user")

      toast.success(`Pengguna ${userName} berhasil dihapus`)
      fetchUsers()
    } catch (error) {
      toast.error("Gagal menghapus pengguna")
      console.error("Error deleting user:", error)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {row.original.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge className={getRoleColor(role as any)}>
            {getRoleName(role as any)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusName(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Email Terverifikasi",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean
        return (
          <Badge variant={verified ? "default" : "secondary"}>
            {verified ? "Ya" : "Tidak"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        const isPending = user.status === "pending"
        const canApprove = isPending && session?.user?.role === "superadmin"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              {canApprove && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleApproveUser(user.id, user.name)}
                    className="text-green-600"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Setujui Pengguna
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Pengguna
              </DropdownMenuItem>
              {session?.user?.role === "superadmin" && user.id !== session.user.id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Pengguna
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Form untuk menambahkan pengguna baru ke sistem
                </DialogDescription>
              </DialogHeader>
              {/* TODO: Add user form component */}
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Form pengguna akan segera tersedia
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Kelola pengguna yang terdaftar dalam sistem arsip digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Cari nama atau email pengguna..."
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}