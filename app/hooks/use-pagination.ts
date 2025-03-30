"use client"

import { useState, useEffect } from "react"

interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage: number
  initialPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedData: T[]
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToPage: (page: number) => void
}

export function usePagination<T>({
  data,
  itemsPerPage,
  initialPage = 0,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [paginatedData, setPaginatedData] = useState<T[]>([])
  const [totalPages, setTotalPages] = useState(Math.ceil(data.length / itemsPerPage) || 1)

  useEffect(() => {
    // Calculate total pages
    const calculatedTotalPages = Math.ceil(data.length / itemsPerPage) || 1
    setTotalPages(calculatedTotalPages)

    // Adjust current page if it exceeds the new total
    if (currentPage >= calculatedTotalPages && data.length > 0) {
      setCurrentPage(0)
    }

    // Update paginated data
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedData(data.slice(startIndex, endIndex))
  }, [data, currentPage, itemsPerPage])

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page)
    }
  }

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  }
}

