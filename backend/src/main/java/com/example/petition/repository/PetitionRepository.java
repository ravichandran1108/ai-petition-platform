package com.example.petition.repository;

import com.example.petition.model.Petition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PetitionRepository extends MongoRepository<Petition, String> {
    // Custom queries can be added here if needed
} 