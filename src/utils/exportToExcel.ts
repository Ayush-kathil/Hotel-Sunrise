export const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
  );
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};