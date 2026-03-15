package com.financetracker.backend.service;

import com.financetracker.backend.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
    List<CategoryDto> getUserCategories();
}
