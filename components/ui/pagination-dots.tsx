"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationDotsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationDots({ currentPage, totalPages, onPageChange, className = "" }: PaginationDotsProps) {
  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      onPageChange(pageIndex)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1)
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className={`w-full flex justify-center items-center my-6 ${className}`}>
      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#5b8cb5]/10"
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`rounded-full w-3 h-3 p-0 min-w-0 ${
                index === currentPage ? "bg-[#5b8cb5] hover:bg-[#5b8cb5]" : "bg-[#5b8cb5]/30 hover:bg-[#5b8cb5]/50"
              }`}
              onClick={() => goToPage(index)}
            >
              <span className="sr-only">Page {index + 1}</span>
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#5b8cb5]/10"
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

