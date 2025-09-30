package com.project.OnlineBookStore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MaterialDTO {
    private Long id;
    private String title;
    private String university;
    private String faculty;
    private Integer studentYear;
    private String courseModule;
    private Double price;
    private Instant uploadedAt;
    private Boolean purchased; // Whether current user has purchased this material
}