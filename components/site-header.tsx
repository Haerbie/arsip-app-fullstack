import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SimpleThemeToggle } from "@/components/theme-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SiteHeader() {
  const pathname = usePathname()

  // Generate breadcrumb based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = pathname.split("/").filter(segment => segment)
    const items = []

    if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === "dashboard")) {
      return [{ label: "Dashboard", href: "/dashboard", isPage: true }]
    }

    items.push({ label: "Dashboard", href: "/dashboard", isPage: false })

    if (pathSegments[0] === "dashboard" && pathSegments.length > 1) {
      const pageName = pathSegments.slice(1).join(" ").replace(/-/g, " ")
      items.push({
        label: pageName.charAt(0).toUpperCase() + pageName.slice(1),
        href: pathname,
        isPage: true
      })
    }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Breadcrumb */}
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  <BreadcrumbItem>
                    {item.isPage ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator className="mx-2" />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search and Theme Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari arsip..."
              className="pl-8 w-64"
            />
          </div>
          <SimpleThemeToggle />
        </div>
      </div>
    </header>
  )
}
