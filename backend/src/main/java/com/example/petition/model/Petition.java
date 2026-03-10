package com.example.petition.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "petitions")
public class Petition {
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Target signature count is required")
    @Positive(message = "Target signature count must be positive")
    private Integer targetSignatures;
    
    private Integer signatureCount = 0;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private List<Signature> signatures = new ArrayList<>();
} 