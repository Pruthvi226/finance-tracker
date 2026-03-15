package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.CategoryDto;
import com.financetracker.backend.entity.Category;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.CategoryRepository;
import com.financetracker.backend.service.CategoryService;
import com.financetracker.backend.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public CategoryServiceImpl(CategoryRepository categoryRepository, UserService userService) {
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        User user = userService.getCurrentUserEntity();
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setColor(categoryDto.getColor() != null ? categoryDto.getColor() : "#000000");
        category.setUser(user);
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot update system categories or other users' categories");
        }

        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setColor(categoryDto.getColor() != null ? categoryDto.getColor() : "#000000");
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        User user = userService.getCurrentUserEntity();

        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete system categories or other users' categories");
        }
        categoryRepository.delete(category);
    }

    @Override
    public List<CategoryDto> getUserCategories() {
        User user = userService.getCurrentUserEntity();
        List<Category> categories = categoryRepository.findByUserIdOrUserIsNull(user.getId());
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
