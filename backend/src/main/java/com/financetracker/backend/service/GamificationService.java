package com.financetracker.backend.service;

import com.financetracker.backend.entity.Achievement;
import com.financetracker.backend.entity.Transaction;
import com.financetracker.backend.repository.AchievementRepository;
import com.financetracker.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GamificationService {

    private final AchievementRepository achievementRepository;
    private final TransactionRepository transactionRepository;

    public GamificationService(AchievementRepository achievementRepository, TransactionRepository transactionRepository) {
        this.achievementRepository = achievementRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Achievement> getAchievements(Long userId) {
        return achievementRepository.findByUserId(userId);
    }

    public int calculateSavingsStreak(Long userId) {
        List<Transaction> txs = transactionRepository.findByUserIdOrderByDateDesc(userId);
        if (txs.isEmpty()) return 0;

        Set<LocalDate> activeDays = new HashSet<>();
        for (Transaction t : txs) {
            activeDays.add(t.getDate());
        }

        int streak = 0;
        LocalDate current = LocalDate.now();
        
        // If no transaction today, check yesterday
        if (!activeDays.contains(current)) {
            current = current.minusDays(1);
        }

        while (activeDays.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        // Check for new achievements
        checkAndAwardAchievements(userId, streak);

        return streak;
    }

    private void checkAndAwardAchievements(Long userId, int streak) {
        if (streak >= 7) {
            awardIfMissing(userId, "STREAK_7", "7-Day Warrior", "You maintained a 7-day tracking streak!");
        }
        if (streak >= 30) {
            awardIfMissing(userId, "STREAK_30", "Monthly Master", "A full month of financial discipline!");
        }
    }

    private void awardIfMissing(Long userId, String type, String name, String desc) {
        List<Achievement> existing = achievementRepository.findByUserId(userId);
        boolean hasIt = existing.stream().anyMatch(a -> a.getType().equals(type));
        
        if (!hasIt) {
            Achievement a = new Achievement();
            a.setUserId(userId);
            a.setType(type);
            a.setName(name);
            a.setDescription(desc);
            a.setEarnedAt(LocalDateTime.now());
            achievementRepository.save(a);
        }
    }
}
