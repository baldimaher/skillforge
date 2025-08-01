"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useEffect } from "react";

interface CertificateProps {
  user: { firstName: string; lastName: string };
  quizTitle: string;
  score: number;
}
export default function Certificate({ user, quizTitle, score }: CertificateProps) {
  const date = new Date().toLocaleDateString("fr-FR");

  useEffect(() => {
    console.log("Certificate rendered with:", { user, quizTitle, score });
  }, [user, quizTitle, score]);

  const downloadCertificate = () => {
    const certificateElement = document.querySelector(".certificate") as HTMLElement;
    if (!certificateElement) {
      alert("Erreur : Impossible de trouver le certificat.");
      return;
    }

    html2canvas(certificateElement, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        doc.save(`${quizTitle}_certificate.pdf`);
      })
      .catch((err) => {
        console.error("Erreur lors de la génération du PDF:", err);
        alert("Erreur lors de la génération du PDF.");
      });
  };

  const certificateHtml = `
    <div class="certificate">
      <div class="certificate-content">
        <h1>🏆 Certificat de Réussite 🏆</h1>
        <div class="decorative-border">
          <p style="font-size: 1.2em; color: #6b7280; margin: 0;">Ceci certifie que</p>
          <div class="recipient-name">${user.firstName} ${user.lastName}</div>
          <p style="font-size: 1.2em; color: #6b7280; margin: 0;">a réussi avec succès le quiz</p>
          <div class="quiz-title">"${quizTitle}"</div>
          <div class="score">Score obtenu: ${score}%</div>
          <div class="date">Délivré le ${date}</div>
          <div class="buttons">
            <button class="print-button" onclick="window.print()">🖨️ Imprimer le certificat</button>
            <button onclick="downloadCertificate()">📄 Télécharger en PDF</button>
          </div>
        </div>
      </div>
    </div>
  `;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: certificateHtml }}
      className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto text-center mt-8 border border-indigo-200"
    />
  );
}

export function openCertificateInNewTab(
  user: { firstName: string; lastName: string },
  quizTitle: string,
  score: number
) {
  const date = new Date().toLocaleDateString("fr-FR");

  const certificateHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificat de Réussite - ${quizTitle}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 600px;
          width: 100%;
          border: 8px solid #4f46e5;
          position: relative;
          overflow: hidden;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(79, 70, 229, 0.1), transparent);
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        .certificate-content {
          position: relative;
          z-index: 2;
        }
        h1 {
          color: #4f46e5;
          font-size: 2.5em;
          margin-bottom: 30px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .recipient-name {
          font-size: 2em;
          color: #4f46e5;
          font-weight: bold;
          margin: 20px 0;
          text-decoration: underline;
        }
        .quiz-title {
          font-size: 1.5em;
          color: #6366f1;
          font-weight: 600;
          margin: 20px 0;
          font-style: italic;
        }
        .score {
          font-size: 1.8em;
          color: #059669;
          font-weight: bold;
          margin: 20px 0;
        }
        .date {
          color: #6b7280;
          font-size: 1.1em;
          margin: 20px 0;
        }
        .decorative-border {
          border: 3px solid #4f46e5;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .buttons {
          margin-top: 20px;
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }
        .print-button {
          background: #059669;
        }
        .print-button:hover {
          background: #047857;
        }
        @media print {
          body { background: white; padding: 0; }
          .certificate { box-shadow: none; border: 2px solid #4f46e5; }
          .buttons { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="certificate-content">
          <h1>🏆 Certificat de Réussite 🏆</h1>
          <div class="decorative-border">
            <p style="font-size: 1.2em; color: #6b7280; margin: 0;">Ceci certifie que</p>
            <div class="recipient-name">${user.firstName} ${user.lastName}</div>
            <p style="font-size: 1.2em; color: #6b7280; margin: 0;">a réussi avec succès le quiz</p>
            <div class="quiz-title">"${quizTitle}"</div>
            <div class="score">Score obtenu: ${score}%</div>
            <div class="date">Délivré le ${date}</div>
            <div class="buttons">
              <button class="print-button" onclick="window.print()">🖨️ Imprimer le certificat</button>
              <button onclick="downloadCertificate()">📄 Télécharger en PDF</button>
            </div>
          </div>
        </div>
      </div>
      <script>
        function downloadCertificate() {
          const certificate = document.querySelector('.certificate');
          html2canvas(certificate, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4'
            });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            doc.save('${quizTitle}_certificate.pdf');
          }).catch(err => {
            console.error('Erreur lors de la génération du PDF:', err);
            alert('Erreur lors de la génération du PDF.');
          });
        }
      </script>
    </body>
    </html>
  `;

  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(certificateHtml);
    newWindow.document.close();
  } else {
    console.error("Failed to open new window");
  }
}