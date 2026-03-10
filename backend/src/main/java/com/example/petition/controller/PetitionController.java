package com.example.petition.controller;

import com.example.petition.model.Petition;
import com.example.petition.model.Signature;
import com.example.petition.repository.PetitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/petitions")
public class PetitionController {

    // Using in-memory storage since MongoDB might not be available
    private final Map<String, Petition> petitions = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    // Constructor to initialize with some sample data
    public PetitionController() {
        // Add some sample petitions
        Petition petition1 = new Petition();
        petition1.setId(String.valueOf(idCounter.getAndIncrement()));
        petition1.setTitle("Save the Local Park");
        petition1.setDescription("Our local park is in danger of being sold to developers. Sign this petition to protect this vital green space that serves our community.");
        petition1.setTargetSignatures(1000);
        petition1.setSignatureCount(245);
        petition1.setCreatedAt(LocalDateTime.now().minusDays(5));
        
        Petition petition2 = new Petition();
        petition2.setId(String.valueOf(idCounter.getAndIncrement()));
        petition2.setTitle("Improve Public Transport");
        petition2.setDescription("We need more frequent bus services in our town. Sign to show your support for better public transport options.");
        petition2.setTargetSignatures(500);
        petition2.setSignatureCount(127);
        petition2.setCreatedAt(LocalDateTime.now().minusDays(10));
        
        Petition petition3 = new Petition();
        petition3.setId(String.valueOf(idCounter.getAndIncrement()));
        petition3.setTitle("Fund School Music Programs");
        petition3.setDescription("Music education is being cut from schools due to budget constraints. Sign to support continued funding for school music programs.");
        petition3.setTargetSignatures(2000);
        petition3.setSignatureCount(1568);
        petition3.setCreatedAt(LocalDateTime.now().minusDays(15));
        
        petitions.put(petition1.getId(), petition1);
        petitions.put(petition2.getId(), petition2);
        petitions.put(petition3.getId(), petition3);
    }

    // Get all petitions
    @GetMapping
    public List<Petition> getAllPetitions() {
        return new ArrayList<>(petitions.values());
    }

    // Get a petition by ID
    @GetMapping("/{id}")
    public ResponseEntity<Petition> getPetitionById(@PathVariable String id) {
        Petition petition = petitions.get(id);
        if (petition == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Petition not found with id: " + id);
        }
        return ResponseEntity.ok(petition);
    }

    // Create a new petition
    @PostMapping
    public ResponseEntity<Petition> createPetition(@Valid @RequestBody Petition petition) {
        petition.setId(String.valueOf(idCounter.getAndIncrement()));
        petition.setCreatedAt(LocalDateTime.now());
        petition.setSignatureCount(0);
        petition.setSignatures(new ArrayList<>());
        
        petitions.put(petition.getId(), petition);
        return ResponseEntity.status(HttpStatus.CREATED).body(petition);
    }

    // Sign a petition
    @PostMapping("/{id}/sign")
    public ResponseEntity<Petition> signPetition(@PathVariable String id, @Valid @RequestBody Signature signature) {
        Petition petition = petitions.get(id);
        if (petition == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Petition not found with id: " + id);
        }
        
        // Add the signature to the petition
        signature.setSignedAt(LocalDateTime.now());
        petition.getSignatures().add(signature);
        
        // Increment the signature count
        petition.setSignatureCount(petition.getSignatureCount() + 1);
        
        return ResponseEntity.ok(petition);
    }

    // Delete a petition
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePetition(@PathVariable String id) {
        if (!petitions.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Petition not found with id: " + id);
        }
        
        petitions.remove(id);
        return ResponseEntity.noContent().build();
    }
} 