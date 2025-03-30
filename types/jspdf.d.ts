/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { jsPDF } from "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable(options: {
      startY?: number;
      head: (string | number)[][];
      body: (string | number)[][];
      styles?: { fontSize?: number; cellPadding?: number; overflow?: string };
      headStyles?: { fillColor?: [number, number, number]; textColor?: [number, number, number]; fontStyle?: string };
      columnStyles?: { [key: number]: { cellWidth?: number; halign?: string; valign?: string } };
      didParseCell?: (data: any) => void;
    }): void;
  }
}