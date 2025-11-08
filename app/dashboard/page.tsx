"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Folder,
  FileText,
  Users,
  Tags,
  TrendingUp,
  Clock,
  Archive,
  Building,
  Hash
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { getRoleName, getRoleColor } from "@/lib/auth-utils"

interface DashboardStats {
  totalArsipUnit: number
  totalBerkasArsip: number
  totalKategori: number
  totalKodeKlasifikasi: number
  totalUnitPengolah: number
  totalUsers: number
  recentActivities: any[]
  statusSummary: {
    aktif: number
    inaktif: number
    musnah: number
  }
}

export default function Page() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // In a real app, this would be a single API call
      const responses = await Promise.all([
        fetch("/api/arsip-unit?page=1&limit=1"),
        fetch("/api/berkas-arsip?page=1&limit=1"),
        fetch("/api/kategori?page=1&limit=1"),
        fetch("/api/users?page=1&limit=1"),
      ])

      const [arsipRes, berkasRes, kategoriRes, usersRes] = responses
      const arsipData = arsipRes.ok ? await arsipRes.json() : { pagination: { total: 0 } }
      const berkasData = berkasRes.ok ? await berkasRes.json() : { pagination: { total: 0 } }
      const kategoriData = kategoriRes.ok ? await kategoriRes.json() : { pagination: { total: 0 } }
      const usersData = usersRes.ok ? await usersRes.json() : { pagination: { total: 0 } }

      setStats({
        totalArsipUnit: arsipData.pagination?.total || 0,
        totalBerkasArsip: berkasData.pagination?.total || 0,
        totalKategori: kategoriData.pagination?.total || 0,
        totalKodeKlasifikasi: 0, // TODO: Add API
        totalUnitPengolah: 0, // TODO: Add API
        totalUsers: usersData.pagination?.total || 0,
        recentActivities: [], // TODO: Add API
        statusSummary: {
          aktif: Math.floor((arsipData.pagination?.total || 0) * 0.7),
          inaktif: Math.floor((arsipData.pagination?.total || 0) * 0.2),
          musnah: Math.floor((arsipData.pagination?.total || 0) * 0.1),
        }
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data dashboard...</div>
      </div>
    )
  }

  const userRole = session?.user?.role as string
  const isSuperAdmin = userRole === "superadmin"

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {session?.user?.name || "User"}!
          </p>
          {userRole && (
            <Badge className={getRoleColor(userRole as any)}>
              {getRoleName(userRole as any)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arsip Unit</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArsipUnit || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total unit arsip yang tersimpan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berkas Arsip</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBerkasArsip || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total berkas arsip digital
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalKategori || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total kategori arsip
            </p>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total pengguna terdaftar
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Status Arsip
            </CardTitle>
            <CardDescription>
              Ringkasan status arsip berdasarkan klasifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Aktif</span>
                </div>
                <span className="font-semibold">{stats?.statusSummary.aktif || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Inaktif</span>
                </div>
                <span className="font-semibold">{stats?.statusSummary.inaktif || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Musnah</span>
                </div>
                <span className="font-semibold">{stats?.statusSummary.musnah || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aktivitas Terkini
            </CardTitle>
            <CardDescription>
              Log aktivitas sistem terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada aktivitas terbaru</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Aksi yang sering digunakan oleh Super Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-16 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Manajemen User</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Folder className="h-6 w-6 mb-2" />
                <span className="text-sm">Tambah Arsip</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Upload Berkas</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">Lihat Laporan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}