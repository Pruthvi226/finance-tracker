package com.financetracker.backend.service;

import com.financetracker.backend.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(Long userId, CategoryDto categoryDto);
    CategoryDto updateCategory(Long userId, Long id, CategoryDto categoryDto);
    void deleteCategory(Long userId, Long id);
    List<CategoryDto> getUserCategories(Long userId);
}
