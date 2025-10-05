package com.project.OnlineBookStore.service;

import com.project.OnlineBookStore.dto.MaterialDTO;
import com.project.OnlineBookStore.dto.PurchaseDTO;
import com.project.OnlineBookStore.dto.UserDTO;
import com.project.OnlineBookStore.model.Material;
import com.project.OnlineBookStore.model.Purchase;
import com.project.OnlineBookStore.model.User;

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

    public UserDTO convUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
    }

    public PurchaseDTO convertToPurchaseDTO(Purchase purchase) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setId(purchase.getId());
        dto.setUser(convUserDTO(purchase.getUser()));
        dto.setMaterial(convertToMaterialDTO(purchase.getMaterial(), true));
        dto.setPurchasePrice(purchase.getPurchasePrice());
        dto.setPurchaseDate(purchase.getPurchaseDate());
        dto.setStatus(purchase.getStatus());
        return dto;
    }
}