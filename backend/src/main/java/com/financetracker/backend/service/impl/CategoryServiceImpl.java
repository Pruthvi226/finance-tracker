package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.CategoryDto;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final com.financetracker.backend.repository.UserRepository userRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, com.financetracker.backend.repository.UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CategoryDto createCategory(Long userId, CategoryDto categoryDto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setColor(categoryDto.getColor() != null ? categoryDto.getColor() : "#000000");
        category.setUser(user);
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Override
    public CategoryDto updateCategory(Long userId, Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot update system categories or other users' categories");
        }

        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setColor(categoryDto.getColor() != null ? categoryDto.getColor() : "#000000");
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Override
    public void deleteCategory(Long userId, Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot delete system categories or other users' categories");
        }
        categoryRepository.delete(category);
    }

    @Override
    public List<CategoryDto> getUserCategories(Long userId) {
        List<Category> categories = categoryRepository.findByUserIdOrUserIsNull(userId);
        return categories.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setType(category.getType());
        dto.setColor(category.getColor());
        dto.setSystemDefault(category.getUser() == null);
        return dto;
    }
}
