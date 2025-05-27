import { Calendar, Home, ImagePlus, Inbox, Search, Settings, Settings2 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth-actions"

// Menu items.
const items = [
    {
        title: "art",
        url: "/admin/dashboard/art",
    },
    {
        title: "music",
        url: "/admin/dashboard/music",
    },
    {
        title: "shop",
        url: "#",
    },
    {
        title: "insights",
        url: "#"
    }
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="text-4xl">dashboard</SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <span className={`${item.url === "#" ? "text-gray-500" : "text-foreground"} text-2xl`}>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Settings />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={logoutAction}>
                                        logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarFooter>
        </Sidebar>
    )
}
