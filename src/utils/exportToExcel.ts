// src/utils/exportToExcel.ts
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // 1. Extract Headers
  const headers = Object.keys(data[0]).join(",");

  // 2. Convert Rows
  const rows = data.map(row => 
    Object.values(row).map(value => {
      // Handle commas inside text (like addresses) by wrapping in quotes
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`; 
    }).join(",")
  );

  // 3. Combine
  const csvContent = [headers, ...rows].join("\n");

  // 4. Create Download Link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};