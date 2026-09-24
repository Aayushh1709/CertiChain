package com.certichain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IssueCertificateRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    private String studentRollNo;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotBlank(message = "Issue date is required")
    private String issueDate; // yyyy-MM-dd

    public IssueCertificateRequest() {}

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNo() { return studentRollNo; }
    public void setStudentRollNo(String studentRollNo) { this.studentRollNo = studentRollNo; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }
}
