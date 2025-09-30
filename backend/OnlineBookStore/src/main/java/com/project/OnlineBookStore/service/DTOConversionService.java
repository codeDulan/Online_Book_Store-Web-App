package com.project.OnlineBookStore.service;

import com.project.OnlineBookStore.dto.MaterialDTO;
import com.project.OnlineBookStore.dto.PurchaseDTO;
import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.model.Purchase;
import org.springframework.stereotype.Service;

@Service
public class DTOConversionService {

    public MaterialDTO convertToMaterialDTO(Material material, boolean purchased) {
        MaterialDTO dto = new MaterialDTO();
        dto.setId(material.getId());
        dto.setTitle(material.getTitle());
        dto.setUniversity(material.getUniversity());
        dto.setFaculty(material.getFaculty());
        dto.setStudentYear(material.getStudentYear());
        dto.setCourseModule(material.getCourseModule());
        dto.setPrice(material.getPrice());
        dto.setUploadedAt(material.getUploadedAt());
        dto.setPurchased(purchased);
        return dto;
    }

    public PurchaseDTO convertToPurchaseDTO(Purchase purchase) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(purchase.getId());
        dto.setMaterial(convertToMaterialDTO(purchase.getMaterial(), true));
        dto.setPurchasePrice(purchase.getPurchasePrice());
        dto.setPurchaseDate(purchase.getPurchaseDate());
        dto.setStatus(purchase.getStatus());
        return dto;
    }
}