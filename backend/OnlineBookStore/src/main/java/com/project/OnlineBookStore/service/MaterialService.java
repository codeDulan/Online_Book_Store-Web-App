package com.project.OnlineBookStore.service;

import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.repository.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final FileStorageService fileStorageService;

    public MaterialService(MaterialRepository materialRepository, FileStorageService fileStorageService) {
        this.materialRepository = materialRepository;
        this.fileStorageService = fileStorageService;
    }

    public Material create(MultipartFile file, Material details) {
        String stored = fileStorageService.storeFile(file);
        details.setFilename(stored);
        return materialRepository.save(details);
    }

    public Material update(Long id, Material update, MultipartFile file) {
        Material existing = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));
        existing.setTitle(update.getTitle());
        existing.setUniversity(update.getUniversity());
        existing.setFaculty(update.getFaculty());
        existing.setStudentYear(update.getStudentYear());
        existing.setCourseModule(update.getCourseModule());

        if (file != null && !file.isEmpty()) {
            // remove old file
            if (existing.getFilename() != null) {
                fileStorageService.delete(existing.getFilename());
            }
            String stored = fileStorageService.storeFile(file);
            existing.setFilename(stored);
        }
        return materialRepository.save(existing);
    }

    public Optional<Material> findById(Long id) {
        return materialRepository.findById(id);
    }

    public List<Material> listAll() {
        return materialRepository.findAll();
    }

    public void delete(Long id) {
        Material m = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));
        if (m.getFilename() != null) {
            fileStorageService.delete(m.getFilename());
        }
        materialRepository.deleteById(id);
    }

    public Path getFilePath(String filename) {
        return fileStorageService.load(filename);
    }

    // Add convenience search methods as needed; call repository directly or expose them here
    public List<Material> findByUniversity(String uni) { return materialRepository.findByUniversityIgnoreCase(uni); }
    public List<Material> findByFaculty(String faculty) { return materialRepository.findByFacultyIgnoreCase(faculty); }
}
