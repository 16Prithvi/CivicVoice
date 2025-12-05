import { Stats, Report } from "@/types";

export async function exportStatsToPDF(
  stats: Stats,
  monthlyData: any[],
  categoryData: any[],
  statusData: any[],
  reports: Report[],
  isAdmin: boolean = false
) {
  // Create a new window with formatted content
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CivicVoice Statistics Report</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            color: #1e293b;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0f766e;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #64748b;
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
          }
          .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #0f766e;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table th, table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          table th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #0f766e;
          }
          .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 2px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏙️ CivicVoice Statistics Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>${isAdmin ? "Admin View - All Reports" : "User View - Your Reports"}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Reports</h3>
            <p class="value">${stats.totalReports}</p>
          </div>
          <div class="stat-card">
            <h3>Resolved</h3>
            <p class="value">${stats.resolved}</p>
          </div>
          <div class="stat-card">
            <h3>In Progress</h3>
            <p class="value">${stats.processing}</p>
          </div>
          <div class="stat-card">
            <h3>Resolution Rate</h3>
            <p class="value">${stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 0}%</p>
          </div>
        </div>

        <div class="section">
          <h2>Monthly Trends</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Reported</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyData.map((d) => `
                <tr>
                  <td>${d.month}</td>
                  <td>${d.reported}</td>
                  <td>${d.resolved}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Reports by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${categoryData.map((d) => `
                <tr>
                  <td><span class="category-badge" style="background-color: ${d.color}20; color: ${d.color};">${d.name}</span></td>
                  <td>${d.value}</td>
                  <td>${stats.totalReports > 0 ? Math.round((d.value / stats.totalReports) * 100) : 0}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Status Breakdown by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Reported</th>
                <th>Processing</th>
                <th>Action Taken</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              ${statusData.map((d) => `
                <tr>
                  <td>${d.category}</td>
                  <td>${d.reported}</td>
                  <td>${d.processing}</td>
                  <td>${d.action_taken}</td>
                  <td>${d.resolved}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        ${reports.length > 0 ? `
        <div class="section">
          <h2>Report Details</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Area</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${reports.slice(0, 50).map((r) => `
                <tr>
                  <td>${r.title}</td>
                  <td>${r.category}</td>
                  <td>${r.area || "N/A"}</td>
                  <td>${r.status}</td>
                  <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${reports.length > 50 ? `<p style="color: #64748b; font-size: 12px;">Showing first 50 of ${reports.length} reports</p>` : ""}
        </div>
        ` : ""}

        <div class="footer">
          <p>CivicVoice - Smart Civic Engagement Platform</p>
          <p>This report was generated automatically. For questions, contact support.</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

