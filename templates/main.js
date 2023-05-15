// import { jsPDF } from "https://unpkg.com/jspdf@2.5.0/dist/jspdf.umd.min.js";
// import html2canvas from "https://unpkg.com/html2canvas@1.3.3/dist/html2canvas.min.js";
// import { jsPDF } from "jspdf";
const jsPDF = window.jspdf.jsPDF


// document.addEventListener("DOMContentLoaded", function () {
//     document.getElementById("get-summary").addEventListener("click", generateSummary);
//   });
  
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    generateSummary();
  });
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);
});

function generateSummary() {
  // Show the loading message and spinner
  document.getElementById("loading-message").style.display = "block";

  var transcript = document.getElementById("transcript").value;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        var jsonResponse;
        try {
          jsonResponse = JSON.parse(xhttp.responseText);
        } catch (e) {
          console.error("Error in JavaScript:", e.message);
          document.getElementById("summary").innerHTML = "An error occurred while generating the summary. Please try again.";
          document.getElementById("summary-container").style.display = "block";
          document.getElementById("loading-message").style.display = "none";
          return;
        }

        // Clear the previous summary content
        const summaryContainer = document.getElementById("summary");
        summaryContainer.innerHTML = '';

        // Split the jsonResponse.summary string into paragraphs
        const paragraphs = jsonResponse.summary.split('\n\n');

        for (let i = 0; i < paragraphs.length; i++) {
          // Check if the paragraph contains a heading, such as "Participants:" or "TL;DR:"
          const headingMatch = paragraphs[i].match(/(.*):/);
          if (headingMatch) {
            const headingText = headingMatch[1];
            const heading = document.createElement('h3');
            heading.className = 'summary-heading';
            heading.textContent = headingText;
            summaryContainer.appendChild(heading);

            const text = paragraphs[i].replace(`${headingText}:`, '').trim();
            const para = document.createElement('p');
            para.textContent = text;
            summaryContainer.appendChild(para);

            // Add the shaded box for the TL;DR section
            if (i === 1) {
              const tldrBox = document.createElement('div');
              tldrBox.className = 'tldr-box';
              tldrBox.appendChild(para);
              summaryContainer.appendChild(tldrBox);
            }
          } else {
            const para = document.createElement('p');
            para.textContent = paragraphs[i];
            summaryContainer.appendChild(para);
          }
        }

        document.getElementById("summary-container").style.display = "block";
      } else {
        console.error("Error in JavaScript:", xhttp.responseText);
        document.getElementById("summary").innerHTML = "An error occurred while generating the summary. Please try again.";
        document.getElementById("summary-container").style.display = "block";
      }

      // Hide the loading message and spinner
      document.getElementById("loading-message").style.display = "none";
    }
  };
  xhttp.open("POST", "/summarize", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("transcript=" + encodeURIComponent(transcript));
}

async function downloadPDF() {
  const summary = document.getElementById("summary").innerHTML;
  const { default: ReactDOMServer } = await import("https://cdn.skypack.dev/react-dom/server");
  const { default: PdfDocument } = await import("./templates/PdfDocument.js");

  const pdfStream = ReactDOMServer.renderToStream(PdfDocument({ summary }));
  const dataUrl = await pdfStream.toDataURL();
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "summary.pdf";
  link.click();
}
