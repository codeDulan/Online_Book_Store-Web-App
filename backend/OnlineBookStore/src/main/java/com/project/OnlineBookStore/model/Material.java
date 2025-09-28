package com.project.OnlineBookStore.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "materials")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String university;
    private String faculty;

    // e.g., 1, 2, 3, 4
    private Integer studentYear;

    private String courseModule;

    // stored filename on disk
    private String filename;

    private Instant uploadedAt;

}

