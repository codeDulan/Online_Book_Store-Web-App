package com.project.OnlineBookStore.repository;

import com.project.OnlineBookStore.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByUniversityIgnoreCase(String university);
    List<Material> findByFacultyIgnoreCase(String faculty);
    List<Material> findByStudentYear(Integer studentYear);
    List<Material> findByCourseModuleIgnoreCase(String courseModule);
}
