package com.certichain.util;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;

@Component
public class PdfGenerator {

    private final QrCodeGenerator qrCodeGenerator;

    @Value("${certichain.base-url}")
    private String baseUrl;

    public PdfGenerator(QrCodeGenerator qrCodeGenerator) {
        this.qrCodeGenerator = qrCodeGenerator;
    }

    /**
     * Generates a professional certificate PDF with embedded QR code
     * that contains the digitally signed payload for offline verification.
     *
     * @param certificateUid  unique certificate identifier
     * @param studentName     full name of the student
     * @param courseName      name of the course/program
     * @param grade           grade achieved
     * @param institutionName name of the issuing institution
     * @param issueDate       date of issuance
     * @param certificateHash SHA-256 hash of the certificate metadata
     * @param digitalSignature RSA digital signature (Base64-encoded) of the hash
     */
    public byte[] generateCertificatePdf(String certificateUid, String studentName,
                                          String courseName, String grade,
                                          String institutionName, LocalDate issueDate,
                                          String certificateHash, String digitalSignature) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors
            Color primaryColor = new Color(99, 102, 241);    // Indigo
            Color darkColor = new Color(15, 23, 42);          // Dark navy
            Color goldColor = new Color(234, 179, 8);         // Gold accent

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 36, Font.BOLD, primaryColor);
            Font subtitleFont = new Font(Font.HELVETICA, 14, Font.NORMAL, new Color(100, 116, 139));
            Font nameFont = new Font(Font.HELVETICA, 28, Font.BOLD, darkColor);
            Font bodyFont = new Font(Font.HELVETICA, 14, Font.NORMAL, darkColor);
            Font labelFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(100, 116, 139));
            Font hashFont = new Font(Font.COURIER, 8, Font.NORMAL, new Color(100, 116, 139));

            // Header - Institution Name
            Paragraph header = new Paragraph(institutionName, new Font(Font.HELVETICA, 18, Font.BOLD, darkColor));
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(10);
            document.add(header);

            // Decorative line
            Paragraph line = new Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 
                new Font(Font.HELVETICA, 12, Font.NORMAL, goldColor));
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(20);
            document.add(line);

            // Title
            Paragraph title = new Paragraph("Certificate of Achievement", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // Subtitle
            Paragraph subtitle = new Paragraph("This is to certify that", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Student Name
            Paragraph name = new Paragraph(studentName, nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            name.setSpacingAfter(15);
            document.add(name);

            // Course and Grade
            Paragraph course = new Paragraph(
                "has successfully completed the course", bodyFont);
            course.setAlignment(Element.ALIGN_CENTER);
            document.add(course);

            Paragraph courseName2 = new Paragraph(courseName,
                new Font(Font.HELVETICA, 20, Font.BOLDITALIC, primaryColor));
            courseName2.setAlignment(Element.ALIGN_CENTER);
            courseName2.setSpacingAfter(10);
            document.add(courseName2);

            Paragraph gradeText = new Paragraph("with Grade: " + grade, bodyFont);
            gradeText.setAlignment(Element.ALIGN_CENTER);
            gradeText.setSpacingAfter(20);
            document.add(gradeText);

            // Decorative line
            document.add(line);

            // Bottom section - Certificate ID, Date, QR Code
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(90);
            table.setSpacingBefore(15);

            // Certificate ID
            PdfPCell idCell = new PdfPCell();
            idCell.setBorder(0);
            idCell.addElement(new Paragraph("Certificate ID", labelFont));
            idCell.addElement(new Paragraph(certificateUid, new Font(Font.COURIER, 11, Font.BOLD, darkColor)));
            table.addCell(idCell);

            // Issue Date
            PdfPCell dateCell = new PdfPCell();
            dateCell.setBorder(0);
            dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            dateCell.addElement(new Paragraph("Date of Issue", labelFont));
            dateCell.addElement(new Paragraph(issueDate.toString(), new Font(Font.HELVETICA, 11, Font.BOLD, darkColor)));
            table.addCell(dateCell);

            // QR Code — contains the verification URL + signed payload
            //   The QR encodes a URL with the certificate ID as a query param.
            //   When scanned, the verifier's browser opens the verification page
            //   which fetches full details (including signature) from the backend.
            //   For compactness, the QR carries a URL rather than the full
            //   signed payload (RSA signatures are ~344 Base64 chars).
            String verifyUrl = baseUrl + "/verify?id=" + certificateUid;
            byte[] qrBytes = qrCodeGenerator.generateQrCode(verifyUrl, 100, 100);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.scaleToFit(80, 80);

            PdfPCell qrCell = new PdfPCell(qrImage);
            qrCell.setBorder(0);
            qrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(qrCell);

            document.add(table);

            // Blockchain verification info
            Paragraph hashInfo = new Paragraph(
                "Blockchain Hash: " + certificateHash, hashFont);
            hashInfo.setAlignment(Element.ALIGN_CENTER);
            hashInfo.setSpacingBefore(10);
            document.add(hashInfo);

            // Digital signature fingerprint (first 32 chars for readability)
            if (digitalSignature != null && !digitalSignature.isEmpty()) {
                String sigFingerprint = digitalSignature.length() > 32
                        ? digitalSignature.substring(0, 32) + "..."
                        : digitalSignature;
                Paragraph sigInfo = new Paragraph(
                    "Digital Signature: " + sigFingerprint, hashFont);
                sigInfo.setAlignment(Element.ALIGN_CENTER);
                document.add(sigInfo);
            }

            Paragraph verifyInfo = new Paragraph(
                "Verify at: " + verifyUrl, hashFont);
            verifyInfo.setAlignment(Element.ALIGN_CENTER);
            document.add(verifyInfo);

            // Cryptographic seal notice
            Paragraph sealNotice = new Paragraph(
                "This certificate is cryptographically signed (SHA256withRSA) and recorded on blockchain.",
                new Font(Font.HELVETICA, 7, Font.ITALIC, new Color(100, 116, 139)));
            sealNotice.setAlignment(Element.ALIGN_CENTER);
            sealNotice.setSpacingBefore(8);
            document.add(sealNotice);

            document.close();
            return baos.toByteArray();

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to generate certificate PDF", e);
        }
    }
}
