/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import SoutenanceTable from "../../components/ListeSoutenances/SoutenanceTable"

interface Soutenance {
  id: number
  date: string
  time: string
  location: string
  groupe: string
  juryNames: string | string[]
  status: string
}

export default function ListeSoutenances() {
  const router = useRouter()
  const [soutenances, setSoutenances] = useState<Soutenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSoutenances = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/soutenance")
        if (!response.ok) {
          throw new Error("Failed to fetch soutenances")
        }
        const data = await response.json()
        setSoutenances(data)
      } catch (err: any) {
        setError(err?.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchSoutenances()
  }, [])



  const handleEdit = (id: number) => {
    router.push(`/edit-soutenance/${id}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="w-full bg-[#EFEFEE] border-[#b17a56]/10 shadow-md">
      
      <SoutenanceTable soutenances={soutenances} onEdit={handleEdit} />
    </div>
  )
}
