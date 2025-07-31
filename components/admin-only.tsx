// components/admin-only.tsx
"use client"

import { ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth"

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const user = getCurrentUser()
  
  if (user?.role !== 'ADMIN') {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Usage example:
/*
import AdminOnly from "@/components/admin-only"
import { Plus } from "lucide-react"

function YourComponent() {
  return (
    <div>
      <AdminOnly>
        <button className="flex items-center space-x-2 bg-gray-600/80 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span>ADMIN BUTTON</span>
        </button>
      </AdminOnly>
    </div>
  )
}
*/