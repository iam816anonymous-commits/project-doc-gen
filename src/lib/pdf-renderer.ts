import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  title: string;
  university: string;
  studentName: string;
  academicLevel: string;
  sections: Record<string, string>;
  techStack: string;
}

export async function generateProfessionalPDF(data: ReportData) {
  const doc = new jsPDF();
  const { title, university, studentName, academicLevel, sections } = data;

  // 1. Cover Page
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT REPORT', 105, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.text('On', 105, 55, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(0, 51, 153);
  doc.text(title.toUpperCase(), 105, 75, { align: 'center', maxWidth: 170 });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Submitted in partial fulfillment of the requirements for the award of', 105, 110, { align: 'center' });
  doc.text(`${academicLevel} Degree`, 105, 120, { align: 'center' });

  doc.text('Submitted By:', 105, 160, { align: 'center' });
  doc.setFontSize(16);
  doc.text(studentName || 'Student Name', 105, 170, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Under the Guidance of:', 105, 200, { align: 'center' });
  doc.text('Project Guide Name', 105, 210, { align: 'center' });

  doc.text(university, 105, 260, { align: 'center' });
  doc.addPage();

  // 2. Certificate & Declaration (Placeholders)
  doc.setFontSize(18);
  doc.text('CERTIFICATE', 105, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`This is to certify that the project entitled "${title}" is a bonafide work carried out by ${studentName} under our supervision...`, 20, 50, { maxWidth: 170 });
  doc.addPage();

  // 3. Table of Contents
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', 20, 30);
  let y = 50;
  const tocSections = Object.keys(sections);
  tocSections.forEach((s, i) => {
     doc.setFontSize(12);
     doc.text(`${i+1}. ${s}`, 20, y);
     doc.text('.....', 160, y);
     y += 10;
  });
  doc.addPage();

  // 4. Content Sections
  tocSections.forEach((sectionName) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(sectionName, 20, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const content = sections[sectionName];
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 45);
    doc.addPage();
  });

  return doc.output('arraybuffer');
}
